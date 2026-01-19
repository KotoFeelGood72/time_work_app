<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import type { TimeEntry, EmployeeTimeData } from '@/entities/timesheet-entities'
import { useReportsStore, useReportsStoreRefs } from '@/stores/useReportsStore'
import DepartmentModal from '@/components/dashboard/DepartmentModal.vue'
import DayDetailsModal from '@/components/dashboard/DayDetailsModal.vue'
import DateSelect from '@/components/dashboard/DateSelect.vue'
import EmployeeRow from '@/components/timesheet/EmployeeRow.vue'
import DayCell from '@/components/timesheet/DayCell.vue'
import TableSkeleton from '@/components/timesheet/TableSkeleton.vue'
import PageHead from '@/components/ui/head/PageHead.vue'
import ButtonComponent from '@/components/ui/buttons/ButtonComponent.vue'
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

// Данные для таблицы с итоговой строкой
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
      isTotalRow: false,
    }

    // Добавляем поля для каждой колонки дня
    daysInMonth.value.forEach((day) => {
      row[`day_${day.date}`] = employee.entries[day.date] || null
    })

    return row
  })

  // Добавляем итоговую строку в конец
  // Используем специальные значения для сортировки, чтобы строка всегда была последней
  const totalRow: Record<string, unknown> = {
    employee: {
      employeeName: `ИТОГО: ${timesheetData.value.workingDays} дн.`,
      employeeCode: 'zzzzzzzzzz', // Для сортировки - всегда в конце
      employeeId: '__total__',
      entries: {},
      totalHours: timesheetData.value.grandTotal.hours,
      totalMinutes: timesheetData.value.grandTotal.minutes,
    },
    isTotalRow: true,
    totalHours: timesheetData.value.grandTotal.hours,
    totalMinutes: timesheetData.value.grandTotal.minutes,
    // Специальные значения для сортировки - всегда последние
    _sortEmployee: 'zzzzzzzzzz',
    _sortTotal: 999999999,
  }

  // Добавляем поля для каждого дня в итоговой строке
  daysInMonth.value.forEach((day) => {
    totalRow[`day_${day.date}`] = getDailyTotal(day.date)
  })

  rows.push(totalRow)

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

<template>
  <div class="reports-view min-h-screen bg-gray-50 dark:bg-gray-900 pt-4 px-6 pb-8">
    <PageHead title="Отчеты" class="pb-6">
      <template #actions>
        <div class="flex items-center gap-3">
        <span class="text-sm text-gray-600 dark:text-gray-400">Подразделение:</span>
        <!-- <button
          @click="openDepartmentModal"
          class="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg font-semibold text-sm text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          {{ selectedDepartment?.name || 'ВСЕ ПОДРАЗДЕЛЕНИЯ' }}
        </button> -->
        <ButtonComponent
          :text="selectedDepartment?.name || 'ВСЕ ПОДРАЗДЕЛЕНИЯ'"
          @click="openDepartmentModal"
        />
      </div>

      <DateSelect
        v-model="dateFilter"
      />
      </template>
    </PageHead>

    <!-- Ошибка -->
    <div v-if="error" class="text-red-600 dark:text-red-400 mb-4">
      {{ error }}
    </div>

    <!-- Skeleton Loader -->
    <TableSkeleton
      v-if="loading"
      :days-count="daysInMonth.length"
      :rows-count="10"
    />

    <!-- Таблица с vue3-datatable -->
    <div v-if="!loading && !error" class="timesheet-table-wrapper relative bg-white dark:bg-gray-900 rounded-lg overflow-hidden shadow-sm">
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
        pagination-info="Показано {0} по {1} из {2} записей"
        skin="bh-table-striped bh-table-hover"
        class="reports-table"
      >
        <!-- Слот для колонки с именем сотрудника -->
        <template #employee="props">
          <div v-if="(props.value || props.data).isTotalRow" class="px-4 py-3 text-gray-700 dark:text-gray-300 text-sm font-bold">
            {{ (props.value || props.data).employee?.employeeName || 'ИТОГО' }}
          </div>
          <EmployeeRow v-else :employee="props.value || props.data" />
        </template>

        <!-- Слоты для колонок дней -->
        <template
          v-for="day in daysInMonth"
          :key="day.date"
          #[`day_${day.date}`]="props"
        >
          <div v-if="(props.value || props.data).isTotalRow" class="px-2 py-3 text-center text-gray-700 dark:text-gray-300 text-sm font-semibold">
            <div v-if="props.value && typeof props.value === 'object' && 'hours' in props.value">
              {{ formatTime(props.value as TimeEntry) }}
            </div>
          </div>
          <DayCell
            v-else
            :employee="props.value || props.data"
            :date="day.date"
            :time-entry="(props.value || props.data).entries[day.date] || null"
            @click="openDayDetails"
          />
        </template>

        <!-- Слот для колонки итого -->
        <template #total="props">
          <div
            :class="[
              'px-2 py-1.5 text-center font-semibold text-xs',
              (props.value || props.data).isTotalRow
                ? 'text-gray-900 dark:text-white bg-yellow-100 dark:bg-yellow-900/30 font-bold'
                : 'text-black dark:text-white'
            ]"
          >
            {{ formatTotalTime((props.value || props.data).totalHours, (props.value || props.data).totalMinutes) }}
          </div>
        </template>
      </Vue3Datatable>
    </div>

    <!-- Кнопки действий -->
    <div class="flex items-center gap-2 pt-6">
      <ButtonComponent
        text="Сбросить кэш"
        variant="primary"
        @click="clearCache"
      />
      <ButtonComponent
        text="Обновить"
        @click="refreshData"
      />
      <ButtonComponent
        text="Показать пустые"
        @click="toggleShowEmpty"
      />
    </div>

    <!-- Модальное окно выбора подразделения -->
     <transition name="slide-top">
       <DepartmentModal
         :is-open="isDepartmentModalOpen"
         :departments="departments"
         :selected-department-id="selectedDepartment?.id"
         @close="closeDepartmentModal"
         @select="handleDepartmentSelect"
       />
     </transition>

    <!-- Модальное окно деталей дня -->
     <transition name="slide-left">
       <DayDetailsModal
         :is-open="isDayDetailsModalOpen"
         :employee-id="selectedDayData?.employeeId || ''"
         :employee-code="selectedDayData?.employeeCode || ''"
         :employee-name="selectedDayData?.employeeName || ''"
         :date="selectedDayData?.date || ''"
         :time-entry="selectedDayData?.timeEntry"
         @close="closeDayDetailsModal"
       />
     </transition>
  </div>
