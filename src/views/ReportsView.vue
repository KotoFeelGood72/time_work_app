<template>
  <div class="home-view min-h-screen bg-white dark:bg-dark transition-colors duration-300 pt-20 px-4 pb-8">
    <div class="container">
       <!-- Фильтры -->
    <div class="flex items-center gap-4 mb-6 flex-wrap">
      <DateSelect
        v-model="dateFilter"
      />

      <button
        @click="openDepartmentModal"
        class="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-black dark:text-white rounded-lg font-semibold transition-colors"
      >
        {{ selectedDepartment?.name || 'ПОДРАЗДЕЛЕНИЕ' }}
      </button>
    </div>

    <!-- Заголовок подразделения -->
    <h2 v-if="timesheetData.departmentName" class="text-24 font-bold text-black dark:text-white mb-4">
      {{ timesheetData.departmentName }}
    </h2>

    <!-- Загрузка -->
    <div v-if="loading" class="text-18 text-black dark:text-white">
      Загрузка...
    </div>

    <!-- Ошибка -->
    <div v-if="error" class="text-red-600 dark:text-red-400 mb-4">
      {{ error }}
    </div>

    <!-- Таблица с vue3-datatable -->
    <div v-if="!loading && !error" class="timesheet-table-wrapper">
      <!-- Отладочная информация -->
      <div v-if="tableRows.length === 0" class="text-center py-8 text-gray-500 dark:text-gray-400">
        Нет данных для отображения. Загружено сотрудников: {{ timesheetData.employees.length }}
      </div>

      <Vue3Datatable
        v-else
        :rows="tableRows"
        :columns="tableColumns"
        :loading="loading"
        :isServerMode="false"
        :pagination="true"
        :sortable="true"
        skin="bh-table-striped bh-table-hover"
      >
        <!-- Слот для колонки с именем сотрудника -->
        <template #employee="props">
          <EmployeeRow :employee="props.value || props.data" />
        </template>

        <!-- Слоты для колонок дней -->
        <template
          v-for="day in daysInMonth"
          :key="day.date"
          #[`day_${day.date}`]="props"
        >
          <DayCell
            :employee="props.value || props.data"
            :date="day.date"
            :time-entry="(props.value || props.data).entries[day.date] || null"
            @click="openDayDetails"
          />
        </template>

        <!-- Слот для колонки итого -->
        <template #total="props">
          <div class="px-2 py-1.5 text-center text-black dark:text-white font-semibold text-xs">
            {{ formatTotalTime((props.value || props.data).totalHours, (props.value || props.data).totalMinutes) }}
          </div>
        </template>
      </Vue3Datatable>

      <!-- Итоговая строка -->
      <div v-if="timesheetData.employees.length > 0" class="total-row bg-gray-100 dark:bg-gray-800 font-bold border-t border-gray-300 dark:border-gray-600">
        <div class="grid gap-0" :style="{ gridTemplateColumns: `140px repeat(${daysInMonth.length}, 50px) 60px` }">
          <div class="px-2 py-1.5 text-black dark:text-white text-xs border-r border-gray-300 dark:border-gray-600">
            ИТОГО: {{ timesheetData.workingDays }} дн.
          </div>
          <div
            v-for="day in daysInMonth"
            :key="day.date"
            class="px-1 py-1 text-center text-black dark:text-white text-xs border-r border-gray-300 dark:border-gray-600"
          >
            <div v-if="getDailyTotal(day.date)" class="font-semibold">
              {{ formatTime(getDailyTotal(day.date)!) }}
            </div>
          </div>
          <div class="px-2 py-1.5 text-center text-black dark:text-white text-xs bg-yellow-100 dark:bg-yellow-900 font-bold">
            {{ formatTotalTime(timesheetData.grandTotal.hours, timesheetData.grandTotal.minutes) }}
          </div>
        </div>
      </div>
    </div>

    <!-- Кнопки действий -->
    <div class="flex items-center gap-4 mt-6">
      <button
        @click="clearCache"
        class="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition-colors"
      >
        Сбросить кэш
      </button>
      <button
        @click="refreshData"
        class="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-black dark:text-white rounded-lg font-semibold transition-colors"
      >
        Обновить
      </button>
      <button
        @click="toggleShowEmpty"
        class="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-black dark:text-white rounded-lg font-semibold transition-colors"
      >
        Показать пустые
      </button>
    </div>

    <!-- Модальное окно выбора подразделения -->
    <DepartmentModal
      :is-open="isDepartmentModalOpen"
      :departments="departments"
      :selected-department-id="selectedDepartment?.id"
      @close="closeDepartmentModal"
      @select="handleDepartmentSelect"
    />

    <!-- Модальное окно деталей дня -->
    <DayDetailsModal
      :is-open="isDayDetailsModalOpen"
      :employee-id="selectedDayData?.employeeId || ''"
      :employee-code="selectedDayData?.employeeCode || ''"
      :employee-name="selectedDayData?.employeeName || ''"
      :date="selectedDayData?.date || ''"
      :time-entry="selectedDayData?.timeEntry"
      @close="closeDayDetailsModal"
    />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import type { TimeEntry, EmployeeTimeData } from '@/entities/timesheet-entities'
