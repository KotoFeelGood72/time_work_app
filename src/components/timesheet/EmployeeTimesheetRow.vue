<template>
  <tr
    :class="[
      'group transition-colors',
      isSelected ? 'bg-yellow-100 dark:bg-yellow-900' : ''
    ]"
  >
    <td class="px-2 py-1.5 border border-gray-300 dark:border-gray-600 text-black dark:text-white font-medium text-xs sticky left-0 bg-white dark:bg-gray z-20 group-hover:bg-gray-100 dark:group-hover:bg-gray-700 transition-colors">
      <EmployeeRow :employee="employee" />
    </td>
    <td
      v-for="day in days"
      :key="day.date"
      class="px-1 py-1 border border-gray-300 dark:border-gray-600 group-hover:bg-gray-100 dark:group-hover:bg-gray-700 transition-colors"
    >
      <DayCell
        :employee="employee"
        :date="day.date"
        :time-entry="getTimeEntry(day.date)"
        @click="handleDayClick"
      />
    </td>
    <td class="px-2 py-1.5 text-center border border-gray-300 dark:border-gray-600 text-black dark:text-white font-semibold text-xs bg-gray-50 dark:bg-gray-700 sticky right-0 z-20 group-hover:bg-gray-100 dark:group-hover:bg-gray-700 transition-colors">
      {{ formatTotalTime(employee.totalHours, employee.totalMinutes) }}
    </td>
  </tr>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { EmployeeTimeData, TimeEntry } from '@/entities/timesheet-entities'
import { formatTotalTime } from '@/utils/timeFormat'
import EmployeeRow from './EmployeeRow.vue'
import DayCell from './DayCell.vue'

interface Props {
  employee: EmployeeTimeData
  days: Array<{ date: string; day: number; dayName: string }>
  isSelected?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isSelected: false,
})

const emit = defineEmits<{
  dayClick: [employee: EmployeeTimeData, date: string]
}>()

const getTimeEntry = (date: string): TimeEntry | null => {
  return props.employee.entries[date] || null
}

const handleDayClick = (employee: EmployeeTimeData, date: string) => {
  emit('dayClick', employee, date)
}
</script>

<style scoped>
</style>
