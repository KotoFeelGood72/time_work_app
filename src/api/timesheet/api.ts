// API методы для работы с табелем учета рабочего времени

import { requestWrapper } from '../index'
import type { BitrixTimesheetRaw, BitrixDepartmentRaw } from './dto'
import { TransformTimesheet } from './transform'
import type {
  TimesheetData,
  TimesheetFilters,
  Department,
} from '@/entities/timesheet-entities'

/**
 * Получить табель учета рабочего времени
 * Использует метод Bitrix24 API для получения данных табеля
 * Документация: https://apidocs.bitrix24.ru/api-reference/index.html
 */
export const fetchTimesheet = async (
  filters: TimesheetFilters
): Promise<TimesheetData> => {
  // Формируем параметры запроса
  const requestParams: Record<string, unknown> = {
    filter: {},
  }

  // Добавляем фильтры по дате
  if (filters.month && filters.year) {
    const startDate = new Date(filters.year, filters.month - 1, 1)
    const endDate = new Date(filters.year, filters.month, 0)

    requestParams.filter = {
      ...(requestParams.filter as Record<string, unknown>),
      '>=DATE_START': startDate.toISOString().split('T')[0],
      '<=DATE_START': endDate.toISOString().split('T')[0],
    }
  }

  // Фильтр по подразделению
  if (filters.departmentId) {
    requestParams.filter = {
      ...(requestParams.filter as Record<string, unknown>),
      UF_DEPARTMENT: filters.departmentId,
    }
  }

  // Пробуем разные методы timeman в зависимости от доступности
  // Сначала пробуем timeman.status.get (получение статуса учета времени)
  try {
    return await requestWrapper<BitrixTimesheetRaw[], TimesheetData>(
      'timeman.status.get',
      requestParams,
      TransformTimesheet.fromDTOArray
    )
  } catch (error) {
    // Если timeman.status.get не работает, пробуем получить данные через задачи
    // или возвращаем пустую структуру
    console.warn('Метод timeman.status.get недоступен, используем альтернативный подход', error)

    // Получаем пользователей для формирования базовой структуры табеля
    const userFilter: Record<string, unknown> = { ACTIVE: true }
    if (filters.departmentId && filters.departmentId !== '0') {
      userFilter.UF_DEPARTMENT = filters.departmentId
    }

    interface UserForTimesheet {
      ID: string
      NAME?: string
      LAST_NAME?: string
    }

    const users = await requestWrapper<UserForTimesheet[], UserForTimesheet[]>(
      'user.get',
      {
        filter: userFilter,
        select: ['ID', 'NAME', 'LAST_NAME'],
      },
      (result) => result
    )

    // Формируем базовую структуру табеля без данных о времени
    return {
      departmentId: filters.departmentId,
      departmentName: filters.departmentName || 'Все подразделения',
      month: filters.month || new Date().getMonth() + 1,
      year: filters.year || new Date().getFullYear(),
      employees: users.map((user) => ({
        employeeId: user.ID,
        employeeName: `${user.NAME || ''} ${user.LAST_NAME || ''}`.trim() || user.ID,
        employeeCode: `#${user.ID}`,
        entries: {},
        totalHours: 0,
        totalMinutes: 0,
      })),
      workingDays: 0,
      dailyTotals: {},
      grandTotal: { hours: 0, minutes: 0 },
    }
  }
}

/**
 * Получить список подразделений
 * Использует метод department.get из Bitrix24 API
 * Документация: https://apidocs.bitrix24.ru/api-reference/departments/department-get.html
 */
export const fetchDepartments = async (): Promise<Department[]> => {
  try {
    // Метод department.get может возвращать объект с подразделениями или массив
    // Пробуем получить все подразделения
    const result = await requestWrapper<Record<string, BitrixDepartmentRaw> | BitrixDepartmentRaw[], Department[]>(
      'department.get',
      {},
      (data) => {
        // Обрабатываем разные форматы ответа
        if (Array.isArray(data)) {
          return TransformTimesheet.departmentsFromDTO(data)
        } else if (typeof data === 'object' && data !== null) {
          // Если ответ - объект, преобразуем его в массив
          const departmentsArray = Object.values(data).filter(
            (item): item is BitrixDepartmentRaw =>
              typeof item === 'object' && item !== null && 'ID' in item && 'NAME' in item
          )
          return TransformTimesheet.departmentsFromDTO(departmentsArray)
        }
        return []
      }
    )

    // Добавляем опцию "По всей компании" в начало списка
    return [
      { id: '0', name: 'По всей компании' },
      ...result,
    ]
  } catch (error) {
    console.error('Ошибка получения подразделений через department.get:', error)

    // Fallback: получаем подразделения из пользователей
    try {
      interface UserWithDepartment {
        ID: string
        UF_DEPARTMENT?: string | string[]
      }

      const users = await requestWrapper<UserWithDepartment[], UserWithDepartment[]>(
        'user.get',
        {
          filter: { ACTIVE: true },
          select: ['ID', 'UF_DEPARTMENT'],
        },
        (result) => result
      )

      const departmentsMap = new Map<string, string>()

      users.forEach((user) => {
        if (user.UF_DEPARTMENT && Array.isArray(user.UF_DEPARTMENT)) {
          user.UF_DEPARTMENT.forEach((deptId: string) => {
            if (deptId && !departmentsMap.has(deptId)) {
              departmentsMap.set(deptId, deptId)
            }
          })
        } else if (user.UF_DEPARTMENT && typeof user.UF_DEPARTMENT === 'string') {
          const deptId = user.UF_DEPARTMENT
          if (deptId && !departmentsMap.has(deptId)) {
            departmentsMap.set(deptId, deptId)
          }
        }
      })

      const departments: Department[] = Array.from(departmentsMap.entries()).map(([id]) => ({
        id,
        name: id,
      }))

      return [
        { id: '0', name: 'По всей компании' },
        ...departments,
      ]
    } catch (fallbackError) {
      console.error('Ошибка получения подразделений через fallback:', fallbackError)
      return [{ id: '0', name: 'По всей компании' }]
    }
  }
}

