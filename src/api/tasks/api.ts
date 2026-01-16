// API методы для работы с задачами

import { requestWrapper } from '../index'
import type { BitrixTaskRaw } from './dto'
import { TransformTask } from './transform'
import type { Task, CreateTask, UpdateTask, TaskFilters } from '@/entities/task-entities'

/**
 * Получить список задач
 */
export const fetchTasks = (params: TaskFilters & {
  filter?: Record<string, unknown>
  select?: string[]
  order?: Record<string, string>
  start?: number
} = {}) => {
  const requestParams: Record<string, unknown> = {
    filter: params.filter || {},
    select: params.select || ['ID', 'TITLE', 'STATUS', 'CREATED_BY', 'RESPONSIBLE_ID'],
    order: params.order || { ID: 'DESC' },
    start: params.start || 0,
  }

  return requestWrapper<BitrixTaskRaw[], Task[]>(
    'tasks.task.list',
    requestParams,
    TransformTask.fromDTOArray
  )
}

/**
 * Получить задачу по ID
 */
export const fetchTask = (taskId: string) =>
  requestWrapper<BitrixTaskRaw, Task>(
    'tasks.task.get',
    { taskId },
    TransformTask.fromDTO
  )

/**
 * Создать задачу
 */
export const createTask = (dto: CreateTask) => {
  const fields = TransformTask.toBitrix(dto)
  return requestWrapper<{ task: { id: string } }, { id: string }>(
    'tasks.task.add',
    { fields },
    (result) => ({ id: result.task.id })
  )
}

/**
 * Обновить задачу
 */
export const updateTask = (taskId: string, dto: UpdateTask) => {
  const fields = TransformTask.toBitrixUpdate(dto)
  return requestWrapper<{ task: { id: string } }, boolean>(
    'tasks.task.update',
    { taskId, fields },
    (result) => !!result.task.id
  )
}

/**
 * Удалить задачу
 */
export const deleteTask = (taskId: string) =>
  requestWrapper<{ success: boolean }, boolean>(
    'tasks.task.delete',
    { taskId },
    (result) => result.success
  )
