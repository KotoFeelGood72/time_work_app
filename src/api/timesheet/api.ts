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
 * Примечание: В реальном приложении нужно использовать соответствующий метод Bitrix24 API
 * Здесь используется заглушка, которую нужно заменить на реальный API метод
 */
export const fetchTimesheet = async (
  filters: TimesheetFilters
): Promise<TimesheetData> => {
  // TODO: Заменить на реальный метод Bitrix24 API
  // Например: 'timeman.report.get' или другой метод для получения табеля
  const requestParams: Record<string, unknown> = {
    filter: {},
  }

  if (filters.month) {
    requestParams.filter = {
      ...(requestParams.filter as Record<string, unknown>),
      MONTH: filters.month,
    }
  }

  if (filters.year) {
    requestParams.filter = {
      ...(requestParams.filter as Record<string, unknown>),
      YEAR: filters.year,
    }
  }

  if (filters.departmentId) {
    requestParams.filter = {
      ...(requestParams.filter as Record<string, unknown>),
      DEPARTMENT_ID: filters.departmentId,
    }
  }

  return requestWrapper<BitrixTimesheetRaw[], TimesheetData>(
    'timeman.report.get', // Заменить на реальный метод Bitrix24 API
    requestParams,
    TransformTimesheet.fromDTOArray
  )
}

/**
 * Получить список подразделений
 */
export const fetchDepartments = async (): Promise<Department[]> => {
  return requestWrapper<BitrixDepartmentRaw[], Department[]>(
    'department.get', // Заменить на реальный метод Bitrix24 API
    {},
    TransformTimesheet.departmentsFromDTO
  )
}

