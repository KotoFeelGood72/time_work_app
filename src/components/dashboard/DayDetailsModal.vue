<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { fetchTasks } from '@/api/tasks/api'
import type { Task } from '@/entities/task-entities'
import { formatTime, formatTotalTime } from '@/utils/timeFormat'

interface TaskWithTime extends Task {
  hours: number
  minutes: number
  project?: string
}

interface TimeEntry {
  date: string
  hours: number
  minutes: number
}

const props = defineProps<{
  isOpen: boolean
  employeeId: string
  employeeCode: string
  employeeName: string
  date: string
  timeEntry?: TimeEntry
}>()

const emit = defineEmits<{
  close: []
}>()

const loading = ref(false)
const error = ref<string | null>(null)
const tasks = ref<TaskWithTime[]>([])

const formattedDateLong = computed(() => {
  if (!props.date) return ''

  const date = new Date(props.date)
  const dayNames = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота']

  const day = date.getDate().toString().padStart(2, '0')
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const dayName = dayNames[date.getDay()]

  return `${dayName} ${day}.${month}`
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

    // Фильтруем задачи по дате (если есть CREATED_DATE в выбранном диапазоне)
    const selectedDate = new Date(props.date)
    selectedDate.setHours(0, 0, 0, 0)

    const tasksForDate = fetchedTasks.filter((task) => {
      if (task.createdDate) {
        const taskDate = new Date(task.createdDate)
        taskDate.setHours(0, 0, 0, 0)
        return taskDate.getTime() === selectedDate.getTime()
      }
      return false
    })

    // Преобразуем задачи и добавляем время
    // Используем время из табеля, если оно есть, иначе распределяем равномерно
    const totalTimeMinutes = props.timeEntry
      ? props.timeEntry.hours * 60 + props.timeEntry.minutes
      : 8 * 60 // По умолчанию 8 часов

    const tasksWithTime: TaskWithTime[] = tasksForDate.map((task, index) => {
      // Распределяем время равномерно между задачами
      const totalTasks = tasksForDate.length
      const baseMinutes = totalTasks > 0 ? Math.floor(totalTimeMinutes / totalTasks) : 0
      const minutes = index < totalTasks - 1 ? baseMinutes : totalTimeMinutes - (baseMinutes * (totalTasks - 1))
      const hours = Math.floor(minutes / 60)
      const remainingMinutes = minutes % 60

      return {
        ...task,
        hours,
        minutes: remainingMinutes,
        project: 'promkuban', // В реальном приложении получать из задачи (GROUP_ID или UF_CRM_TASK)
      }
    })

    // Сортируем по времени (от большего к меньшему)
    tasksWithTime.sort((a, b) => {
      const aTotal = a.hours * 60 + a.minutes
      const bTotal = b.hours * 60 + b.minutes
      return bTotal - aTotal
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
  return formatTime({ date: '', hours, minutes })
}

const formatTotalTaskTime = (): string => {
  const totalMinutes = tasks.value.reduce(
    (sum, task) => sum + task.hours * 60 + task.minutes,
    0
  )
  const h = Math.floor(totalMinutes / 60)
  const m = totalMinutes % 60
  return formatTotalTime(h, m)
}

const getTaskUrl = (taskId: string): string => {
  // Формируем URL задачи в Bitrix24
  if (typeof window !== 'undefined' && window.location) {
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

<template>
  <div
    v-if="isOpen"
    class="fixed inset-0  dark:bg-gray-900 bg-opacity-80 flex items-center justify-end z-50 p-4"
    @click.self="close"
  >
    <div
      class="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-96 h-full flex flex-col overflow-hidden"
    >
      <!-- Заголовок -->
      <div class="flex items-start justify-between p-6 pb-4">
        <div class="flex-1">
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-1">Виктор Котенко</h2>
          <p class="text-sm text-gray-400 dark:text-gray-500">{{ formattedDateLong }}</p>
        </div>
        <button
          @click="close"
          class="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Загрузка -->
      <div v-if="loading" class="flex-1 flex items-center justify-center p-8">
        <div class="text-center">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mb-2"></div>
          <p class="text-gray-500 dark:text-gray-400">Загрузка задач...</p>
        </div>
      </div>

      <!-- Ошибка -->
      <div v-if="error" class="p-6 text-red-600 dark:text-red-400">
        {{ error }}
      </div>

      <!-- Список задач -->
      <div v-if="!loading && !error" class="flex-1 overflow-y-auto px-6 pb-6">
        <div v-if="tasks.length === 0" class="text-center text-gray-500 dark:text-gray-400 py-12">
          <p class="text-lg mb-2">Нет задач на эту дату</p>
          <p class="text-sm">{{ employeeName }}</p>
        </div>
        <div v-else class="space-y-6">
          <div
            v-for="(task, index) in tasks"
            :key="task.id"
            class="task-card"
          >
            <!-- Время и основная информация -->
            <div class="flex items-start gap-4 mb-6">
              <!-- Время -->
              <div class="text-4xl font-bold text-gray-900 dark:text-white leading-none pt-1">
                {{ formatTaskTime(task.hours, task.minutes) }}
              </div>

              <!-- Вертикальная линия и описание -->
              <div class="flex-1">
                <div class="flex items-start gap-4">
                  <!-- Фиолетовая вертикальная линия -->
                  <div class="w-1 h-full min-h-[60px] bg-purple-600 rounded-full shrink-0"></div>

                  <!-- Информация о задаче -->
                  <div class="flex-1">
                    <div class="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-1">
                      {{ task.project || 'Task' }}
                    </div>
                    <a
                      :href="getTaskUrl(task.id)"
                      target="_blank"
                      class="text-lg font-bold text-gray-900 dark:text-white hover:text-purple-600 dark:hover:text-purple-400 transition-colors block mb-2"
                    >
                      {{ task.title }}
                    </a>
                    <div v-if="task.description" class="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                      {{ task.description }}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Участники -->
            <div v-if="index === 0" class="mb-4">
              <div class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Participants:</div>
              <div class="flex items-center gap-2">
                <div class="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 border-2 border-white dark:border-gray-800 flex items-center justify-center text-white text-xs font-semibold">
                  {{ employeeName.charAt(0).toUpperCase() }}
                </div>
                <div class="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 border-2 border-white dark:border-gray-800 flex items-center justify-center text-white text-xs font-semibold">
                  ?
                </div>
                <div class="w-8 h-8 rounded-full bg-gradient-to-br from-pink-400 to-pink-600 border-2 border-white dark:border-gray-800 flex items-center justify-center text-white text-xs font-semibold">
                  ?
                </div>
              </div>
            </div>

            <!-- Инструменты -->
            <div v-if="index === 0" class="mb-4">
              <div class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tools:</div>
              <div class="flex items-center gap-2">
                <div class="w-10 h-10 rounded-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 flex items-center justify-center shadow-sm">
                  <svg class="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.64-.203-.658-.64.135-.954l11.566-4.458c.538-.196 1.006.128.832.941z"/>
                  </svg>
                </div>
                <div class="w-10 h-10 rounded-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 flex items-center justify-center shadow-sm">
                  <svg class="w-5 h-5 text-purple-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M15.852 8.861h-4.588V0H8.74v8.861H4.148L0 12.26l4.148 3.399h4.592V24h2.524v-8.341h4.588L15.852 12.26 15.852 8.861z"/>
                  </svg>
                </div>
                <div class="w-10 h-10 rounded-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 flex items-center justify-center shadow-sm">
                  <svg class="w-5 h-5 text-pink-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52 2.527 2.527 0 0 1 2.52 2.52zM24 15.165a2.527 2.527 0 0 1-2.52 2.523 2.527 2.527 0 0 1-2.523-2.523 2.527 2.527 0 0 1 2.523-2.52A2.528 2.528 0 0 1 24 15.165zM5.042 5.208A2.528 2.528 0 0 1 2.522 7.73 2.528 2.528 0 0 1 0 5.208 2.527 2.527 0 0 1 2.522 2.688 2.527 2.527 0 0 1 5.042 5.208z"/>
                  </svg>
                </div>
                <div class="w-10 h-10 rounded-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 flex items-center justify-center shadow-sm">
                  <svg class="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                  </svg>
                </div>
              </div>
            </div>

            <!-- Подзадачи -->
            <div v-if="index === 0" class="mb-2">
              <div class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Subtasks:</div>
              <div class="space-y-2">
                <div class="flex items-center gap-3 p-2 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800">
                  <div class="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center shrink-0">
                    <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span class="text-sm text-blue-600 dark:text-blue-400 font-medium">Подготовить материалы</span>
                </div>
                <div class="flex items-center gap-3 p-2 rounded-xl bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600">
                  <div class="w-5 h-5 rounded-full border-2 border-gray-300 dark:border-gray-500 shrink-0"></div>
                  <span class="text-sm text-gray-700 dark:text-gray-300">Получить материалы от клиента</span>
                </div>
                <div class="flex items-center gap-3 p-2 rounded-xl bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600">
                  <div class="w-5 h-5 rounded-full border-2 border-gray-300 dark:border-gray-500 shrink-0"></div>
                  <span class="text-sm text-gray-400 dark:text-gray-500">Завершить задачу</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Итого -->
      <div
        v-if="!loading && !error && tasks.length > 0"
        class="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50"
      >
        <div class="flex justify-between items-center">
          <span class="font-semibold text-gray-700 dark:text-gray-300">Итого:</span>
          <span class="font-bold text-lg text-gray-900 dark:text-white">
            {{ formatTotalTaskTime() }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.task-card {
  padding-bottom: 1rem;
  border-bottom: 1px solid rgb(229 231 235);
}

.task-card:last-child {
  border-bottom: none;
}

.dark .task-card {
  border-bottom-color: rgb(55 65 81);
}

/* Кастомный скроллбар */
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: transparent;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: rgb(209 213 219);
  border-radius: 3px;
}

.dark .overflow-y-auto::-webkit-scrollbar-thumb {
  background: rgb(75 85 99);
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: rgb(156 163 175);
}

.dark .overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: rgb(107 114 128);
}
</style>
