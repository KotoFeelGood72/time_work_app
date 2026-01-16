// Обертка для запросов к Bitrix24 API

/**
 * Базовый метод для выполнения запросов к Bitrix24 REST API через BX24
 */
const request = async <T>(
  method: string,
  params: Record<string, unknown> = {}
): Promise<T> => {
  return new Promise<T>((resolve, reject) => {
    // Проверяем наличие BX24
    if (typeof window === 'undefined') {
      reject(new Error('BX24 не доступен. Убедитесь, что скрипт Bitrix24 загружен.'))
      return
    }

    const windowWithBX24 = window as Window & {
      BX24?: {
        callMethod: (
          method: string,
          params: Record<string, unknown>,
          callback: (result: {
            answer?: {
              result?: T
              error?: string
              error_description?: string
            }
          }) => void
        ) => void
      }
    }

    if (!windowWithBX24.BX24) {
      reject(new Error('BX24 не доступен. Убедитесь, что скрипт Bitrix24 загружен.'))
      return
    }

    const BX24 = windowWithBX24.BX24

    // BX24.callMethod принимает метод, параметры и callback
    BX24.callMethod(
      method,
      params,
      (result: {
        answer?: {
          result?: T
          error?: string
          error_description?: string
        }
      }) => {
        if (result.answer) {
          if (result.answer.error) {
            reject(
              new Error(
                `Bitrix24 API Error: ${result.answer.error} - ${result.answer.error_description || ''}`
              )
            )
          } else if (result.answer.result !== undefined) {
            resolve(result.answer.result)
          } else {
            reject(new Error('Неизвестный формат ответа от Bitrix24 API'))
          }
        } else {
          reject(new Error('Пустой ответ от Bitrix24 API'))
        }
      }
    )
  })
}

/**
 * Обертка для выполнения запросов к Bitrix24 API с применением transform
 */
export const requestWrapper = async <T, K>(
  method: string,
  params: Record<string, unknown> = {},
  transformCb: (args: T) => K
): Promise<K> => {
  const result = await request<T>(method, params)

  if (transformCb) {
    return transformCb(result)
  }

  return result as unknown as K
}
