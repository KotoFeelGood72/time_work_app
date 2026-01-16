<template>
  <div class="flex items-center gap-2">
    <select
      v-model="selectedMonth"
      @change="handleChange"
      class="px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-black dark:text-white font-semibold cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      <option
        v-for="month in months"
        :key="month.value"
        :value="month.value"
        class="bg-white dark:bg-gray-700 text-black dark:text-white"
      >
        {{ month.label }}
      </option>
    </select>

    <select
      v-model="selectedYear"
      @change="handleChange"
      class="px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-black dark:text-white font-semibold cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      <option
        v-for="year in years"
        :key="year"
        :value="year"
        class="bg-white dark:bg-gray-700 text-black dark:text-white"
      >
        {{ year }}
      </option>
    </select>
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
