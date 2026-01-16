<template>
  <div class="home-view min-h-screen bg-white dark:bg-dark transition-colors duration-300 pt-20 px-4 pb-8">
    <!-- Фильтры -->
    <div class="flex items-center gap-4 mb-6 flex-wrap">
      <DatePicker
        v-model="dateFilter"
        @update:model-value="handleDateChange"
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

    <!-- Компактная таблица -->
    <div v-if="!loading && !error" class="compact-table-wrapper">
      <table class="compact-timesheet-table w-full border-collapse bg-white dark:bg-gray rounded-lg overflow-hidden text-sm">
        <thead>
            <tr class="bg-gray-100 dark:bg-gray-800">
              <th class="px-2 py-1.5 text-left border border-gray-300 dark:border-gray-600 text-black dark:text-white font-semibold text-xs sticky left-0 bg-gray-100 dark:bg-gray-800 z-40 min-w-[140px]">
                ФИО сотрудника
              </th>
              <th
                v-for="day in daysInMonth"
                :key="day.date"
                class="px-1 py-1 text-center border border-gray-300 dark:border-gray-600 text-black dark:text-white font-semibold text-xs min-w-[50px] bg-gray-100 dark:bg-gray-800"
              >
                <div class="leading-tight">{{ day.day }}</div>
                <div class="text-10 text-gray-600 dark:text-gray-400 leading-tight">{{ day.dayName }}</div>
              </th>
              <th class="px-2 py-1.5 text-center border border-gray-300 dark:border-gray-600 text-black dark:text-white font-semibold text-xs bg-gray-100 dark:bg-gray-800 min-w-[60px] sticky right-0 z-40">
                Итого
              </th>
            </tr>
          </thead>
        <tbody>
          <tr
            v-for="employee in timesheetData.employees"
            :key="employee.employeeId"
            :class="[
              'group transition-colors',
              selectedEmployeeId === employee.employeeId ? 'bg-yellow-100 dark:bg-yellow-900' : ''
            ]"
          >
            <td class="px-2 py-1.5 border border-gray-300 dark:border-gray-600 text-black dark:text-white font-medium text-xs sticky left-0 bg-white dark:bg-gray z-20 group-hover:bg-gray-100 dark:group-hover:bg-gray-700 transition-colors">
              <div class="whitespace-nowrap">{{ employee.employeeCode }} {{ employee.employeeName }}</div>
            </td>
            <td
              v-for="day in daysInMonth"
              :key="day.date"
              class="px-1 py-1 text-center border border-gray-300 dark:border-gray-600 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 group-hover:bg-gray-100 dark:group-hover:bg-gray-700 transition-colors"
              @click="openDayDetails(employee, day.date)"
            >
              <div
                v-if="getTimeEntry(employee, day.date)"
                :class="[
                  'inline-block px-1 py-0.5 rounded text-xs font-medium',
                  getTimeEntry(employee, day.date)?.hours === 0 && getTimeEntry(employee, day.date)?.minutes !== 0
                    ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                    : 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
                ]"
              >
                {{ formatTime(getTimeEntry(employee, day.date)!) }}
              </div>
              <div
                v-else
                class="w-full h-full min-h-[24px] flex items-center justify-center"
              >
                <span class="text-gray-300 dark:text-gray-600 text-xs">—</span>
        </div>
            </td>
            <td class="px-2 py-1.5 text-center border border-gray-300 dark:border-gray-600 text-black dark:text-white font-semibold text-xs bg-gray-50 dark:bg-gray-700 sticky right-0 z-20 group-hover:bg-gray-100 dark:group-hover:bg-gray-700 transition-colors">
              {{ formatTotalTime(employee.totalHours, employee.totalMinutes) }}
            </td>
          </tr>
          <!-- Итоговая строка -->
          <tfoot class="sticky bottom-0 z-30">
            <tr class="bg-gray-100 dark:bg-gray-800 font-bold">
              <td class="px-2 py-1.5 border border-gray-300 dark:border-gray-600 text-black dark:text-white text-xs sticky left-0 bg-gray-100 dark:bg-gray-800 z-40">
                <div class="text-xs">ИТОГО: {{ timesheetData.workingDays }} дн.</div>
              </td>
              <td
                v-for="day in daysInMonth"
                :key="day.date"
                class="px-1 py-1 text-center border border-gray-300 dark:border-gray-600 text-black dark:text-white text-xs bg-gray-100 dark:bg-gray-800"
              >
                <div v-if="getDailyTotal(day.date)" class="font-semibold">
                  {{ formatTime(getDailyTotal(day.date)!) }}
      </div>
              </td>
              <td class="px-2 py-1.5 text-center border border-gray-300 dark:border-gray-600 text-black dark:text-white text-xs bg-yellow-100 dark:bg-yellow-900 font-bold sticky right-0 z-40">
                {{ formatTotalTime(timesheetData.grandTotal.hours, timesheetData.grandTotal.minutes) }}
              </td>
            </tr>
          </tfoot>
        </tbody>
      </table>
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
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { fetchTimesheet, fetchDepartments } from '@/api/timesheet/api'
import type { TimesheetData, Department, TimeEntry, EmployeeTimeData } from '@/entities/timesheet-entities'
import DepartmentModal from '@/components/dashboard/DepartmentModal.vue'
import DayDetailsModal from '@/components/dashboard/DayDetailsModal.vue'
import DatePicker from '@/components/dashboard/DatePicker.vue'

