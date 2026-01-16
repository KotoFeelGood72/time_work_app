// API методы для работы с пользователями

import { requestWrapper } from '../index'
import type { BitrixUserRaw } from './dto'
import { TransformUser } from './transform'
import type { User, CreateUser, UpdateUser } from '@/entities/user-entities'

/**
 * Получить текущего пользователя
 */
export const fetchCurrentUser = () =>
  requestWrapper<BitrixUserRaw, User>(
    'user.current',
    {},
    TransformUser.fromDTO
  )

/**
 * Получить пользователя по ID
 */
export const fetchUser = (userId: string) =>
  requestWrapper<BitrixUserRaw, User>(
    'user.get',
    { ID: userId },
    TransformUser.fromDTO
  )

/**
 * Получить список пользователей
 */
export const fetchUsers = (params: {
  userId?: string
  filter?: Record<string, unknown>
  select?: string[]
} = {}) => {
  const requestParams: Record<string, unknown> = {}

  if (params.userId) {
    requestParams.ID = params.userId
  }

  if (params.filter) {
    requestParams.filter = params.filter
  }

  if (params.select) {
    requestParams.select = params.select
  }

  return requestWrapper<BitrixUserRaw[], User[]>(
    'user.get',
    requestParams,
    TransformUser.fromDTOArray
  )
}

/**
 * Создать пользователя
 */
export const createUser = (dto: CreateUser) => {
  const fields = TransformUser.toBitrix(dto)
  return requestWrapper<{ id: string }, { id: string }>(
    'user.add',
    { fields },
    (result) => result
  )
}

/**
 * Обновить пользователя
 */
export const updateUser = (userId: string, dto: UpdateUser) => {
  const fields = TransformUser.toBitrixUpdate(dto)
  return requestWrapper<{ success: boolean }, boolean>(
    'user.update',
    { ID: userId, fields },
    (result) => result.success
  )
}

/**
 * Удалить пользователя
 */
export const deleteUser = (userId: string) =>
  requestWrapper<{ success: boolean }, boolean>(
    'user.delete',
    { ID: userId },
    (result) => result.success
  )
