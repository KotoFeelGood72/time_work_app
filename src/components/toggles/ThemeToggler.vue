<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useThemeStore } from '@/stores/useThemeStore'

const themeStore = useThemeStore()
const { isDark } = storeToRefs(themeStore)
</script>

<template>
  <button
    @click="themeStore.toggleTheme()"
    class="p-2 w-10 h-10 cursor-pointer rounded-lg transition-colors duration-300 hover:bg-gray-100 bg-dark/10 dark:bg-white/10 dark:hover:bg-white/15"
    :aria-label="isDark ? 'Переключить на светлую тему' : 'Переключить на темную тему'"
  >
    <span v-if="isDark">🌙</span>
    <span v-else>☀️</span>
  </button>
</template>
