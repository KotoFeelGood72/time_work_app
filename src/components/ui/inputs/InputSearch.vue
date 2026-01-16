<script setup lang="ts">
  import SearchIcon from '@/components/icons/SearchIcon.vue'

const model = defineModel<string>('modelValue')
  </script>


<template>
  <div class="input-search-wrapper relative">
    <input
      v-model="model"
      type="text"
      placeholder="Поиск..."
      class="w-full px-4 py-2 pl-10 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-black dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors"
    />
    <SearchIcon class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
  </div>
</template>


