<template>
  <div class="relative flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-gray-600 dark:text-gray-400">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
      <line x1="16" y1="2" x2="16" y2="6"/>
      <line x1="8" y1="2" x2="8" y2="6"/>
      <line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
    <span class="text-sm font-medium text-gray-900 dark:text-white">{{ formattedDate }}</span>
    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-gray-600 dark:text-gray-400">
      <polyline points="6 9 12 15 18 9"/>
    </svg>
    <div class="absolute inset-0 flex">
      <select
        v-model="selectedMonth"
        @change="handleChange"
        class="flex-1 opacity-0 cursor-pointer"
      >
        <option
          v-for="month in months"
          :key="month.value"
          :value="month.value"
        >
          {{ month.label }}
        </option>
      </select>
      <select
        v-model="selectedYear"
        @change="handleChange"
        class="flex-1 opacity-0 cursor-pointer"
      >
        <option
          v-for="year in years"
          :key="year"
          :value="year"
        >
          {{ year }}
        </option>
      </select>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

const props = defineProps<{
  modelValue: { month: number; year: number }
}>()

const emit = defineEmits<{
  'update:modelValue': [value: { month: number; year: number }]
}>()

const selectedMonth = ref(props.modelValue.month)
const selectedYear = ref(props.modelValue.year)

const formattedDate = computed(() => {
  const monthName = months.find(m => m.value === selectedMonth.value)?.label || ''
  return `${monthName} ${selectedYear.value}`
})

const months = [
  { value: 1, label: 'Январь' },
  { value: 2, label: 'Февраль' },
  { value: 3, label: 'Март' },
  { value: 4, label: 'Апрель' },
  { value: 5, label: 'Май' },
  { value: 6, label: 'Июнь' },
  { value: 7, label: 'Июль' },
  { value: 8, label: 'Август' },
  { value: 9, label: 'Сентябрь' },
  { value: 10, label: 'Октябрь' },
  { value: 11, label: 'Ноябрь' },
  { value: 12, label: 'Декабрь' },
]

const currentYear = new Date().getFullYear()
const years = computed(() => {
  const yearsList: number[] = []
  // Генерируем годы от текущего - 5 до текущего + 1
  for (let i = currentYear - 5; i <= currentYear + 1; i++) {
    yearsList.push(i)
  }
  return yearsList
})

const handleChange = () => {
  emit('update:modelValue', {
    month: selectedMonth.value,
    year: selectedYear.value,
  })
}

watch(() => props.modelValue, (newValue) => {
  selectedMonth.value = newValue.month
  selectedYear.value = newValue.year
}, { deep: true })
</script>

<style scoped>
select {
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23333' d='M6 9L1 4h10z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.75rem center;
  background-size: 12px;
  padding-right: 2.5rem;
}

.dark select {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23fff' d='M6 9L1 4h10z'/%3E%3C/svg%3E");
}
</style>
