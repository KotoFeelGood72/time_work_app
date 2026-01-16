import { computed } from 'vue'
import { defineStore } from 'pinia'
import { useLocalStorage } from '@vueuse/core'

export const useThemeStore = defineStore('theme', () => {
  const isDark = useLocalStorage<boolean>('theme', false)

  const theme = computed(() => (isDark.value ? 'dark' : 'light'))

  function toggleTheme() {
    isDark.value = !isDark.value
    updateDocumentTheme()
  }

  function setTheme(dark: boolean) {
    isDark.value = dark
    updateDocumentTheme()
  }

  function updateDocumentTheme() {
    if (isDark.value) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  // Инициализация темы при создании store
  updateDocumentTheme()

  return {
    isDark,
    theme,
    toggleTheme,
    setTheme,
  }
})
