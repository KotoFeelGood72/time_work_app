// DTO для работы с контактами Bitrix24 (сырые данные от API)

export interface BitrixContactRaw {
  ID: string
  NAME: string
  LAST_NAME?: string
  SECOND_NAME?: string
  PHONE?: Array<{ VALUE: string; VALUE_TYPE: string }>
  EMAIL?: Array<{ VALUE: string; VALUE_TYPE: string }>
  COMPANY_ID?: string
  POST?: string
  ADDRESS?: string
  [key: string]: unknown
}
