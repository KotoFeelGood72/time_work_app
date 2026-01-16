<template>
  <div class="relative date-picker-wrapper">
    <VueDatePicker
        v-model="selectedDate"
        :locale="locale"
        month-picker
        :enable-time-picker="false"
        :format="format"
        auto-apply
        @closed="handleDateChange(selectedDate)"
        @update:model-value="handleDateChange"
        class="datepicker-custom"
      />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { VueDatePicker } from '@vuepic/vue-datepicker'
import '@vuepic/vue-datepicker/dist/main.css'
import { ru } from 'date-fns/locale'

const props = defineProps<{
  modelValue: { month: number; year: number }
}>()

const emit = defineEmits<{
  'update:modelValue': [value: { month: number; year: number }]
}>()

const isOpen = ref(false)
const selectedDate = ref<Date>(new Date(props.modelValue.year, props.modelValue.month - 1, 1))

const locale = computed(() => ru)

const format = computed(() => {
  return 'MMMM yyyy'
})

const handleDateChange = (date: Date | null) => {
  if (date) {
    const month = date.getMonth() + 1
    const year = date.getFullYear()
    emit('update:modelValue', { month, year })
    isOpen.value = false
  }
}

const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement
  if (!target.closest('.date-picker-wrapper')) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

watch(() => props.modelValue, (newValue) => {
  selectedDate.value = new Date(newValue.year, newValue.month - 1, 1)
}, { deep: true })
</script>

<style scoped>
:deep(.dp__month_year_wrap) {
  display: flex;
  justify-content: center;
  gap: 8px;
}

:deep(.dp__month_year_select) {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text);
}

:deep(.dp__calendar_header_item) {
  font-weight: 600;
  color: var(--color-text);
}

:deep(.dp__cell_inner) {
  font-size: 14px;
}

:deep(.dp__calendar) {
  width: 100%;
}

:deep(.dp__calendar_header) {
  padding: 8px;
}

:deep(.dp__calendar_header_item) {
  padding: 4px;
}

:deep(.dp__main) {
  background-color: var(--color-background);
  color: var(--color-text);
}

:deep(.dp__inner_nav) {
  color: var(--color-text);
}

:deep(.dp__arrow_top) {
  border-top-color: var(--color-text);
}

:deep(.dp__arrow_bottom) {
  border-bottom-color: var(--color-text);
}

:deep(.dp__cell_inner) {
  color: var(--color-text);
}

:deep(.dp__cell_inner:hover) {
  background-color: var(--color-border-hover);
}

:deep(.dp__active_date) {
  background-color: #3b82f6;
  color: white;
}

:deep(.dp__range_start),
:deep(.dp__range_end) {
  background-color: #3b82f6;
  color: white;
}
</style>
