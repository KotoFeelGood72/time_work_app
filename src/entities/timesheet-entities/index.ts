// Entities для работы с табелем учета рабочего времени

export interface TimeEntry {
  date: string // YYYY-MM-DD
  hours: number // количество часов (например, 8.5)
  minutes: number // количество минут
}

export interface EmployeeTimeData {
  employeeId: string
  employeeName: string
  employeeCode: string // например, "#112"
  entries: Record<string, TimeEntry> // ключ - дата в формате YYYY-MM-DD
  totalHours: number
  totalMinutes: number
}

export interface TimesheetData {
  departmentId?: string
  departmentName: string
  month: number // 1-12
  year: number
  employees: EmployeeTimeData[]
  workingDays: number
  dailyTotals: Record<string, { hours: number; minutes: number }> // ключ - дата
  grandTotal: { hours: number; minutes: number }
}

export interface TimesheetFilters {
  month?: number
  year?: number
  departmentId?: string
  departmentName?: string
}

export interface Department {
  id: string
  name: string
}
