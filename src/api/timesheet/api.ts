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

  // Используем метод timeman.entry.get для получения записей табеля
  // Если метод не доступен, можно попробовать timeman.status.get или другие методы timeman.*
  return requestWrapper<BitrixTimesheetRaw[], TimesheetData>(
    'timeman.entry.get',
    requestParams,
    TransformTimesheet.fromDTOArray
  )
}

/**
 * Получить список подразделений
 * Использует метод department.list из Bitrix24 API
 * Документация: https://apidocs.bitrix24.ru/api-reference/index.html
 */
export const fetchDepartments = async (): Promise<Department[]> => {
  return requestWrapper<BitrixDepartmentRaw[], Department[]>(
    'department.list',
    {},
    TransformTimesheet.departmentsFromDTO
  )
}

