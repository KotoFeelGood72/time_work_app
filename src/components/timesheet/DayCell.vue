<template>
  <div
    class="day-cell px-1 py-1 text-center cursor-pointer"
    @click="handleClick"
  >
    <div
      v-if="timeEntry"
      :class="[
        'inline-block px-1 py-0.5 rounded text-xs font-medium',
        timeEntry.hours === 0 && timeEntry.minutes !== 0
          ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
          : 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
      ]"
    >
      {{ formatTime(timeEntry) }}
    </div>
    <div
      v-else
      class="w-full h-full min-h-[24px] flex items-center justify-center"
    >
      <span class="text-gray-300 dark:text-gray-600 text-xs">—</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { TimeEntry, EmployeeTimeData } from '@/entities/timesheet-entities'

interface Props {
  employee: EmployeeTimeData
  date: string
  timeEntry?: TimeEntry | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  click: [employee: EmployeeTimeData, date: string]
}>()

const formatTime = (entry: TimeEntry): string => {
  const hours = entry.hours.toString().padStart(2, '0')
  const minutes = entry.minutes.toString().padStart(2, '0')
  return `${hours}:${minutes}`
}

const handleClick = () => {
  emit('click', props.employee, props.date)
}
</script>

