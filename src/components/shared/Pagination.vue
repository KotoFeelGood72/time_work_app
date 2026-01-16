<template>
  <div class="pagination-wrapper flex items-center justify-between mt-4">
    <!-- Левая часть: текст и выбор количества записей -->
    <div class="flex items-center gap-2">
      <span class="text-sm text-gray-700 dark:text-gray-300">
        Показано {{ startEntry }} по {{ endEntry }} из {{ totalEntries }} записей
      </span>
      <select
        v-model="localPerPage"
        @change="handlePerPageChange"
        class="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-black dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option
          v-for="option in perPageOptions"
          :key="option"
          :value="option"
        >
          {{ option }}
        </option>
      </select>
    </div>

    <!-- Правая часть: кнопки навигации -->
    <div class="flex items-center gap-1">
      <!-- Первая страница -->
      <button
        @click="goToPage(1)"
        :disabled="currentPage === 1"
        :class="[
          'px-2 py-1 rounded text-sm transition-colors',
          currentPage === 1
            ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-600 cursor-not-allowed'
            : 'bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
        ]"
      >
        ««
      </button>

      <!-- Предыдущая страница -->
      <button
        @click="goToPage(currentPage - 1)"
        :disabled="currentPage === 1"
        :class="[
          'px-2 py-1 rounded text-sm transition-colors',
          currentPage === 1
            ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-600 cursor-not-allowed'
            : 'bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
        ]"
      >
        «
      </button>

      <!-- Номера страниц -->
      <button
        v-for="page in visiblePages"
        :key="page"
        @click="goToPage(page)"
        :class="[
          'px-3 py-1 rounded text-sm font-medium transition-colors',
          page === currentPage
            ? 'bg-blue-500 text-white'
            : 'bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
        ]"
      >
        {{ page }}
      </button>

      <!-- Следующая страница -->
      <button
        @click="goToPage(currentPage + 1)"
        :disabled="currentPage === totalPages"
        :class="[
          'px-2 py-1 rounded text-sm transition-colors',
          currentPage === totalPages
            ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-600 cursor-not-allowed'
            : 'bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
        ]"
      >
        »
      </button>

      <!-- Последняя страница -->
      <button
        @click="goToPage(totalPages)"
        :disabled="currentPage === totalPages"
        :class="[
          'px-2 py-1 rounded text-sm transition-colors',
          currentPage === totalPages
            ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-600 cursor-not-allowed'
            : 'bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
        ]"
      >
        »»
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

interface Props {
  currentPage: number
  perPage: number
  totalEntries: number
  perPageOptions?: number[]
  maxVisiblePages?: number
}

const props = withDefaults(defineProps<Props>(), {
  perPageOptions: () => [10, 25, 50, 100],
  maxVisiblePages: 5,
})

const emit = defineEmits<{
  'update:currentPage': [page: number]
  'update:perPage': [perPage: number]
  'page-change': [page: number]
  'per-page-change': [perPage: number]
}>()

const localPerPage = ref(props.perPage)

watch(() => props.perPage, (newValue) => {
  localPerPage.value = newValue
})

const totalPages = computed(() => {
  return Math.ceil(props.totalEntries / props.perPage)
})

const startEntry = computed(() => {
  if (props.totalEntries === 0) return 0
  return (props.currentPage - 1) * props.perPage + 1
})

const endEntry = computed(() => {
  const end = props.currentPage * props.perPage
  return Math.min(end, props.totalEntries)
})

const visiblePages = computed(() => {
  const pages: number[] = []
  const maxVisible = props.maxVisiblePages
  const total = totalPages.value
  const current = props.currentPage

  if (total <= maxVisible) {
    // Если страниц меньше или равно максимальному количеству видимых
    for (let i = 1; i <= total; i++) {
      pages.push(i)
    }
  } else {
    // Вычисляем диапазон страниц для отображения
    let start = Math.max(1, current - Math.floor(maxVisible / 2))
    const end = Math.min(total, start + maxVisible - 1)

    // Если мы близко к концу, корректируем начало
    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1)
    }

    for (let i = start; i <= end; i++) {
      pages.push(i)
    }
  }

  return pages
})

const goToPage = (page: number) => {
  if (page >= 1 && page <= totalPages.value && page !== props.currentPage) {
    emit('update:currentPage', page)
    emit('page-change', page)
  }
}

const handlePerPageChange = () => {
  emit('update:perPage', localPerPage.value)
  emit('per-page-change', localPerPage.value)
  // Сбрасываем на первую страницу при изменении количества записей на странице
  if (props.currentPage !== 1) {
    emit('update:currentPage', 1)
    emit('page-change', 1)
  }
}
</script>

<style scoped>
.pagination-wrapper {
  padding: 1rem 0;
}
</style>
