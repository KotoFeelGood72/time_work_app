import { fileURLToPath, URL } from 'node:url'
import { copyFileSync, existsSync } from 'fs'
import { join } from 'path'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  build: {
    // Явно очищаем папку dist перед каждой сборкой
    // Это гарантирует, что старые файлы будут удалены
    emptyOutDir: true,
    // Увеличиваем размер предупреждения для больших файлов
    chunkSizeWarningLimit: 1000,
  },
  plugins: [
    vue(),
    vueDevTools(),
    {
      name: 'copy-php-files',
      closeBundle() {
        // Копируем install.php в dist после сборки
        // Это происходит после очистки dist, поэтому старые версии будут заменены
        const distPath = join(process.cwd(), 'dist')
        const publicPath = join(process.cwd(), 'public')

        if (existsSync(distPath)) {
          const filesToCopy = ['install.php']
          filesToCopy.forEach(file => {
            const src = join(publicPath, file)
            const dest = join(distPath, file)
            if (existsSync(src)) {
              copyFileSync(src, dest)
              console.log(`✅ Скопирован ${file} в dist`)
            }
          })
        }
      }
    }
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
})
