// DTO для работы с лидами Bitrix24 (сырые данные от API)

export interface BitrixLeadRaw {
  ID: string
  TITLE: string
  NAME?: string
  LAST_NAME?: string
  SECOND_NAME?: string
  PHONE?: Array<{ VALUE: string; VALUE_TYPE: string }>
  EMAIL?: Array<{ VALUE: string; VALUE_TYPE: string }>
  STATUS_ID?: string
  SOURCE_ID?: string
  COMPANY_ID?: string
  CONTACT_ID?: string
  [key: string]: unknown
}
