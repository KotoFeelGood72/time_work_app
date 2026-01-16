<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    @click.self="close"
  >
    <div
      class="bg-white dark:bg-gray rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col"
    >
      <!-- Заголовок -->
      <div class="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div class="flex items-center gap-3">
          <div class="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-sm font-semibold">
            {{ formattedDate }}
          </div>
          <div class="text-black dark:text-white">
            <div class="font-semibold">{{ employeeCode }} {{ employeeName }}</div>
          </div>
        </div>
        <button
          @click="close"
          class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-24 font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          ×
        </button>
      </div>

      <!-- Загрузка -->
      <div v-if="loading" class="p-8 text-center text-black dark:text-white">
        Загрузка задач...
      </div>

      <!-- Ошибка -->
      <div v-if="error" class="p-4 text-red-600 dark:text-red-400">
        {{ error }}
      </div>

      <!-- Список задач -->
      <div v-if="!loading && !error" class="flex-1 overflow-y-auto p-4">
        <div v-if="tasks.length === 0" class="text-center text-gray-500 dark:text-gray-400 py-8">
          Нет задач на эту дату
        </div>
        <div v-else class="space-y-3">
          <div
            v-for="task in tasks"
            :key="task.id"
            class="flex items-start gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <!-- Время -->
            <div
              :class="[
                'px-3 py-1.5 rounded font-semibold text-sm min-w-[60px] text-center',
                task.hours === 0 && task.minutes !== 0
                  ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                  : 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
              ]"
            >
              {{ formatTaskTime(task.hours, task.minutes) }}
            </div>
            
            <!-- Информация о задаче -->
            <div class="flex-1 min-w-0">
              <div class="text-sm text-gray-600 dark:text-gray-400 mb-1">
                #{{ task.id }}<span v-if="task.project"> / {{ task.project }}</span>
              </div>
              <a
                :href="getTaskUrl(task.id)"
                target="_blank"
                class="text-black dark:text-white font-medium hover:underline block"
              >
                {{ task.title }}
              </a>
              <div v-if="task.description" class="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                {{ task.description }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Итого -->
      <div
        v-if="!loading && !error && tasks.length > 0"
        class="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800"
      >
        <div class="flex justify-between items-center">
          <span class="font-semibold text-black dark:text-white">Итого:</span>
          <span class="font-bold text-lg text-black dark:text-white">
            {{ formatTotalTaskTime() }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { fetchTasks } from '@/api/tasks/api'
import type { Task } from '@/entities/task-entities'

interface TaskWithTime extends Task {
  hours: number
  minutes: number
  project?: string
}

const props = defineProps<{
  isOpen: boolean
  employeeId: string
  employeeCode: string
  employeeName: string
  date: string
}>()

const emit = defineEmits<{
  close: []
}>()

const loading = ref(false)
const error = ref<string | null>(null)
const tasks = ref<TaskWithTime[]>([])

const formattedDate = computed(() => {
  if (!props.date) return ''
  
  const date = new Date(props.date)
  const monthNames = [
    'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
    'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'
  ]
  const dayNames = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб']
  
  const day = date.getDate()
  const month = monthNames[date.getMonth()]
  const dayName = dayNames[date.getDay()]
  
  return `${day} ${month} ${dayName}`
})

const loadTasks = async () => {
  if (!props.isOpen || !props.employeeId || !props.date) return

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

    // Получаем задачи для сотрудника
    // Фильтруем по RESPONSIBLE_ID (исполнителю задачи)
    const fetchedTasks = await fetchTasks({
      filter: {
        RESPONSIBLE_ID: props.employeeId,
      },
      select: ['ID', 'TITLE', 'DESCRIPTION', 'STATUS', 'RESPONSIBLE_ID', 'CREATED_DATE', 'DEADLINE'],
      order: { CREATED_DATE: 'DESC' },
    })

    // Фильтруем задачи по дате (если есть CREATED_DATE или DEADLINE в выбранном диапазоне)
    const selectedDate = new Date(props.date)
    selectedDate.setHours(0, 0, 0, 0)
    const nextDate = new Date(selectedDate)
    nextDate.setDate(nextDate.getDate() + 1)

    const tasksForDate = fetchedTasks.filter((task) => {
      if (task.createdDate) {
        const taskDate = new Date(task.createdDate)
        taskDate.setHours(0, 0, 0, 0)
        return taskDate.getTime() === selectedDate.getTime()
      }
      return false
    })

    // Преобразуем задачи и добавляем время
    // В реальном приложении время должно приходить из API учета времени
    // Пока используем моковые данные или распределяем общее время равномерно
    const tasksWithTime: TaskWithTime[] = fetchedTasks.map((task, index) => {
      // Временная логика: распределяем время равномерно или используем данные из табеля
      // В реальном приложении нужно получать время из API учета времени
      const hours = index === 0 ? 6 : index === 1 ? 2 : 8
      const minutes = 0

      return {
        ...task,
        hours,
        minutes,
        project: 'promkuban', // В реальном приложении получать из задачи
      }
    })

    tasks.value = tasksWithTime
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Ошибка при загрузке задач'
    console.error('Ошибка загрузки задач:', err)
    tasks.value = []
  } finally {
    loading.value = false
  }
}

const formatTaskTime = (hours: number, minutes: number): string => {
  const h = hours.toString().padStart(2, '0')
  const m = minutes.toString().padStart(2, '0')
  return `${h}:${m}`
}

const formatTotalTaskTime = (): string => {
  const totalMinutes = tasks.value.reduce(
    (sum, task) => sum + task.hours * 60 + task.minutes,
    0
  )
  const h = Math.floor(totalMinutes / 60)
  const m = totalMinutes % 60
  return `${h}:${m.toString().padStart(2, '0')}`
}

const getTaskUrl = (taskId: string): string => {
  // Формируем URL задачи в Bitrix24
  if (typeof window !== 'undefined' && (window as any).location) {
    const baseUrl = window.location.origin
    return `${baseUrl}/company/personal/user/${props.employeeId}/tasks/task/view/${taskId}/`
  }
  return '#'
}

const close = () => {
  emit('close')
}

watch(() => props.isOpen, (newValue) => {
  if (newValue) {
    loadTasks()
  } else {
    tasks.value = []
    error.value = null
  }
})

watch([() => props.employeeId, () => props.date], () => {
  if (props.isOpen) {
    loadTasks()
  }
})
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
