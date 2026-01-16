// API методы для работы с лидами

import { requestWrapper } from '../index'
import type { BitrixLeadRaw } from './dto'
import { TransformLead } from './transform'
import type { Lead, CreateLead, UpdateLead, LeadFilters } from '@/entities/lead-entities'

/**
 * Получить список лидов
 */
export const fetchLeads = (params: LeadFilters & {
  filter?: Record<string, unknown>
  select?: string[]
  order?: Record<string, string>
  start?: number
} = {}) => {
  const requestParams: Record<string, unknown> = {
    filter: params.filter || {},
    select: params.select || ['ID', 'TITLE', 'NAME', 'LAST_NAME', 'PHONE', 'EMAIL'],
    order: params.order || { ID: 'DESC' },
    start: params.start || 0,
  }

  return requestWrapper<BitrixLeadRaw[], Lead[]>(
    'crm.lead.list',
    requestParams,
    TransformLead.fromDTOArray
  )
}

/**
 * Получить лид по ID
 */
export const fetchLead = (leadId: string) =>
  requestWrapper<BitrixLeadRaw, Lead>(
    'crm.lead.get',
    { id: leadId },
    TransformLead.fromDTO
  )

/**
 * Создать лид
 */
export const createLead = (dto: CreateLead) => {
  const fields = TransformLead.toBitrix(dto)
  return requestWrapper<{ id: string }, { id: string }>(
    'crm.lead.add',
    { fields },
    (result) => result
  )
}

/**
 * Обновить лид
 */
export const updateLead = (leadId: string, dto: UpdateLead) => {
  const fields = TransformLead.toBitrixUpdate(dto)
  return requestWrapper<{ success: boolean }, boolean>(
    'crm.lead.update',
    { id: leadId, fields },
    (result) => result.success
  )
}

/**
 * Удалить лид
 */
export const deleteLead = (leadId: string) =>
  requestWrapper<{ success: boolean }, boolean>(
    'crm.lead.delete',
    { id: leadId },
    (result) => result.success
  )
