// DTO для работы с табелем учета рабочего времени из Bitrix24

export interface BitrixTimesheetRaw {
  ID: string
  EMPLOYEE_ID: string
  EMPLOYEE_NAME: string
  EMPLOYEE_CODE?: string
  DATE: string
  HOURS?: number
  MINUTES?: number
  DEPARTMENT_ID?: string
  DEPARTMENT_NAME?: string
}

export interface BitrixDepartmentRaw {
  ID: string
  NAME: string
}
