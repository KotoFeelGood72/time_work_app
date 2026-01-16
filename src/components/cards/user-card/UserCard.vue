<template>
  <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 p-4 border border-gray-200 dark:border-gray-700">
    <div class="flex items-start gap-4">
      <!-- Фото пользователя -->
      <div class="shrink-0">
        <div
          v-if="user.photo"
          class="w-16 h-16 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700"
        >
          <img
            :src="user.photo"
            :alt="displayName"
            class="w-full h-full object-cover"
          />
        </div>
        <div
          v-else
          class="w-16 h-16 rounded-full bg-linear-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xl font-semibold"
        >
          {{ initials }}
        </div>
      </div>

      <!-- Информация о пользователе -->
      <div class="flex-1 min-w-0">
        <div class="flex items-start justify-between gap-2">
          <div class="flex-1 min-w-0">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white truncate">
              {{ displayName }}
            </h3>
            <p
              v-if="user.position"
              class="text-sm text-gray-600 dark:text-gray-400 mt-1"
            >
              {{ user.position }}
            </p>
          </div>

          <!-- Статус активности -->
          <div
            v-if="user.active !== undefined"
            class="shrink-0"
          >
            <span
              :class="[
                'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                user.active
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
              ]"
            >
              {{ user.active ? 'Активен' : 'Неактивен' }}
            </span>
          </div>
        </div>

        <!-- Контактная информация -->
        <div class="mt-3 space-y-1.5">
          <div
            v-if="user.email"
            class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400"
          >
            <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <span class="truncate">{{ user.email }}</span>
          </div>

          <div
            v-if="user.mobile"
            class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400"
          >
            <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            <span>{{ user.mobile }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { User } from '@/entities/user-entities'

interface Props {
  user: User
}

const props = defineProps<Props>()

const displayName = computed(() => {
  if (props.user.fullName) {
    return props.user.fullName
  }
  const parts = [props.user.name, props.user.lastName]
  if (props.user.secondName) {
    parts.splice(1, 0, props.user.secondName)
  }
  return parts.filter(Boolean).join(' ') || 'Без имени'
})

const initials = computed(() => {
  const first = props.user.name?.[0]?.toUpperCase() || ''
  const last = props.user.lastName?.[0]?.toUpperCase() || ''
  return (first + last) || '?'
})
</script>

<style scoped>
</style>
