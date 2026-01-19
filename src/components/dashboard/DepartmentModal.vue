<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Department } from '@/entities/timesheet-entities'
import inputSearch from '@/components/ui/inputs/InputSearch.vue'

const props = defineProps<{
  isOpen: boolean
  departments: Department[]
  selectedDepartmentId?: string
}>()

const emit = defineEmits<{
  close: []
  select: [department: Department]
}>()

const searchQuery = ref('')

const filteredDepartments = computed(() => {
  if (!searchQuery.value) {
    return props.departments
  }
  const query = searchQuery.value.toLowerCase()
  return props.departments.filter((dept) =>
    dept.name.toLowerCase().includes(query)
  )
})

const close = () => {
  searchQuery.value = ''
  emit('close')
}

const selectDepartment = (department: Department) => {
  emit('select', department)
  close()
}
</script>

<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50 bg-black/10"
    @click.self="close"
  >
    <div
      class="bg-white dark:bg-gray rounded-lg shadow-xl w-full max-w-md mx-4 max-h-[80vh] flex flex-col"
    >
      <div class="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 class="text-20 font-bold text-black dark:text-white">Данные из Битрикс24</h2>
        <button
          @click="close"
          class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-24 font-bold"
        >
          ×
        </button>
      </div>

      <div class="p-4 border-b border-gray-200 dark:border-gray-700">
        <inputSearch
          v-model="searchQuery"
        />
      </div>

      <div class="flex-1 overflow-y-auto p-4">
        <div
          v-for="dept in filteredDepartments"
          :key="dept.id"
          @click="selectDepartment(dept)"
          :class="[
            'p-3 rounded-lg cursor-pointer mb-2 transition-colors',
            selectedDepartmentId === dept.id
              ? 'bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100'
              : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-black dark:text-white'
          ]"
        >
          <div class="font-semibold">{{ dept.name }}</div>
          <div
            v-if="dept.id === selectedDepartmentId"
            class="text-12 text-blue-600 dark:text-blue-400 mt-1"
          >
            По всей компании
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
