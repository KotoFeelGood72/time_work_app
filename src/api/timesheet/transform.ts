// Transform для конвертации данных табеля из Bitrix24 в формат приложения

import type { BitrixTimesheetRaw, BitrixDepartmentRaw } from './dto'
import type {
  EmployeeTimeData,
  TimeEntry,
  TimesheetData,
  Department,
} from '@/entities/timesheet-entities'

export const TransformTimesheet = {
  /**
   * Преобразует массив сырых данных из Bitrix24 в структурированный табель
   */
  fromDTOArray: (rawData: BitrixTimesheetRaw[]): TimesheetData => {
    if (!rawData || rawData.length === 0) {
      return {
        departmentName: '',
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        employees: [],
        workingDays: 0,
        dailyTotals: {},
        grandTotal: { hours: 0, minutes: 0 },
      }
    }

    // Группируем данные по сотрудникам
    const employeeMap = new Map<string, EmployeeTimeData>()
    let departmentName = ''
    let departmentId: string | undefined

    rawData.forEach((item) => {
      if (!departmentName && item.DEPARTMENT_NAME) {
        departmentName = item.DEPARTMENT_NAME
      }
      if (!departmentId && item.DEPARTMENT_ID) {
        departmentId = item.DEPARTMENT_ID
      }

      const employeeId = item.EMPLOYEE_ID
      if (!employeeMap.has(employeeId)) {
        employeeMap.set(employeeId, {
          employeeId,
          employeeName: item.EMPLOYEE_NAME,
          employeeCode: item.EMPLOYEE_CODE || `#${employeeId}`,
          entries: {},
          totalHours: 0,
          totalMinutes: 0,
        })
      }

      const employee = employeeMap.get(employeeId)!
      const date = item.DATE
      const hours = item.HOURS || 0
      const minutes = item.MINUTES || 0

      employee.entries[date] = {
        date,
        hours,
        minutes,
      }

      employee.totalHours += hours
      employee.totalMinutes += minutes
    })

    // Нормализуем минуты (60 минут = 1 час)
    const employees = Array.from(employeeMap.values()).map((emp) => {
      const totalMinutes = emp.totalMinutes + emp.totalHours * 60
      return {
        ...emp,
        totalHours: Math.floor(totalMinutes / 60),
        totalMinutes: totalMinutes % 60,
      }
    })

    // Вычисляем итоги по дням
    const dailyTotals: Record<string, { hours: number; minutes: number }> = {}
    employees.forEach((emp) => {
      Object.entries(emp.entries).forEach(([date, entry]) => {
        if (!dailyTotals[date]) {
          dailyTotals[date] = { hours: 0, minutes: 0 }
        }
        dailyTotals[date].hours += entry.hours
        dailyTotals[date].minutes += entry.minutes
      })
    })

    // Нормализуем итоги по дням
    Object.keys(dailyTotals).forEach((date) => {
      const total = dailyTotals[date]
      const totalMinutes = total.minutes + total.hours * 60
      dailyTotals[date] = {
        hours: Math.floor(totalMinutes / 60),
        minutes: totalMinutes % 60,
      }
    })

    // Вычисляем общий итог
    const grandTotalMinutes = employees.reduce(
      (sum, emp) => sum + emp.totalHours * 60 + emp.totalMinutes,
      0
    )

    // Определяем месяц и год из первой записи
    const firstDate = rawData[0]?.DATE
    let month = new Date().getMonth() + 1
    let year = new Date().getFullYear()
    if (firstDate) {
      const date = new Date(firstDate)
      month = date.getMonth() + 1
      year = date.getFullYear()
    }

    // Подсчитываем рабочие дни (дни, в которые есть записи)
    const workingDays = new Set(
      rawData.map((item) => item.DATE).filter(Boolean)
    ).size

    return {
      departmentId,
      departmentName,
      month,
      year,
      employees,
      workingDays,
      dailyTotals,
      grandTotal: {
        hours: Math.floor(grandTotalMinutes / 60),
        minutes: grandTotalMinutes % 60,
      },
    }
  },

  /**
   * Преобразует данные о подразделениях
   */
  departmentsFromDTO: (rawData: BitrixDepartmentRaw[]): Department[] => {
    return rawData.map((item) => ({
      id: item.ID,
      name: item.NAME,
    }))
  },
}
