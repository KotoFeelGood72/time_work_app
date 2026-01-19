<script setup lang="ts">
  defineProps<{
    title: string
  }>()
</script>

<template>
<div class="flex items-center justify-between mb-4">
  <h1 class="text-2xl font-bold text-gray-900 dark:text-white">{{ title }}</h1>

  <div class="flex items-center gap-6">
     <slot name="actions" />
  </div>
</div>
</template>

<style scoped>

</style>
