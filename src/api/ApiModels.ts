// Общие модели для Bitrix24 API

export interface BitrixApiResponse<T> {
  result: T
  error?: string
  error_description?: string
  error_exception?: string
}

export interface BitrixApiError {
  error: string
  error_description?: string
  error_exception?: string
}