</template>

<style scoped>
.reports-view {
  background-image:
    linear-gradient(to right, rgba(0, 0, 0, 0.02) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(0, 0, 0, 0.02) 1px, transparent 1px);
  background-size: 20px 20px;
}

/* Стили для таблицы в стиле GanttChart */
.timesheet-table-wrapper {
  border: 1px solid rgb(229 231 235);
  overflow-x: auto;
}

.dark .timesheet-table-wrapper {
  border-color: rgb(55 65 81);
}

.reports-table :deep(.bh-table-striped) {
  border-collapse: separate;
  border-spacing: 0;
}

.reports-table :deep(.bh-table-striped thead th) {
  background-color: rgb(249 250 251) !important;
  border-bottom: 1px solid rgb(229 231 235);
  border-right: 1px solid rgb(229 231 235);
  padding: 1rem;
  font-weight: 600;
  font-size: 0.875rem;
  color: rgb(55 65 75);
  text-align: left;
}

.dark .reports-table :deep(.bh-table-striped thead th) {
  background-color: rgb(31 41 55) !important;
  border-color: rgb(55 65 81);
  color: rgb(209 213 219);
}

/* Закрепление первой колонки (заголовок) */
.reports-table :deep(.bh-table-striped thead th:first-child) {
  position: sticky;
  left: 0;
  z-index: 10;
  background-color: rgb(249 250 251) !important;
  box-shadow: 2px 0 4px rgba(0, 0, 0, 0.1);
}

.dark .reports-table :deep(.bh-table-striped thead th:first-child) {
  background-color: rgb(31 41 55) !important;
  box-shadow: 2px 0 4px rgba(0, 0, 0, 0.3);
}

.reports-table :deep(.bh-table-striped tbody td) {
  border-bottom: 1px solid rgb(229 231 235);
  border-right: 1px solid rgb(229 231 235);
  padding: 1rem;
  background-color: white;
}

.dark .reports-table :deep(.bh-table-striped tbody td) {
  border-color: rgb(55 65 81);
  background-color: rgb(17 24 39);
}

/* Закрепление первой колонки (ячейки) */
.reports-table :deep(.bh-table-striped tbody td:first-child) {
  position: sticky;
  left: 0;
  z-index: 5;
  background-color: white !important;
  box-shadow: 2px 0 4px rgba(0, 0, 0, 0.1);
}

.dark .reports-table :deep(.bh-table-striped tbody td:first-child) {
  background-color: rgb(17 24 39) !important;
  box-shadow: 2px 0 4px rgba(0, 0, 0, 0.3);
}

.reports-table :deep(.bh-table-striped tbody tr:nth-child(even) td) {
  background-color: rgb(249 250 251);
}

