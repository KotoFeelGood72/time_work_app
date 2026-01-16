<template>
  <div class="home-view min-h-screen bg-white dark:bg-dark transition-colors duration-300 pt-20 px-4">
    <h1 class="text-35 font-bold text-black dark:text-white mb-6">Список пользователей</h1>

    <div v-if="loading" class="loading text-black dark:text-white">Загрузка...</div>
    <div v-if="error" class="error text-red-600 dark:text-red-400">{{ error }}</div>

    <div v-if="!loading && !error && users.length > 0" class="users-list grid gap-4">
      <div v-for="user in users" :key="user.id" class="user-card bg-white dark:bg-gray rounded-lg shadow-md p-4 border border-lightGray dark:border-gray transition-colors duration-300">
        <div class="user-info">
          <h3 class="text-20 font-bold text-black dark:text-white mb-2">{{ user.fullName || `${user.name} ${user.lastName}` }}</h3>
          <p v-if="user.email" class="email text-16 text-gray-700 dark:text-lightGrayText mb-1">{{ user.email }}</p>
          <p v-if="user.position" class="position text-16 text-gray-700 dark:text-lightGrayText mb-1">{{ user.position }}</p>
          <p v-if="user.mobile" class="mobile text-16 text-gray-700 dark:text-lightGrayText mb-2">{{ user.mobile }}</p>
          <span :class="['status', 'px-3', 'py-1', 'rounded-full', 'text-14', 'font-semibold', user.active ? 'active bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' : 'inactive bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200']">
            {{ user.active ? 'Активен' : 'Неактивен' }}
          </span>
        </div>
      </div>
    </div>

    <div v-if="!loading && !error && users.length === 0" class="empty text-18 text-gray-600 dark:text-lightGrayText">
      Пользователи не найдены
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { fetchUsers } from '@/api/users/api'
import type { User } from '@/entities/user-entities'

const users = ref<User[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

const loadUsers = async () => {
  loading.value = true
  error.value = null

  try {
    // Ждем инициализации BX24
    if (typeof window !== 'undefined' && (window as any).BX24) {
      const BX24 = (window as any).BX24

      await new Promise<void>((resolve) => {
        BX24.init(() => {
          resolve()
        })
      })
    }

    const result = await fetchUsers({
      select: ['ID', 'NAME', 'LAST_NAME', 'EMAIL', 'WORK_POSITION', 'PERSONAL_MOBILE', 'ACTIVE']
    })

    users.value = result
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Ошибка при загрузке пользователей'
    console.error('Ошибка загрузки пользователей:', err)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadUsers()
})
</script>


