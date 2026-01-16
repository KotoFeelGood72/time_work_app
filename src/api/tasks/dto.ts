// DTO для работы с задачами Bitrix24 (сырые данные от API)

export interface BitrixTaskRaw {
  ID: string
  TITLE: string
  DESCRIPTION?: string
  STATUS: number
  CREATED_BY: string
  RESPONSIBLE_ID: string
  CREATED_DATE?: string
  DEADLINE?: string
  PRIORITY?: number
  [key: string]: unknown
}
