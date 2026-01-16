import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import { initBitrix24Mock } from './mocks/bitrix24-mock'

// Инициализируем мок BX24 для локальной разработки
// Мок загружается только если реальный BX24 не доступен
if (import.meta.env.DEV && typeof window !== 'undefined') {
  // Проверяем наличие реального BX24 сразу
  const windowWithBX24 = window as Window & {
    BX24?: unknown
  }

  // Если реальный BX24 не доступен или это временный мок, заменяем полным моком
  const currentBX24 = windowWithBX24.BX24 as { _isFullMock?: boolean } | undefined
  if (!currentBX24 || !currentBX24._isFullMock) {
    // Инициализируем полный мок сразу (заменяет временный мок из index.html)
    initBitrix24Mock()
  }
}

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
