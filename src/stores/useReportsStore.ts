import { defineStore, storeToRefs } from 'pinia'
import { ref } from 'vue'
import { fetchTimesheet, fetchDepartments } from '@/api/timesheet/api'
import type { TimesheetData, Department } from '@/entities/timesheet-entities'

export const useReportsStore = defineStore('reports', () => {
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
  const currentMonth = ref(new Date().getMonth() + 1)
  const currentYear = ref(new Date().getFullYear())

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
        departmentId: selectedDepartment.value?.id || '0',
        departmentName: selectedDepartment.value?.name || 'Все подразделения',
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

  const setSelectedDepartment = (department: Department | null) => {
    selectedDepartment.value = department
  }

  const setDate = (month: number, year: number) => {
    currentMonth.value = month
    currentYear.value = year
  }

  const toggleDepartment = (department: Department) => {
    // Если выбран тот же отдел, снимаем выбор, иначе выбираем новый
    if (selectedDepartment.value?.id === department.id) {
      selectedDepartment.value = null
    } else {
      selectedDepartment.value = department
    }
  }

  return {
    loading,
    error,
    timesheetData,
    departments,
    selectedDepartment,
    currentMonth,
    currentYear,
    loadTimesheet,
    loadDepartments,
    setSelectedDepartment,
    setDate,
    toggleDepartment,
  }
})

export const useReportsStoreRefs = () => storeToRefs(useReportsStore())
