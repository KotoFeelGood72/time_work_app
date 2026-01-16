<script setup lang="ts">
  import ThemeToggler from '../toggles/ThemeToggler.vue'
  import { menu } from '@/mocks/menu'
  import { RouterLink } from 'vue-router'
</script>


<template>
  <header class="shadow-sm bg-white dark:bg-gray fixed top-2 left-1/2 -translate-x-1/2 w-full max-w-[98%] rounded-xl transition-colors duration-300 z-50">
      <nav class="flex items-center justify-between gap-2 p-2">
        <div class="flex items-center gap-2">
          <RouterLink v-for="item in menu" :key="item.path" :to="item.path" class="text-16 font-menium text-black dark:text-white hover:text-yellow transition-colors duration-300 flex items-center gap-2 py-2.5 px-3">
            <component :is="item.icon" class="w-4 h-4 flex items-center justify-center" />
            <span class="">{{ item.title }}</span>
          </RouterLink>
        </div>
        <ThemeToggler />
      </nav>
  </header>
</template>
