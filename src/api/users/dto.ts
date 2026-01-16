// DTO для работы с пользователями Bitrix24 (сырые данные от API)

export interface BitrixUserRaw {
  ID: string
  NAME: string
  LAST_NAME: string
  SECOND_NAME?: string
  EMAIL: string
  PERSONAL_PHOTO?: string
  PERSONAL_MOBILE?: string
  WORK_POSITION?: string
  ACTIVE?: string
  [key: string]: unknown
}