import { useReportsStore, useReportsStoreRefs } from '@/stores/useReportsStore'
import DepartmentModal from '@/components/dashboard/DepartmentModal.vue'
import DayDetailsModal from '@/components/dashboard/DayDetailsModal.vue'
import DateSelect from '@/components/dashboard/DateSelect.vue'
import EmployeeRow from '@/components/timesheet/EmployeeRow.vue'
import DayCell from '@/components/timesheet/DayCell.vue'
// @ts-expect-error - типы не экспортируются правильно
import Vue3Datatable from '@bhplugin/vue3-datatable'
import '@bhplugin/vue3-datatable/dist/style.css'

const reportsStore = useReportsStore()
const {
  loading,
  error,
  timesheetData,
  departments,
  selectedDepartment,
  currentMonth,
  currentYear,
} = useReportsStoreRefs()

const isDepartmentModalOpen = ref(false)
const showEmpty = ref(false)

// Пагинация, сортировка и отображение количества записей управляются плагином vue3-datatable

const isDayDetailsModalOpen = ref(false)
const selectedDayData = ref<{
  employeeId: string
  employeeCode: string
  employeeName: string
  date: string
  timeEntry?: TimeEntry
} | null>(null)

const dateFilter = computed({
  get: () => ({
    month: currentMonth.value,
    year: currentYear.value,
  }),
  set: (value: { month: number; year: number }) => {
    reportsStore.setDate(value.month, value.year)
  },
})

const daysInMonth = computed(() => {
  const days: Array<{ date: string; day: number; dayName: string }> = []
  const year = currentYear.value ?? new Date().getFullYear()
  const month = currentMonth.value ?? new Date().getMonth() + 1
  const daysInMonthCount = new Date(year, month, 0).getDate()
  const dayNames = ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб']

  for (let day = 1; day <= daysInMonthCount; day++) {
    const date = new Date(year, month - 1, day)
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    const dayIndex = date.getDay()
    days.push({
      date: dateStr,
      day,
      dayName: dayNames[dayIndex] || 'вс',
    })
  }

  return days
})

// Данные для таблицы
const tableRows = computed(() => {
  // Проверяем, что есть данные
  if (!timesheetData.value.employees || timesheetData.value.employees.length === 0) {
    console.log('No employees data')
    return []
  }

  // Преобразуем данные для vue3-datatable
  const rows = timesheetData.value.employees.map((employee) => {
    const row: Record<string, unknown> = {
      ...employee,
    }

    // Добавляем поля для каждой колонки дня
    daysInMonth.value.forEach((day) => {
      row[`day_${day.date}`] = employee.entries[day.date] || null
    })

    return row
  })

  console.log('Table rows prepared:', rows.length, 'employees:', timesheetData.value.employees.length)
  return rows
})

// Колонки для таблицы
const tableColumns = computed(() => {
  const columns: Array<{
    field: string
    title: string
    width?: string
    sort?: boolean
    isUnique?: boolean
  }> = [
    {
      field: 'employee',
      title: 'ФИО сотрудника',
      width: '140px',
      isUnique: true,
      sort: true,
    },
  ]

  // Добавляем колонки для каждого дня
  daysInMonth.value.forEach((day) => {
    columns.push({
      field: `day_${day.date}`,
      title: `${day.day} ${day.dayName}`,
      width: '50px',
      sort: false,
    })
  })

  // Колонка итого
  columns.push({
    field: 'total',
    title: 'Итого',
    width: '60px',
    sort: true,
  })

  console.log('Table columns:', columns.length)
  return columns
})



const getDailyTotal = (date: string): TimeEntry | null => {
  const total = timesheetData.value.dailyTotals[date]
  if (!total) return null
  return {
    date,
    hours: total.hours,
    minutes: total.minutes,
  }
}

const formatTime = (entry: TimeEntry): string => {
  const hours = entry.hours.toString().padStart(2, '0')
  const minutes = entry.minutes.toString().padStart(2, '0')
  return `${hours}:${minutes}`
}

const formatTotalTime = (hours: number, minutes: number): string => {
  const totalMinutes = hours * 60 + minutes
  const h = Math.floor(totalMinutes / 60)
  const m = totalMinutes % 60
  return `${h}:${m.toString().padStart(2, '0')}`
}

const openDepartmentModal = () => {
  isDepartmentModalOpen.value = true
}

