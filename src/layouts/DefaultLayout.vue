<template>
  <TheHeader />
  <main class="min-h-screen bg-white dark:bg-dark transition-colors duration-300">
    <slot/>
  </main>
  <TheFooter />
</template>

<script setup lang="ts">
import TheHeader from '../components/shared/TheHeader.vue'
import TheFooter from '../components/shared/TheFooter.vue'
</script>

<style scoped>

</style>
