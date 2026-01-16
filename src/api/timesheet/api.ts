// API методы для работы с табелем учета рабочего времени

import { requestWrapper } from '../index'
import type { BitrixDepartmentRaw } from './dto'
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

  // Пробуем использовать методы timeman для получения данных о времени работы
  // Согласно документации Bitrix24:
  // - timeman.status - получить информацию о текущем рабочем дне пользователя
  // - timeman.schedule.get - получить рабочий график по ID (требует параметр {id})
  // Документация: https://apidocs.bitrix24.ru/api-reference/index.html

  // Пробуем timeman.status для получения информации о текущем рабочем дне пользователя
  // Этот метод возвращает информацию о текущем рабочем дне текущего пользователя
  try {
    interface TimemanStatusData {
      [key: string]: unknown
    }

    const statusData = await requestWrapper<TimemanStatusData, TimemanStatusData>(
      'timeman.status',
      {},
      (result) => result
    )

    if (statusData) {
      console.info('Получены данные о рабочем дне через timeman.status:', statusData)
      // timeman.status возвращает данные о текущем рабочем дне текущего пользователя
      // Для получения данных всех пользователей нужно вызывать для каждого отдельно
      // Пока используем fallback для получения полной структуры табеля
    }
  } catch (statusError) {
    const errorMessage = statusError instanceof Error ? statusError.message : String(statusError)
    if (!errorMessage.includes('404') && !errorMessage.includes('METHOD_NOT_FOUND')) {
      console.warn('Ошибка при вызове timeman.status:', statusError)
    }
  }

  // Если методы timeman не вернули нужные данные, используем альтернативный подход
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

/**
 * Получить список подразделений
 * Использует метод department.get из Bitrix24 API
 * Документация: https://apidocs.bitrix24.ru/api-reference/departments/department-get.html
 * Метод может вызывать любой пользователь согласно документации
 */
export const fetchDepartments = async (): Promise<Department[]> => {
  try {
    // Согласно документации, метод department.get поддерживает параметры:
    // - sort: поле для сортировки (ID, NAME, SORT, PARENT, UF_HEAD)
    // - order: направление сортировки (ASC, DESC)
    // - ID: фильтр по идентификатору подразделения
    const result = await requestWrapper<BitrixDepartmentRaw[], Department[]>(
      'department.get',
      {
        sort: 'SORT', // Сортировка по порядку сортировки
        order: 'ASC', // По возрастанию
      },
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
    console.warn('Ошибка получения подразделений через department.get, используем fallback:', error)

    // Fallback: получаем подразделения из пользователей
    // Это работает, так как user.get не требует дополнительных прав
    try {
      interface UserWithDepartment {
        ID: string
        UF_DEPARTMENT?: string | string[]
        UF_DEPARTMENT_NAME?: string | string[]
      }

      const users = await requestWrapper<UserWithDepartment[], UserWithDepartment[]>(
        'user.get',
        {
          filter: { ACTIVE: true },
          select: ['ID', 'UF_DEPARTMENT', 'UF_DEPARTMENT_NAME'],
        },
        (result) => result
      )

      const departmentsMap = new Map<string, { id: string; name: string }>()

      users.forEach((user) => {
        const deptIds = Array.isArray(user.UF_DEPARTMENT)
          ? user.UF_DEPARTMENT
          : user.UF_DEPARTMENT
            ? [user.UF_DEPARTMENT]
            : []

        const deptNames = Array.isArray(user.UF_DEPARTMENT_NAME)
          ? user.UF_DEPARTMENT_NAME
          : user.UF_DEPARTMENT_NAME
            ? [user.UF_DEPARTMENT_NAME]
            : []

        deptIds.forEach((deptId: string, index: number) => {
          if (deptId && !departmentsMap.has(deptId)) {
            const deptName = deptNames[index] || deptId
            departmentsMap.set(deptId, {
              id: deptId,
              name: typeof deptName === 'string' ? deptName : deptId,
            })
          }
        })
      })

      const departments: Department[] = Array.from(departmentsMap.values())

      // Сортируем по названию для удобства
      departments.sort((a, b) => a.name.localeCompare(b.name))

      return [
        { id: '0', name: 'По всей компании' },
        ...departments,
      ]
    } catch (fallbackError) {
      console.error('Ошибка получения подразделений через fallback:', fallbackError)
      // Возвращаем хотя бы базовый список
      return [{ id: '0', name: 'По всей компании' }]
    }
  }
}

