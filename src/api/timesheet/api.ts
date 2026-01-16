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
 * Документация: https://apidocs.bitrix24.ru/api-reference/index.html
 */
export const fetchDepartments = async (): Promise<Department[]> => {
  return requestWrapper<BitrixDepartmentRaw[], Department[]>(
    'department.get',
    {},
    TransformTimesheet.departmentsFromDTO
  )
}

