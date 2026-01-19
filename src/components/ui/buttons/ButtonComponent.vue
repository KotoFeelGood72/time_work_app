<script setup lang="ts">
import { computed } from 'vue'

  defineEmits<{
    (e: 'click'): void
  }>()

  export interface ButtonComponentModel {
    text: string
    variant?: 'default' | 'primary'
  }

  const props = withDefaults(defineProps<ButtonComponentModel>(), {
    variant: 'default'
  })

  const buttonClasses = computed(() => {
    if (props.variant === 'primary') {
      return 'px-4 py-2 bg-blue-600 dark:bg-blue-500 border border-blue-600 dark:border-blue-500 rounded-lg font-semibold text-sm text-white hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors'
    }
    return 'px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg font-semibold text-sm text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors'
  })

</script>

<template>
  <button
    @click="$emit('click')"
    :class="buttonClasses"
  >
    {{ text }}
  </button>
</template>

<style scoped>

</style>
