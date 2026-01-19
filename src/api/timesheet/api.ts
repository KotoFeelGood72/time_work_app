// API методы для работы с табелем учета рабочего времени

import { requestWrapper } from '../index'
import type { BitrixDepartmentRaw, TimemanStatusData } from './dto'
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

  // Получаем пользователей для формирования структуры табеля
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

  // Получаем данные о времени работы через timeman API
  // ВАЖНО: timeman.status работает только для текущего пользователя без прав администратора
  // Для получения данных других пользователей нужны права администратора
  const startDate = filters.month && filters.year
    ? new Date(filters.year, filters.month - 1, 1)
    : new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  const endDate = filters.month && filters.year
    ? new Date(filters.year, filters.month, 0)
    : new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)

  const timesheetEntries: Array<{
    EMPLOYEE_ID: string
    EMPLOYEE_NAME: string
    EMPLOYEE_CODE: string
    DATE: string
    HOURS: number
    MINUTES: number
    DEPARTMENT_ID?: string
    DEPARTMENT_NAME?: string
  }> = []

  // Пробуем получить данные через timeman.status для текущего пользователя
  // Без USER_ID метод возвращает данные только для текущего пользователя
  try {
    const statusData = await requestWrapper<TimemanStatusData, TimemanStatusData>(
      'timeman.status',
      {},
      (result) => result
    )

    if (statusData) {
      const result = statusData.result || statusData
      const timeData = statusData.time

      let dateStart: Date | null = null
      if (result.date_start) {
        if (typeof result.date_start === 'string') {
          dateStart = new Date(result.date_start)
        } else if (typeof result.date_start === 'number') {
          dateStart = new Date(result.date_start * 1000)
        }
      } else if (timeData?.start) {
        dateStart = new Date(timeData.start * 1000)
      } else if (result.start) {
        dateStart = new Date(result.start * 1000)
      }

      if (dateStart && !isNaN(dateStart.getTime()) && dateStart >= startDate && dateStart <= endDate) {
        const dateStr = dateStart.toISOString().split('T')[0]
        if (dateStr) {
          const durationSeconds = result.duration || timeData?.duration || 0
          const operatingSeconds = result.operating || 0
          const actualDuration = durationSeconds > 0 ? durationSeconds : operatingSeconds

          if (actualDuration > 0) {
            const hours = Math.floor(actualDuration / 3600)
            const minutes = Math.floor((actualDuration % 3600) / 60)

            if (hours > 0 || minutes > 0) {
              // Получаем ID текущего пользователя из ответа или используем первый из списка
              const currentUserId = users[0]?.ID || ''
              const currentUser = users.find(u => u.ID === currentUserId) || users[0]

              if (currentUser) {
                timesheetEntries.push({
                  EMPLOYEE_ID: currentUser.ID,
                  EMPLOYEE_NAME: `${currentUser.NAME || ''} ${currentUser.LAST_NAME || ''}`.trim() || currentUser.ID,
                  EMPLOYEE_CODE: `#${currentUser.ID}`,
                  DATE: dateStr,
                  HOURS: hours,
                  MINUTES: minutes,
                })
              }
            }
          }
        }
      }
    }
  } catch (error) {
    console.warn('Не удалось получить данные через timeman.status:', error)
    // Если метод недоступен, продолжаем с пустыми данными
  }

  // Если получили данные через timeman, преобразуем их
  if (timesheetEntries.length > 0) {
    return TransformTimesheet.fromDTOArray(timesheetEntries as any)
  }

  // Если данных нет, возвращаем пустую структуру
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