const loading = ref(false)
const error = ref<string | null>(null)
const timesheetData = ref<TimesheetData>({
  departmentName: '',
  month: new Date().getMonth() + 1,
  year: new Date().getFullYear(),
  employees: [],
  workingDays: 0,
  dailyTotals: {},
  grandTotal: { hours: 0, minutes: 0 },
})

const departments = ref<Department[]>([])
const selectedDepartment = ref<Department | null>(null)
const isDepartmentModalOpen = ref(false)
const selectedEmployeeId = ref<string | null>(null)
const showEmpty = ref(false)

const isDayDetailsModalOpen = ref(false)
const selectedDayData = ref<{
  employeeId: string
  employeeCode: string
  employeeName: string
  date: string
  timeEntry?: TimeEntry
} | null>(null)

const currentMonth = ref(new Date().getMonth() + 1)
const currentYear = ref(new Date().getFullYear())

const dateFilter = computed({
  get: () => ({
    month: currentMonth.value,
    year: currentYear.value,
  }),
  set: (value: { month: number; year: number }) => {
    currentMonth.value = value.month
    currentYear.value = value.year
  },
})

const daysInMonth = computed(() => {
  const days: Array<{ date: string; day: number; dayName: string }> = []
  const daysInMonthCount = new Date(currentYear.value, currentMonth.value, 0).getDate()
  const dayNames = ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб']

  for (let day = 1; day <= daysInMonthCount; day++) {
    const date = new Date(currentYear.value, currentMonth.value - 1, day)
    const dateStr = `${currentYear.value}-${String(currentMonth.value).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    const dayIndex = date.getDay()
    days.push({
      date: dateStr,
      day,
      dayName: dayNames[dayIndex] || 'вс',
    })
  }

  return days
})

const loadTimesheet = async () => {
  loading.value = true
  error.value = null

  try {
    if (typeof window !== 'undefined') {
      const windowWithBX24 = window as Window & {
        BX24?: {
          init: (callback: () => void) => void
        }
      }

      if (windowWithBX24.BX24) {
      await new Promise<void>((resolve) => {
          windowWithBX24.BX24!.init(() => {
          resolve()
        })
      })
      }
    }

    const result = await fetchTimesheet({
      month: currentMonth.value,
      year: currentYear.value,
      departmentId: selectedDepartment.value?.id,
      departmentName: selectedDepartment.value?.name || undefined,
    })

    timesheetData.value = result
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Ошибка при загрузке табеля'
    console.error('Ошибка загрузки табеля:', err)
  } finally {
    loading.value = false
  }
}

const loadDepartments = async () => {
  try {
    if (typeof window !== 'undefined') {
      const windowWithBX24 = window as Window & {
        BX24?: {
          init: (callback: () => void) => void
        }
      }

      if (windowWithBX24.BX24) {
        await new Promise<void>((resolve) => {
          windowWithBX24.BX24!.init(() => {
            resolve()
          })
        })
      }
    }

    const result = await fetchDepartments()
    departments.value = result
  } catch (err) {
    console.error('Ошибка загрузки подразделений:', err)
  }
}

const getTimeEntry = (employee: EmployeeTimeData, date: string): TimeEntry | null => {
  return employee.entries[date] || null
}

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

const handleDateChange = (value: { month: number; year: number }) => {
  currentMonth.value = value.month
  currentYear.value = value.year
}

const openDepartmentModal = () => {
  isDepartmentModalOpen.value = true
}

const closeDepartmentModal = () => {
  isDepartmentModalOpen.value = false
}

const handleDepartmentSelect = (department: Department) => {
  selectedDepartment.value = department
  loadTimesheet()
}

const clearCache = () => {
  // Очистка кэша (если нужно)
  console.log('Кэш очищен')
}

const refreshData = () => {
  loadTimesheet()
}

const toggleShowEmpty = () => {
  showEmpty.value = !showEmpty.value
  // Логика показа пустых строк
}

const openDayDetails = (employee: EmployeeTimeData, date: string) => {
  const timeEntry = getTimeEntry(employee, date)
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
  loadTimesheet()
})

onMounted(() => {
  loadDepartments()
  loadTimesheet()
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
