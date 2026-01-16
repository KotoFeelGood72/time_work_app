// Entities для работы с пользователями на фронте

export interface User {
  id: string
  name: string
  lastName: string
  secondName?: string
  email: string
  photo?: string
  mobile?: string
  position?: string
  active?: boolean
  fullName?: string
}

export interface CreateUser {
  name: string
  lastName: string
  secondName?: string
  email: string
  mobile?: string
  position?: string
  active?: boolean
}

export interface UpdateUser {
  name?: string
  lastName?: string
  secondName?: string
  email?: string
  mobile?: string
  position?: string
  active?: boolean
}

export interface UserFilters {
  search?: string
  active?: boolean
  position?: string
}