.dark .reports-table :deep(.bh-table-striped tbody tr:nth-child(even) td) {
  background-color: rgb(31 41 55);
}

/* Сохраняем фон для закрепленной колонки в четных строках */
.reports-table :deep(.bh-table-striped tbody tr:nth-child(even) td:first-child) {
  background-color: rgb(249 250 251) !important;
}

.dark .reports-table :deep(.bh-table-striped tbody tr:nth-child(even) td:first-child) {
  background-color: rgb(31 41 55) !important;
}

/* При наведении на строку - светлый фон для всех ячеек */
.reports-table :deep(.bh-table-hover tbody tr:hover td) {
  background-color: rgb(249 250 251) !important;
}

.dark .reports-table :deep(.bh-table-hover tbody tr:hover td) {
  background-color: rgb(31 41 55) !important;
}

/* При наведении на конкретную ячейку - более темный фон, чем строка */
.reports-table :deep(.bh-table-hover tbody tr:hover td:hover) {
  background-color: rgb(243 244 246) !important;
}

.dark .reports-table :deep(.bh-table-hover tbody tr:hover td:hover) {
  background-color: rgb(55 65 81) !important;
}

/* Сохраняем фон для закрепленной колонки при hover */
.reports-table :deep(.bh-table-hover tbody tr:hover td:first-child) {
  background-color: rgb(249 250 251) !important;
}

.dark .reports-table :deep(.bh-table-hover tbody tr:hover td:first-child) {
  background-color: rgb(31 41 55) !important;
}

.reports-table :deep(.bh-table-hover tbody tr:hover td:first-child:hover) {
  background-color: rgb(243 244 246) !important;
}

.dark .reports-table :deep(.bh-table-hover tbody tr:hover td:first-child:hover) {
  background-color: rgb(55 65 81) !important;
}

/* Стили для итоговой строки в таблице */
.reports-table :deep(.bh-table-striped tbody tr:has(td:first-child:has-text("ИТОГО"))) {
  background-color: rgb(249 250 251) !important;
  border-top: 2px solid rgb(229 231 235);
}

.dark .reports-table :deep(.bh-table-striped tbody tr:has(td:first-child:has-text("ИТОГО"))) {
  background-color: rgb(31 41 55) !important;
  border-top-color: rgb(55 65 81);
}

/* Альтернативный способ - стилизация через последнюю строку */
.reports-table :deep(.bh-table-striped tbody tr:last-child) {
  /* border-top: 2px solid rgb(229 231 235); */
}

.dark .reports-table :deep(.bh-table-striped tbody tr:last-child) {
  border-top-color: rgb(55 65 81);
}

/* Стили для ячеек итоговой строки */
.reports-table :deep(.bh-table-striped tbody tr:last-child td) {
  background-color: rgb(249 250 251) !important;
  font-weight: 600;
}

.dark .reports-table :deep(.bh-table-striped tbody tr:last-child td) {
  background-color: rgb(31 41 55) !important;
}

/* Закрепление первой колонки в итоговой строке */
.reports-table :deep(.bh-table-striped tbody tr:last-child td:first-child) {
  position: sticky;
  left: 0;
  z-index: 5;
  background-color: rgb(249 250 251) !important;
  box-shadow: 2px 0 4px rgba(0, 0, 0, 0.1);
}

.dark .reports-table :deep(.bh-table-striped tbody tr:last-child td:first-child) {
  background-color: rgb(31 41 55) !important;
  box-shadow: 2px 0 4px rgba(0, 0, 0, 0.3);
}

/* Отключаем hover для итоговой строки */
.reports-table :deep(.bh-table-hover tbody tr:last-child:hover td) {
  background-color: rgb(249 250 251) !important;
}

.dark .reports-table :deep(.bh-table-hover tbody tr:last-child:hover td) {
  background-color: rgb(31 41 55) !important;
}

/* Стили для пагинации с отступами */
.reports-table :deep(.bh-table-pagination),
.reports-table :deep([class*="pagination"]) {
  padding-left: 1.5rem;
  padding-right: 1.5rem;
}

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

.slide-left-enter-active,
.slide-left-leave-active {
  transition: all 0.6s ease;
}

.slide-left-enter-from,
.slide-left-leave-to {
  transform: translateX(100%);
}

.slide-left-enter-to,
.slide-left-leave-from {
  transform: translateX(0);
}

.slide-top-enter-active,
.slide-top-leave-active {
  transition: all 0.3s ease;
  opacity: 0;
}

.slide-top-enter-from,
.slide-top-leave-to {
  transform: translateY(20%);
  opacity: 0;
}

.slide-top-enter-to,
.slide-top-leave-from {
  transform: translateY(0);
  opacity: 1;
}
</style>
