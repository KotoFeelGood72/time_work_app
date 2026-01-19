<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import SearchIcon from '../icons/SearchIcon.vue'

const searchQuery = ref('')
const showUserDropdown = ref(false)
const userMenuRef = ref<HTMLElement | null>(null)

// Моковые данные пользователя (можно заменить на реальные данные из store)
const currentUser = {
  name: 'Пользователь',
  photo: null,
  initials: 'П'
}

// Закрытие выпадающего меню при клике вне его
const handleClickOutside = (event: MouseEvent) => {
  if (userMenuRef.value && !userMenuRef.value.contains(event.target as Node)) {
    showUserDropdown.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <header class="fixed top-0 left-0 h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 transition-colors duration-300 z-40 flex items-center justify-between px-6 w-full">
    <!-- Левая часть: Логотип и поиск -->
    <div class="flex items-center gap-4 flex-1">
      <!-- Логотип -->
      <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-red-400 via-blue-400 to-yellow-400 flex items-center justify-center shrink-0">
        <span class="text-white font-bold text-xs">TW</span>
      </div>

      <!-- Поисковая строка -->
      <div class="flex-1 max-w-md">
        <div class="relative">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <SearchIcon class="w-5 h-5 text-gray-400" />
          </div>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search..."
            class="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-300"
          />
        </div>
      </div>
    </div>

    <!-- Правая часть: Уведомления и профиль -->
    <div class="flex items-center gap-4">
      <!-- Иконка уведомлений -->
      <button
        class="relative w-10 h-10 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-300"
        title="Уведомления"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
        <!-- Индикатор новых уведомлений -->
        <span class="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
      </button>

      <!-- Профиль пользователя -->
      <div class="relative" ref="userMenuRef">
        <button
          @click.stop="showUserDropdown = !showUserDropdown"
          class="flex items-center gap-2 hover:opacity-80 transition-opacity duration-300"
        >
          <!-- Аватар -->
          <div class="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold text-sm">
            <img
              v-if="currentUser.photo"
              :src="currentUser.photo"
              :alt="currentUser.name"
              class="w-full h-full rounded-full object-cover"
            />
            <span v-else>{{ currentUser.initials }}</span>
          </div>
          <!-- Стрелка вниз -->
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="text-gray-600 dark:text-gray-400"
          >
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </button>

        <!-- Выпадающее меню профиля -->
        <div
          v-if="showUserDropdown"
          class="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50"
        >
          <div class="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
            <p class="text-sm font-semibold text-gray-900 dark:text-white">{{ currentUser.name }}</p>
          </div>
          <a href="#" class="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
            Профиль
          </a>
          <a href="#" class="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
            Настройки
          </a>
          <a href="#" class="block px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700">
            Выход
          </a>
        </div>
      </div>
    </div>
  </header>
</template>
