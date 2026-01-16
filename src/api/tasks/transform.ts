// Transform функции для преобразования данных задач

import type { BitrixTaskRaw } from './dto'
import type { Task, CreateTask, UpdateTask } from '@/entities/task-entities'

const statusLabels: Record<number, string> = {
  1: 'Новая',
  2: 'В работе',
  3: 'Ожидает выполнения',
  4: 'Выполнена',
  5: 'Отменена',
  6: 'Отложена',
  7: 'Отклонена',
}

const priorityLabels: Record<number, string> = {
  0: 'Нет',
  1: 'Низкая',
  2: 'Средняя',
  3: 'Высокая',
}

class TaskTransformer {
  /**
   * Преобразует сырые данные Bitrix24 в Entity задачи
   */
  fromDTO = (raw: BitrixTaskRaw): Task => {
    return {
      id: raw.ID,
      title: raw.TITLE || '',
      description: raw.DESCRIPTION,
      status: raw.STATUS || 0,
      createdBy: raw.CREATED_BY || '',
      responsibleId: raw.RESPONSIBLE_ID || '',
      createdDate: raw.CREATED_DATE,
      deadline: raw.DEADLINE,
      priority: raw.PRIORITY,
      statusLabel: statusLabels[raw.STATUS || 0] || 'Неизвестно',
      priorityLabel: priorityLabels[raw.PRIORITY || 0] || 'Неизвестно',
    }
  }

  /**
   * Преобразует массив сырых данных Bitrix24 в массив Entity задач
   */
  fromDTOArray = (raw: BitrixTaskRaw[]): Task[] => {
    return raw.map((item) => this.fromDTO(item))
  }

  /**
   * Преобразует Entity задачи в формат Bitrix24 для создания
   */
  toBitrix = (dto: CreateTask): Record<string, unknown> => {
    const fields: Record<string, unknown> = {
      TITLE: dto.title,
      RESPONSIBLE_ID: dto.responsibleId,
    }

    if (dto.description) fields.DESCRIPTION = dto.description
    if (dto.createdBy) fields.CREATED_BY = dto.createdBy
    if (dto.deadline) fields.DEADLINE = dto.deadline
    if (dto.priority !== undefined) fields.PRIORITY = dto.priority

    return fields
  }

  /**
   * Преобразует Entity задачи в формат Bitrix24 для обновления
   */
  toBitrixUpdate = (dto: UpdateTask): Record<string, unknown> => {
    const fields: Record<string, unknown> = {}

    if (dto.title !== undefined) fields.TITLE = dto.title
    if (dto.description !== undefined) fields.DESCRIPTION = dto.description
    if (dto.responsibleId !== undefined) fields.RESPONSIBLE_ID = dto.responsibleId
    if (dto.status !== undefined) fields.STATUS = dto.status
    if (dto.deadline !== undefined) fields.DEADLINE = dto.deadline
    if (dto.priority !== undefined) fields.PRIORITY = dto.priority

    return fields
  }
}

export const TransformTask = new TaskTransformer()
