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

  // Временная заглушка - возвращаем моковые данные
  // В реальном приложении нужно использовать реальный API метод
  return requestWrapper<BitrixTimesheetRaw[], TimesheetData>(
    'timeman.report.get', // Заменить на реальный метод
    requestParams,
    TransformTimesheet.fromDTOArray
  ).catch(() => {
    // Если метод не существует, возвращаем моковые данные
    return getMockTimesheetData(filters)
  })
}

/**
 * Получить список подразделений
 */
export const fetchDepartments = async (): Promise<Department[]> => {
  // TODO: Заменить на реальный метод Bitrix24 API
  // Например: 'department.get' или другой метод
  return requestWrapper<BitrixDepartmentRaw[], Department[]>(
    'department.get', // Заменить на реальный метод
    {},
    TransformTimesheet.departmentsFromDTO
  ).catch(() => {
    // Если метод не существует, возвращаем моковые данные
    return getMockDepartments()
  })
}

/**
 * Моковые данные для разработки
 */
function getMockTimesheetData(filters: TimesheetFilters): TimesheetData {
  const month = filters.month || new Date().getMonth() + 1
  const year = filters.year || new Date().getFullYear()
  const departmentName = filters.departmentName || 'программеры'

  const employees: EmployeeTimeData[] = [
    {
      employeeId: '112',
      employeeName: 'Андрей Емцев',
      employeeCode: '#112',
      entries: {},
      totalHours: 0,
      totalMinutes: 30,
    },
    {
      employeeId: '212',
      employeeName: 'В Г',
      employeeCode: '#212',
      entries: {},
      totalHours: 0,
      totalMinutes: 30,
    },
    {
      employeeId: '664',
      employeeName: 'Артем Болухта',
      employeeCode: '#664',
      entries: {},
      totalHours: 31,
      totalMinutes: 0,
    },
    {
      employeeId: '682',
      employeeName: 'Руслан Фаттахов',
      employeeCode: '#682',
      entries: {},
      totalHours: 31,
      totalMinutes: 35,
    },
    {
      employeeId: '802',
      employeeName: 'Дмитрий Русинов',
      employeeCode: '#802',
      entries: {},
      totalHours: 32,
      totalMinutes: 46,
    },
    {
      employeeId: '812',
      employeeName: 'Виктор Котенко',
      employeeCode: '#812',
      entries: {},
      totalHours: 32,
      totalMinutes: 17,
    },
  ]

  // Добавляем записи для некоторых дней
  const dates = ['2026-01-12', '2026-01-13', '2026-01-14', '2026-01-15', '2026-01-16']
  dates.forEach((date, dateIndex) => {
    employees.forEach((emp, empIndex) => {
      if (empIndex < 2 && dateIndex >= 3) {
        // Первые два сотрудника - только 00:30 в последние дни
        emp.entries[date] = { date, hours: 0, minutes: 30 }
      } else if (empIndex >= 2) {
        // Остальные сотрудники - полные дни
        const hours = 8
        const minutes = dateIndex === 4 ? 5 : 0
        emp.entries[date] = { date, hours, minutes }
      }
    })
  })

  const dailyTotals: Record<string, { hours: number; minutes: number }> = {
    '2026-01-12': { hours: 31, minutes: 30 },
    '2026-01-13': { hours: 32, minutes: 17 },
    '2026-01-14': { hours: 32, minutes: 5 },
    '2026-01-15': { hours: 32, minutes: 1 },
    '2026-01-16': { hours: 0, minutes: 45 },
  }

  return {
    departmentId: filters.departmentId,
    departmentName,
    month,
    year,
    employees,
    workingDays: 22,
    dailyTotals,
    grandTotal: { hours: 128, minutes: 38 },
  }
}

function getMockDepartments(): Department[] {
  return [
    { id: '1', name: 'По всей компании' },
    { id: '2', name: 'программеры' },
    { id: '3', name: 'Colba' },
    { id: '4', name: 'easyrevenue' },
    { id: '5', name: 'АйТи Спектр' },
    { id: '6', name: 'заказчики' },
    { id: '7', name: 'Zdravsoft' },
    { id: '8', name: 'CKT' },
  ]
}

// Импортируем тип для моковых данных
import type { EmployeeTimeData } from '@/entities/timesheet-entities'
