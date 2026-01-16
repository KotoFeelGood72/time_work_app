// Мок для Bitrix24 BX24 API для локальной разработки

/**
 * Создает мок объект BX24 для локальной разработки
 * Имитирует поведение реального BX24 API
 */
export const createBitrix24Mock = () => {
  // Моковые данные для разработки
  const mockUsers = [
    { ID: '1', NAME: 'Иван', LAST_NAME: 'Иванов' },
    { ID: '2', NAME: 'Петр', LAST_NAME: 'Петров' },
    { ID: '3', NAME: 'Мария', LAST_NAME: 'Сидорова' },
  ]

  const mockDepartments = [
    { ID: '1', NAME: 'Отдел разработки' },
    { ID: '2', NAME: 'Отдел продаж' },
    { ID: '3', NAME: 'Отдел маркетинга' },
  ]

  const mockContacts = [
    { ID: '1', NAME: 'Алексей', LAST_NAME: 'Алексеев', PHONE: [{ VALUE: '+7 (999) 123-45-67' }], EMAIL: [{ VALUE: 'alex@example.com' }] },
    { ID: '2', NAME: 'Ольга', LAST_NAME: 'Ольгина', PHONE: [{ VALUE: '+7 (999) 234-56-78' }], EMAIL: [{ VALUE: 'olga@example.com' }] },
  ]

  const mockCompanies = [
    { ID: '1', TITLE: 'ООО "Рога и Копыта"', PHONE: [{ VALUE: '+7 (495) 123-45-67' }], EMAIL: [{ VALUE: 'info@company.ru' }] },
    { ID: '2', TITLE: 'ИП Иванов', PHONE: [{ VALUE: '+7 (495) 234-56-78' }], EMAIL: [{ VALUE: 'ivanov@example.ru' }] },
  ]

  const mockLeads = [
    { ID: '1', TITLE: 'Лид 1', NAME: 'Сергей', LAST_NAME: 'Сергеев', PHONE: [{ VALUE: '+7 (999) 345-67-89' }], EMAIL: [{ VALUE: 'sergey@example.com' }] },
  ]

  const mockTasks = [
    { ID: '1', TITLE: 'Задача 1', DESCRIPTION: 'Описание задачи', STATUS: '2', CREATED_BY: '1' },
    { ID: '2', TITLE: 'Задача 2', DESCRIPTION: 'Описание задачи 2', STATUS: '3', CREATED_BY: '2' },
  ]

  // Функция для имитации задержки сети
  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

  // Обработка различных методов API
  const handleMethod = async (method: string, params: Record<string, unknown>): Promise<unknown> => {
    await delay(300) // Имитация сетевой задержки

    console.log(`[MOCK] Вызов метода: ${method}`, params)

    // Обработка методов пользователей
    if (method === 'user.get') {
      const filter = params.filter as Record<string, unknown> || {}
      let result = [...mockUsers]

      if (filter.UF_DEPARTMENT && filter.UF_DEPARTMENT !== '0') {
        // Фильтрация по подразделению (упрощенная)
        result = result.filter((_, index) => index < 2)
      }

      return result
    }

    // Обработка методов подразделений
    if (method === 'department.get') {
      return mockDepartments
    }

    // Обработка методов контактов
    if (method === 'crm.contact.list') {
      return mockContacts
    }

    if (method === 'crm.contact.get') {
      const id = params.id as string
      return mockContacts.find(c => c.ID === id) || null
    }

    // Обработка методов компаний
    if (method === 'crm.company.list') {
      return mockCompanies
    }

    if (method === 'crm.company.get') {
      const id = params.id as string
      return mockCompanies.find(c => c.ID === id) || null
    }

    // Обработка методов лидов
    if (method === 'crm.lead.list') {
      return mockLeads
    }

    if (method === 'crm.lead.get') {
      const id = params.id as string
      return mockLeads.find(l => l.ID === id) || null
    }

    // Обработка методов задач
    if (method === 'tasks.task.list') {
      return { tasks: mockTasks }
    }

    if (method === 'tasks.task.get') {
      const taskId = params.taskId as string
      return { task: mockTasks.find(t => t.ID === taskId) || null }
    }

    // Обработка timeman методов
    if (method === 'timeman.status') {
      return {
        STATUS: 'OPENED',
        TIME_START: new Date().toISOString(),
        TIME_FINISH: null,
      }
    }

    // Обработка методов табеля времени
    if (method === 'timeman.record.get' || method === 'timeman.record.list') {
      // Возвращаем моковые записи табеля
      const today = new Date()
      const records = []

      for (let i = 0; i < 5; i++) {
        const date = new Date(today)
        date.setDate(date.getDate() - i)
        records.push({
          ID: String(i + 1),
          USER_ID: mockUsers[i % mockUsers.length].ID,
          DATE_START: date.toISOString().split('T')[0],
          TIME_START: '09:00',
          TIME_FINISH: '18:00',
          DURATION: 8 * 60, // 8 часов в минутах
        })
      }

      return records
    }

    // Методы создания/обновления возвращают успешный результат
    if (method.includes('.add') || method.includes('.create')) {
      return { ID: String(Date.now()) }
    }

    if (method.includes('.update')) {
      return { success: true }
    }

    if (method.includes('.delete')) {
      return { success: true }
    }

    // Для неизвестных методов возвращаем пустой результат
    console.warn(`[MOCK] Неизвестный метод: ${method}, возвращаю пустой результат`)
    return []
  }

  // Создаем мок объект BX24
  const BX24Mock = {
    _isFullMock: true, // Флаг для идентификации полного мока
    init: (callback: () => void) => {
      console.log('[MOCK] BX24.init вызван')
      // Имитируем асинхронную инициализацию
      setTimeout(() => {
        callback()
      }, 100)
    },

    callMethod: (
      method: string,
      params: Record<string, unknown>,
      callback: (result: {
        answer?: {
          result?: unknown
          error?: string
          error_description?: string
        }
      }) => void
    ) => {
      handleMethod(method, params)
        .then((result) => {
          callback({
            answer: {
              result,
            },
          })
        })
        .catch((error) => {
          callback({
            answer: {
              error: 'MOCK_ERROR',
              error_description: error instanceof Error ? error.message : String(error),
            },
          })
        })
    },

    installFinish: () => {
      console.log('[MOCK] BX24.installFinish вызван')
    },
  }

  return BX24Mock
}

/**
 * Инициализирует мок BX24 в глобальном объекте window
 */
export const initBitrix24Mock = () => {
  if (typeof window === 'undefined') {
    return
  }

  const windowWithBX24 = window as Window & {
    BX24?: unknown
  }

  // Проверяем, не установлен ли уже реальный BX24
  // Реальный BX24 обычно имеет более сложную структуру и не имеет флага _isFullMock
  const currentBX24 = windowWithBX24.BX24 as { _isFullMock?: boolean } | undefined

  if (currentBX24 && currentBX24._isFullMock) {
    // Полный мок уже установлен
    console.log('[MOCK] Полный мок BX24 уже установлен')
    return
  }

  // Если есть базовый мок или его нет вообще, устанавливаем/заменяем полным моком
  // Но только если это не реальный BX24 (реальный BX24 не имеет _isFullMock)
  if (!currentBX24 || currentBX24._isFullMock === false) {
    const mock = createBitrix24Mock()
    windowWithBX24.BX24 = mock as unknown
    console.log('[MOCK] Bitrix24 мок инициализирован для локальной разработки')
  } else {
    console.log('[MOCK] Реальный BX24 уже загружен, мок не используется')
  }
}
