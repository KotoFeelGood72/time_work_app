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

// DTO для данных timeman API
export interface TimemanStatusData {
  result?: {
    STATUS?: string // 'OPENED' | 'CLOSED' | 'PAUSED'
    date_start?: string // ISO date string
    date_finish?: string // ISO date string
    duration?: number // в секундах
    operating?: number // в секундах
    processing?: number // в секундах
    start?: number // timestamp
    finish?: number // timestamp
    operating_reset_at?: number // timestamp
  }
  time?: {
    start: number
    finish: number
    duration: number
    processing: number
  }
  date_start?: string
  date_finish?: string
  duration?: number
  operating?: number
  processing?: number
  start?: number
  finish?: number
  operating_reset_at?: number
}

// DTO для записей табеля времени (не используется, оставлено для совместимости)
export interface TimemanRecord {
  ID: string
  USER_ID: string
  DATE_START?: string
  DATE_FINISH?: string
  TIME_START?: string
  TIME_FINISH?: string
  DURATION?: number // в секундах или минутах
  DURATION_HOURS?: number
  DURATION_MINUTES?: number
}

// DTO для записей рабочего времени через timeman.worktime.list
export interface TimemanWorktime {
  USER_ID: string
  DATE?: string
  DATE_START?: string
  DURATION?: number
  HOURS?: number
  MINUTES?: number
}

// DTO для отчетов о времени работы через timeman.timecontrol.reports.get
export interface TimemanTimecontrolReportDay {
  index: string // формат YYYYMMDD
  day_title: string // формат MM/DD/YYYY
  workday_date_start?: string // ISO datetime
  workday_date_finish?: string // ISO datetime
  workday_complete?: boolean
  workday_time_leaks_user?: number // в секундах
  workday_time_leaks_final?: number // в секундах
  workday_duration?: number // в секундах
  workday_duration_final?: number // в секундах
  workday_duration_config?: number // в секундах
  workday_time_leaks_real?: number // в секундах
  reports?: Array<{
    id: string
    user_id: string
    type: string
    date_start: string
    date_finish: string
    duration: number
    active: boolean
    entry_id?: string
    report_type?: string
    report_text?: string
  }>
}

export interface TimemanTimecontrolReport {
  result?: {
    report?: {
      month_title?: string
      date_start?: string
      date_finish?: string
      days?: TimemanTimecontrolReportDay[]
    }
    user?: {
      id: number | string
      active?: boolean
      name?: string
      first_name?: string
      last_name?: string
      work_position?: string
      avatar?: string
      personal_gender?: string
      last_activity_date?: string
    }
    time?: {
      start?: number
      finish?: number
      duration?: number
      processing?: number
      date_start?: string
      date_finish?: string
      operating_reset_at?: number
      operating?: number
    }
  }
}

// DTO для списка пользователей через timeman.timecontrol.reports.users.get
export interface TimemanTimecontrolUser {
  id: number | string
  name?: string
  first_name?: string
  last_name?: string
  work_position?: string
  avatar?: string
  personal_gender?: string
  last_activity_date?: string
}
