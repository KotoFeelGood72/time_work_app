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

// DTO для записей табеля времени через timeman.record.list
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

// DTO для записей времени, затраченного на задачи через tasks.elapseditem.getlist
export interface TaskElapsedItem {
  ID: string
  TASK_ID: string
  USER_ID: string
  SECONDS?: number // время в секундах
  MINUTES?: number // время в минутах
  CREATED_DATE?: string // дата создания записи
  DATE_START?: string // дата начала работы
  COMMENT_TEXT?: string
}
