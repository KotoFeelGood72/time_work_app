import { fileURLToPath, URL } from 'node:url'
import { copyFileSync, existsSync } from 'fs'
import { join } from 'path'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import bitrix24UIPluginVite from '@bitrix24/b24ui-nuxt/vite'

// https://vite.dev/config/
export default defineConfig({
  build: {
    emptyOutDir: true,
    chunkSizeWarningLimit: 1000,
  },
  plugins: [
    vue(),
    vueDevTools(),
    bitrix24UIPluginVite(),
    {
      name: 'copy-php-files',
      closeBundle() {
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
