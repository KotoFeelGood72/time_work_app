<template>
  <div class="home-view">
    <h1>Список пользователей</h1>
    
    <div v-if="loading" class="loading">Загрузка...</div>
    <div v-if="error" class="error">{{ error }}</div>
    
    <div v-if="!loading && !error && users.length > 0" class="users-list">
      <div v-for="user in users" :key="user.id" class="user-card">
        <div class="user-info">
          <h3>{{ user.fullName || `${user.name} ${user.lastName}` }}</h3>
          <p v-if="user.email" class="email">{{ user.email }}</p>
          <p v-if="user.position" class="position">{{ user.position }}</p>
          <p v-if="user.mobile" class="mobile">{{ user.mobile }}</p>
          <span :class="['status', user.active ? 'active' : 'inactive']">
            {{ user.active ? 'Активен' : 'Неактивен' }}
          </span>
        </div>
      </div>
    </div>
    
    <div v-if="!loading && !error && users.length === 0" class="empty">
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

<style scoped>
.home-view {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

h1 {
  margin-bottom: 20px;
  color: #333;
}

.loading {
  text-align: center;
  padding: 40px;
  font-size: 18px;
  color: #666;
}

.error {
  background-color: #fee;
  color: #c33;
  padding: 15px;
  border-radius: 4px;
  margin-bottom: 20px;
}

.users-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.user-card {
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s, box-shadow 0.2s;
}

.user-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.user-info h3 {
  margin: 0 0 10px 0;
  color: #333;
  font-size: 18px;
}

.user-info p {
  margin: 5px 0;
  color: #666;
  font-size: 14px;
}

.email {
  color: #0066cc;
}

.status {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  margin-top: 10px;
}

.status.active {
  background-color: #d4edda;
  color: #155724;
}

.status.inactive {
  background-color: #f8d7da;
  color: #721c24;
}

.empty {
  text-align: center;
  padding: 40px;
  color: #999;
  font-size: 16px;
}
</style>
