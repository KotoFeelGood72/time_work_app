<template>
  <div class="employee-row flex items-center gap-2 px-2 py-1.5">
    <span class="text-xs font-medium text-gray-600 dark:text-gray-400 whitespace-nowrap">
      {{ employee.employeeCode }}
    </span>
    <span class="text-sm font-medium text-black dark:text-white whitespace-nowrap">
      {{ employee.employeeName }}
    </span>
  </div>
</template>

<script setup lang="ts">
import type { EmployeeTimeData } from '@/entities/timesheet-entities'

interface Props {
  employee: EmployeeTimeData
}

defineProps<Props>()
</script>

<style scoped>
.employee-row {
  min-width: 140px;
}
</style>
