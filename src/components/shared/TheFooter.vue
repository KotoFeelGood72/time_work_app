<template>
  <footer class="bg-white dark:bg-gray border-t border-lightGray dark:border-gray transition-colors duration-300">
    <div class="max-w-7xl mx-auto px-4 py-6">
      <div class="flex flex-col md:flex-row items-center justify-between gap-4">
        <div class="text-center md:text-left">
          <p class="text-14 text-gray-600 dark:text-lightGrayText">
            © {{ currentYear }} Time Work App. Все права защищены.
          </p>
        </div>
        <div class="flex items-center gap-6">
          <div class="text-14 text-gray-600 dark:text-lightGrayText">
            Версия: {{ version }}
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const currentYear = computed(() => new Date().getFullYear())
const version = '1.0.0'
</script>

<style scoped>

</style>
