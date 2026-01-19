<script setup lang="ts">
import { ref, computed } from 'vue'
import GanttChart, { type ProjectTask } from '@/components/project/GanttChart.vue'

// Моковые данные задач (можно заменить на реальные данные из API)
const tasks = ref<ProjectTask[]>([
  {
    id: '1',
    title: 'Yogi Landing Page',
    startDate: new Date(2021, 4, 7), // May 7
    endDate: new Date(2021, 4, 9), // May 9
    color: '#10B981', // green
    assignees: [
      { id: '1', name: 'User 1', initials: 'U1' },
      { id: '2', name: 'User 2', initials: 'U2' },
    ],
  },
  {
    id: '2',
    title: 'Research',
    startDate: new Date(2021, 4, 7),
    endDate: new Date(2021, 4, 9),
    color: '#EF4444', // red
    assignees: [
      { id: '3', name: 'User 3', initials: 'U3' },
    ],
  },
  {
    id: '3',
    title: 'User Flow',
    startDate: new Date(2021, 4, 8),
    endDate: new Date(2021, 4, 11),
    color: '#F59E0B', // yellow
    assignees: [
      { id: '4', name: 'User 4', initials: 'U4' },
      { id: '5', name: 'User 5', initials: 'U5' },
      { id: '6', name: 'User 6', initials: 'U6' },
    ],
  },
  {
    id: '4',
    title: 'Call',
    startDate: new Date(2021, 4, 8),
    endDate: new Date(2021, 4, 9),
    color: '#3B82F6', // blue
    assignees: [
      { id: '7', name: 'User 7', initials: 'U7' },
      { id: '8', name: 'User 8', initials: 'U8' },
    ],
  },
  {
    id: '5',
    title: 'Report',
    startDate: new Date(2021, 4, 11),
    endDate: new Date(2021, 4, 12),
    color: '#F97316', // orange
    assignees: [
      { id: '9', name: 'User 9', initials: 'U9' },
    ],
  },
  {
    id: '6',
    title: 'Key Visual',
    startDate: new Date(2021, 4, 13),
    endDate: new Date(2021, 4, 15),
    color: '#06B6D4', // light blue
    assignees: [
      { id: '10', name: 'User 10', initials: 'U10' },
    ],
  },
  {
    id: '7',
    title: 'UX Wireframes',
    startDate: new Date(2021, 4, 9),
    endDate: new Date(2021, 4, 12),
    color: '#8B5CF6', // purple
    assignees: [
      { id: '11', name: 'User 11', initials: 'U11' },
      { id: '12', name: 'User 12', initials: 'U12' },
      { id: '13', name: 'User 13', initials: 'U13' },
    ],
  },
  {
    id: '8',
    title: 'UI Design',
    startDate: new Date(2021, 4, 14),
    endDate: new Date(2021, 4, 16),
    color: '#14B8A6', // teal
    assignees: [
      { id: '14', name: 'User 14', initials: 'U14' },
    ],
  },
])

// Диапазон дат для отображения
const startDate = computed(() => new Date(2021, 4, 7)) // May 7, 2021
const endDate = computed(() => new Date(2021, 4, 16)) // May 16, 2021

// Моковые данные для Onboard
const onboardMembers = ref([
  { id: '1', name: 'User 1', avatar: null, initials: 'U1' },
  { id: '2', name: 'User 2', avatar: null, initials: 'U2' },
  { id: '3', name: 'User 3', avatar: null, initials: 'U3' },
  { id: '4', name: 'User 4', avatar: null, initials: 'U4' },
])

const selectedMonth = ref('May 2021')
</script>

<template>
  <div class="project-tasks-view min-h-screen bg-gray-50 dark:bg-gray-900 pt-4 px-6 pb-8">
    <!-- Заголовок секции -->
    <div class="mb-6">
      <div class="flex items-center justify-between mb-4">
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Project Tasks</h1>

        <div class="flex items-center gap-6">
          <!-- Onboard секция -->
          <div class="flex items-center gap-3">
            <span class="text-sm text-gray-600 dark:text-gray-400">Onboard:</span>
            <div class="flex -space-x-2">
              <div
                v-for="member in onboardMembers"
                :key="member.id"
                class="w-8 h-8 rounded-full bg-blue-500 border-2 border-white flex items-center justify-center text-xs font-semibold text-white"
              >
                {{ member.initials }}
              </div>
              <button class="w-8 h-8 rounded-full bg-blue-500 border-2 border-white flex items-center justify-center text-white hover:bg-blue-600 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"/>
                  <line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
              </button>
            </div>
          </div>

          <!-- Date Selector -->
          <div class="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-gray-600 dark:text-gray-400">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            <span class="text-sm font-medium text-gray-900 dark:text-white">{{ selectedMonth }}</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-gray-600 dark:text-gray-400">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </div>
        </div>
      </div>
    </div>

    <!-- Gantt Chart -->
    <GanttChart
      :tasks="tasks"
      :start-date="startDate"
      :end-date="endDate"
    />
  </div>
</template>

<style scoped>
.project-tasks-view {
  background-image:
    linear-gradient(to right, rgba(0, 0, 0, 0.02) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(0, 0, 0, 0.02) 1px, transparent 1px);
  background-size: 20px 20px;
}
</style>
