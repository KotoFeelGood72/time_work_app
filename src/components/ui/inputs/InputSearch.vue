<script setup lang="ts">
  import SearchIcon from '@/components/icons/SearchIcon.vue'

const model = defineModel<string>('modelValue')
  </script>


<template>
 <div class="relative">
  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
    <SearchIcon class="w-5 h-5 text-gray-400" />
  </div>
  <input
    v-model="model"
    type="text"
    placeholder="Поиск..."
    class="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-300"
  />
</div>
</template>


