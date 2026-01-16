// Общие DTO типы для Bitrix24 API

export interface BitrixResponse<T> {
  result: T
  error?: string
  error_description?: string
}

export interface BitrixListParams {
  filter?: Record<string, unknown>
  select?: string[]
  order?: Record<string, string>
  start?: number
}

export interface BitrixCreateResponse {
  id: string
}

export interface BitrixUpdateResponse {
  success: boolean
}

export interface BitrixDeleteResponse {
  success: boolean
}
