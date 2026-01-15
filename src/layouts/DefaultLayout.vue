<template>
  <div>
    <TheHeader />
    <main>
      <slot/>
    </main>
    <TheFooter />
  </div>
</template>

<script setup lang="ts">
import TheHeader from '../components/shared/TheHeader.vue'
import TheFooter from '../components/shared/TheFooter.vue'
</script>

<style scoped>

</style>
