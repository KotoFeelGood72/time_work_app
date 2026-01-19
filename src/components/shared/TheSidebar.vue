<script setup lang="ts">
import { useRoute } from 'vue-router'
import ThemeToggler from '../toggles/ThemeToggler.vue'
import { menu } from '@/mocks/menu'
import { RouterLink } from 'vue-router'

const route = useRoute()

const isActive = (path: string) => {
  if (path === '/') {
    return route.path === '/'
  }
  return route.path.startsWith(path)
}
</script>

<template>
  <aside class="fixed left-2 bottom-2 bottom-2 h-full max-h-[calc(100vh-82px)] w-16 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 rounded-full shadow-lg transition-colors duration-300 z-50 flex flex-col items-center py-4">

    <!-- Навигационные иконки -->
    <nav class="flex flex-col items-center gap-1 flex-1">
      <RouterLink
        v-for="item in menu"
        :key="item.path"
        :to="item.path"
        :class="[
          'w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300 cursor-pointer group',
          isActive(item.path)
            ? 'bg-blue-500 text-white'
            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
        ]"
        :title="item.title"
      >
        <component :is="item.icon" class="w-5 h-5" />
      </RouterLink>
    </nav>

    <!-- Нижняя часть с настройками и выходом -->
    <div class="flex flex-col items-center gap-1 mt-auto">
      <div class="w-10 h-10 rounded-lg flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-300 cursor-pointer group" title="Настройки">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="3"/>
          <path d="M12 1v6m0 6v6M5.64 5.64l4.24 4.24m4.24 4.24l4.24 4.24M1 12h6m6 0h6M5.64 18.36l4.24-4.24m4.24-4.24l4.24-4.24"/>
        </svg>
      </div>
      <div class="w-10 h-10 flex items-center justify-center">
        <ThemeToggler />
      </div>
      <div class="w-10 h-10 rounded-lg flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-300 cursor-pointer group" title="Выход">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
          <polyline points="16 17 21 12 16 7"/>
          <line x1="21" y1="12" x2="9" y2="12"/>
        </svg>
      </div>
    </div>
  </aside>
</template>
