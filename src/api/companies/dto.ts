// DTO для работы с компаниями Bitrix24 (сырые данные от API)

export interface BitrixCompanyRaw {
  ID: string
  TITLE: string
  PHONE?: Array<{ VALUE: string; VALUE_TYPE: string }>
  EMAIL?: Array<{ VALUE: string; VALUE_TYPE: string }>
  ADDRESS?: string
  WEB?: string
  [key: string]: unknown
}
