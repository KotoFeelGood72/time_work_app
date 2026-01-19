<template>
  <TheSidebar />
  <TheHeader />
  <main class="min-h-screen bg-white dark:bg-dark transition-colors duration-300 ml-20 pt-16">
    <div class="content pl-24 bg-gray-50">
      <slot/>
    </div>
  </main>
  <TheFooter />
</template>

<script setup lang="ts">
import TheSidebar from '../components/shared/TheSidebar.vue'
import TheHeader from '../components/shared/TheHeader.vue'
import TheFooter from '../components/shared/TheFooter.vue'
</script>

<style scoped>

</style>
