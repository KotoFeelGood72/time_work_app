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

    <!-- Таблица -->
    <div v-if="!loading && !error" class="overflow-x-auto">
      <table class="w-full border-collapse bg-white dark:bg-gray rounded-lg overflow-hidden">
        <thead>
          <tr class="bg-gray-100 dark:bg-gray-800">
            <th class="px-4 py-3 text-left border border-gray-300 dark:border-gray-600 text-black dark:text-white font-semibold sticky left-0 bg-gray-100 dark:bg-gray-800 z-10">
              ФИО сотрудника
            </th>
            <th
              v-for="day in daysInMonth"
              :key="day.date"
              class="px-2 py-3 text-center border border-gray-300 dark:border-gray-600 text-black dark:text-white font-semibold min-w-[80px]"
            >
              <div>{{ day.day }}</div>
              <div class="text-12 text-gray-600 dark:text-gray-400">{{ day.dayName }}</div>
            </th>
            <th class="px-4 py-3 text-center border border-gray-300 dark:border-gray-600 text-black dark:text-white font-semibold bg-gray-100 dark:bg-gray-800">
              Итого
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="employee in timesheetData.employees"
            :key="employee.employeeId"
            :class="[
              'hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors',
              selectedEmployeeId === employee.employeeId ? 'bg-yellow-100 dark:bg-yellow-900' : ''
            ]"
          >
            <td class="px-4 py-3 border border-gray-300 dark:border-gray-600 text-black dark:text-white font-medium sticky left-0 bg-white dark:bg-gray z-10">
              {{ employee.employeeCode }} {{ employee.employeeName }}
            </td>
            <td
              v-for="day in daysInMonth"
              :key="day.date"
              class="px-2 py-3 text-center border border-gray-300 dark:border-gray-600"
            >
              <div
                v-if="getTimeEntry(employee, day.date)"
                :class="[
                  'inline-block px-2 py-1 rounded',
                  getTimeEntry(employee, day.date)?.hours === 0 && getTimeEntry(employee, day.date)?.minutes !== 0
                    ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                    : 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
                ]"
              >
                {{ formatTime(getTimeEntry(employee, day.date)!) }}
        </div>
            </td>
            <td class="px-4 py-3 text-center border border-gray-300 dark:border-gray-600 text-black dark:text-white font-semibold bg-gray-50 dark:bg-gray-700">
              {{ formatTotalTime(employee.totalHours, employee.totalMinutes) }}
            </td>
          </tr>
          <!-- Итоговая строка -->
          <tr class="bg-gray-100 dark:bg-gray-800 font-bold">
            <td class="px-4 py-3 border border-gray-300 dark:border-gray-600 text-black dark:text-white sticky left-0 bg-gray-100 dark:bg-gray-800 z-10">
              ИТОГО Рабочих дней: {{ timesheetData.workingDays }}
            </td>
            <td
              v-for="day in daysInMonth"
              :key="day.date"
              class="px-2 py-3 text-center border border-gray-300 dark:border-gray-600 text-black dark:text-white"
            >
              <div v-if="getDailyTotal(day.date)">
                {{ formatTime(getDailyTotal(day.date)!) }}
      </div>
            </td>
            <td class="px-4 py-3 text-center border border-gray-300 dark:border-gray-600 text-black dark:text-white bg-yellow-100 dark:bg-yellow-900">
              {{ formatTotalTime(timesheetData.grandTotal.hours, timesheetData.grandTotal.minutes) }}
            </td>
          </tr>
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { fetchTimesheet, fetchDepartments } from '@/api/timesheet/api'
import type { TimesheetData, Department, TimeEntry, EmployeeTimeData } from '@/entities/timesheet-entities'
import DepartmentModal from '@/components/dashboard/DepartmentModal.vue'
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

watch([currentMonth, currentYear], () => {
  loadTimesheet()
})

onMounted(() => {
  loadDepartments()
  loadTimesheet()
})
</script>