const closeDepartmentModal = () => {
  isDepartmentModalOpen.value = false
}

const handleDepartmentSelect = (department: { id: string; name: string }) => {
  reportsStore.setSelectedDepartment(department)
  reportsStore.loadTimesheet()
}

const clearCache = () => {
  // Очистка кэша (если нужно)
  console.log('Кэш очищен')
}

const refreshData = () => {
  reportsStore.loadTimesheet()
}

const toggleShowEmpty = () => {
  showEmpty.value = !showEmpty.value
  // Логика показа пустых строк
}

const openDayDetails = (employee: EmployeeTimeData, date: string) => {
  const timeEntry = employee.entries[date] || null
  selectedDayData.value = {
    employeeId: employee.employeeId,
    employeeCode: employee.employeeCode,
    employeeName: employee.employeeName,
    date,
    timeEntry: timeEntry || undefined,
  }
  isDayDetailsModalOpen.value = true
}

const closeDayDetailsModal = () => {
  isDayDetailsModalOpen.value = false
  selectedDayData.value = null
}

watch([currentMonth, currentYear], () => {
  reportsStore.loadTimesheet()
})

onMounted(() => {
  reportsStore.loadDepartments()
  reportsStore.loadTimesheet()
})
</script>

<style scoped>
.compact-table-wrapper {
  max-height: 70vh;
  overflow: auto;
  position: relative;
}

.compact-timesheet-table {
  font-size: 0.75rem;
  line-height: 1.2;
  border-collapse: separate;
  border-spacing: 0;
  width: 100%;
}

.compact-timesheet-table th,
.compact-timesheet-table td {
  padding: 0.25rem 0.375rem;
}

/* Закрепление шапки */
.compact-timesheet-table thead {
  position: sticky;
  top: 0;
  z-index: 30;
}

.compact-timesheet-table thead th {
  background-color: rgb(243 244 246) !important;
  position: relative;
}

.dark .compact-timesheet-table thead th {
  background-color: rgb(31 41 55) !important;
}

/* Закрепление footer */
.compact-timesheet-table tfoot {
  position: sticky;
  bottom: 0;
  z-index: 30;
}

.compact-timesheet-table tfoot td {
  background-color: rgb(243 244 246) !important;
  position: relative;
}

.dark .compact-timesheet-table tfoot td {
  background-color: rgb(31 41 55) !important;
}

.compact-timesheet-table tfoot td.bg-yellow-100 {
  background-color: rgb(254 249 195) !important;
}

.dark .compact-timesheet-table tfoot td.bg-yellow-100 {
  background-color: rgb(113 63 18) !important;
}

.compact-timesheet-table tbody tr {
  height: auto;
  min-height: 32px;
}

.compact-timesheet-table tbody td {
  vertical-align: middle;
}

/* Улучшенный hover-эффект для ячеек */
.compact-timesheet-table tbody td:hover {
  background-color: rgb(229 231 235) !important;
}

.dark .compact-timesheet-table tbody td:hover {
  background-color: rgb(55 65 81) !important;
}

/* Hover для строки */
.compact-timesheet-table tbody tr:hover td {
  background-color: rgb(243 244 246) !important;
}

.dark .compact-timesheet-table tbody tr:hover td {
  background-color: rgb(55 65 81) !important;
}

/* Сохраняем фон для sticky ячеек при hover */
.compact-timesheet-table tbody tr:hover td.sticky {
  background-color: rgb(243 244 246) !important;
}

.dark .compact-timesheet-table tbody tr:hover td.sticky {
  background-color: rgb(55 65 81) !important;
}

/* Компактные стили для ячеек с временем */
.compact-timesheet-table .time-badge {
  font-size: 0.7rem;
  padding: 0.125rem 0.25rem;
  line-height: 1.2;
}

/* Убеждаемся, что sticky элементы имеют правильный фон */
.compact-timesheet-table thead th.sticky {
  background-color: rgb(243 244 246) !important;
}

.dark .compact-timesheet-table thead th.sticky {
  background-color: rgb(31 41 55) !important;
}

.compact-timesheet-table tfoot td.sticky {
  background-color: rgb(243 244 246) !important;
}

.dark .compact-timesheet-table tfoot td.sticky {
  background-color: rgb(31 41 55) !important;
}

/* Улучшенная прокрутка */
.compact-table-wrapper::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.compact-table-wrapper::-webkit-scrollbar-track {
  background: rgb(243 244 246);
}

.dark .compact-table-wrapper::-webkit-scrollbar-track {
  background: rgb(31 41 55);
}

.compact-table-wrapper::-webkit-scrollbar-thumb {
  background: rgb(156 163 175);
  border-radius: 4px;
}

.compact-table-wrapper::-webkit-scrollbar-thumb:hover {
  background: rgb(107 114 128);
}
</style>
