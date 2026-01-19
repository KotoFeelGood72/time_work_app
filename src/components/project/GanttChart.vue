<script setup lang="ts">
import { computed } from 'vue'

export interface ProjectTask {
  id: string
  title: string
  startDate: Date
  endDate: Date
  color: string
  assignees: Array<{
    id: string
    name: string
    avatar?: string
    initials: string
  }>
}

interface Props {
  tasks: ProjectTask[]
  startDate: Date
  endDate: Date
}

const props = defineProps<Props>()

// Генерируем дни между начальной и конечной датой
const days = computed(() => {
  const daysList: Array<{ date: Date; day: number; dayName: string; isToday: boolean }> = []
  const currentDate = new Date(props.startDate)
  const endDate = new Date(props.endDate)
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  while (currentDate <= endDate) {
    const dateCopy = new Date(currentDate)
    const dayIndex = dateCopy.getDay()
    const isToday = dateCopy.getTime() === today.getTime()

    daysList.push({
      date: new Date(dateCopy),
      day: dateCopy.getDate(),
      dayName: dayNames[dayIndex],
      isToday,
    })

    currentDate.setDate(currentDate.getDate() + 1)
  }

  return daysList
})

// Вычисляем позицию и ширину задачи в днях
const getTaskPosition = (task: ProjectTask) => {
  const start = new Date(props.startDate)
  start.setHours(0, 0, 0, 0)

  const taskStart = new Date(task.startDate)
  taskStart.setHours(0, 0, 0, 0)

  const taskEnd = new Date(task.endDate)
  taskEnd.setHours(0, 0, 0, 0)

  const daysDiff = Math.floor((taskStart.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
  const duration = Math.floor((taskEnd.getTime() - taskStart.getTime()) / (1000 * 60 * 60 * 24)) + 1

  return {
    left: daysDiff,
    width: duration,
  }
}

// Текущее время для индикатора
const currentTime = computed(() => {
  const now = new Date()
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const start = new Date(props.startDate)
  start.setHours(0, 0, 0, 0)

  const daysDiff = Math.floor((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
  const hours = now.getHours()
  const minutes = now.getMinutes()
  const timePosition = daysDiff + (hours * 60 + minutes) / (24 * 60)

  return {
    position: timePosition,
    time: `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`,
  }
})
</script>

<template>
  <div class="gantt-chart relative bg-white dark:bg-gray-900 rounded-lg overflow-hidden">
    <!-- Заголовок с днями -->
    <div class="flex border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
      <div class="w-48 flex-shrink-0 p-4 border-r border-gray-200 dark:border-gray-700">
        <span class="text-sm font-semibold text-gray-700 dark:text-gray-300">Task</span>
      </div>
      <div class="flex-1 flex">
        <div
          v-for="day in days"
          :key="day.date.getTime()"
          class="flex-1 p-4 text-center border-r border-gray-200 dark:border-gray-700 last:border-r-0"
          :class="day.isToday ? 'bg-blue-50 dark:bg-blue-900/20' : ''"
        >
          <div class="text-xs text-gray-500 dark:text-gray-400">{{ day.dayName }}</div>
          <div class="text-sm font-semibold text-gray-900 dark:text-white mt-1">{{ day.day }}</div>
        </div>
      </div>
    </div>

    <!-- Область задач -->
    <div class="relative overflow-x-auto">
      <div class="flex min-h-[400px]">
        <!-- Левая колонка с названиями задач -->
        <div class="w-48 flex-shrink-0 border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <div
            v-for="task in tasks"
            :key="task.id"
            class="p-4 border-b border-gray-200 dark:border-gray-700 h-20 flex items-center"
          >
            <div class="flex items-center gap-2">
              <div
                class="w-3 h-3 rounded-full"
                :style="{ backgroundColor: task.color }"
              ></div>
              <span class="text-sm font-medium text-gray-900 dark:text-white">{{ task.title }}</span>
            </div>
          </div>
        </div>

        <!-- Область с временной шкалой и задачами -->
        <div class="flex-1 relative">
          <!-- Сетка дней -->
          <div class="absolute inset-0 flex">
            <div
              v-for="day in days"
              :key="day.date.getTime()"
              class="flex-1 border-r border-gray-100 dark:border-gray-800 last:border-r-0"
              :class="day.isToday ? 'bg-blue-50/30 dark:bg-blue-900/10' : ''"
            ></div>
          </div>

          <!-- Индикатор текущего времени -->
          <div
            v-if="currentTime.position >= 0 && currentTime.position <= days.length"
            class="absolute top-0 bottom-0 w-0.5 bg-red-500 z-20"
            :style="{ left: `${(currentTime.position / days.length) * 100}%` }"
          >
            <div class="absolute -top-6 left-1/2 -translate-x-1/2 bg-red-500 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
              {{ currentTime.time }}
            </div>
          </div>

          <!-- Задачи -->
          <div class="relative h-full">
            <div
              v-for="(task, index) in tasks"
              :key="task.id"
              class="absolute top-0 h-20 flex items-center"
              :style="{
                left: `${(getTaskPosition(task).left / days.length) * 100}%`,
                width: `${(getTaskPosition(task).width / days.length) * 100}%`,
                top: `${index * 80}px`,
              }"
            >
              <div
                class="h-12 rounded-lg px-3 flex items-center gap-2 shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
                :style="{ backgroundColor: task.color }"
              >
                <!-- Аватары назначенных -->
                <div class="flex -space-x-2">
                  <div
                    v-for="assignee in task.assignees.slice(0, 3)"
                    :key="assignee.id"
                    class="w-6 h-6 rounded-full bg-white border-2 border-white flex items-center justify-center text-xs font-semibold text-gray-700"
                  >
                    {{ assignee.initials }}
                  </div>
                </div>
                <!-- Название задачи -->
                <span class="text-sm font-medium text-white flex-1 truncate">{{ task.title }}</span>
                <!-- Стрелка -->
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="text-white opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Кнопка "Add new" -->
    <div class="absolute bottom-4 right-4 flex items-center gap-2">
      <span class="text-sm text-gray-600 dark:text-gray-400">Add new</span>
      <button class="w-12 h-12 rounded-full bg-blue-500 hover:bg-blue-600 text-white flex items-center justify-center shadow-lg transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="12" y1="5" x2="12" y2="19"/>
          <line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
      </button>
    </div>
  </div>
</template>

<style scoped>
.gantt-chart {
  min-height: 500px;
}
</style>
