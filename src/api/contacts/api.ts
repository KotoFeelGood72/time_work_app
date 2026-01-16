// API методы для работы с контактами

import { requestWrapper } from '../index'
import type { BitrixContactRaw } from './dto'
import { TransformContact } from './transform'
import type {
  Contact,
  CreateContact,
  UpdateContact,
  ContactFilters,
} from '@/entities/contact-entities'

/**
 * Получить список контактов
 */
export const fetchContacts = (params: ContactFilters & {
  filter?: Record<string, unknown>
  select?: string[]
  order?: Record<string, string>
  start?: number
} = {}) => {
  const requestParams: Record<string, unknown> = {
    filter: params.filter || {},
    select: params.select || ['ID', 'NAME', 'LAST_NAME', 'PHONE', 'EMAIL'],
    order: params.order || { ID: 'DESC' },
    start: params.start || 0,
  }

  return requestWrapper<BitrixContactRaw[], Contact[]>(
    'crm.contact.list',
    requestParams,
    TransformContact.fromDTOArray
  )
}

/**
 * Получить контакт по ID
 */
export const fetchContact = (contactId: string) =>
  requestWrapper<BitrixContactRaw, Contact>(
    'crm.contact.get',
    { id: contactId },
    TransformContact.fromDTO
  )

/**
 * Создать контакт
 */
export const createContact = (dto: CreateContact) => {
  const fields = TransformContact.toBitrix(dto)
  return requestWrapper<{ id: string }, { id: string }>(
    'crm.contact.add',
    { fields },
    (result) => result
  )
}

/**
 * Обновить контакт
 */
export const updateContact = (contactId: string, dto: UpdateContact) => {
  const fields = TransformContact.toBitrixUpdate(dto)
  return requestWrapper<{ success: boolean }, boolean>(
    'crm.contact.update',
    { id: contactId, fields },
    (result) => result.success
  )
}

/**
 * Удалить контакт
 */
export const deleteContact = (contactId: string) =>
  requestWrapper<{ success: boolean }, boolean>(
    'crm.contact.delete',
    { id: contactId },
    (result) => result.success
  )
