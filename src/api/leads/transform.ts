// Transform функции для преобразования данных лидов

import type { BitrixLeadRaw } from './dto'
import type { Lead, CreateLead, UpdateLead } from '@/entities/lead-entities'

class LeadTransformer {
  /**
   * Преобразует сырые данные Bitrix24 в Entity лида
   */
  fromDTO = (raw: BitrixLeadRaw): Lead => {
    const name = raw.NAME || ''
    const lastName = raw.LAST_NAME || ''
    const phones = raw.PHONE?.map((p) => p.VALUE) || []
    const emails = raw.EMAIL?.map((e) => e.VALUE) || []

    return {
      id: raw.ID,
      title: raw.TITLE || '',
      name: raw.NAME,
      lastName: raw.LAST_NAME,
      secondName: raw.SECOND_NAME,
      phone: phones.length > 0 ? phones : undefined,
      email: emails.length > 0 ? emails : undefined,
      statusId: raw.STATUS_ID,
      sourceId: raw.SOURCE_ID,
      companyId: raw.COMPANY_ID,
      contactId: raw.CONTACT_ID,
      fullName: `${name} ${lastName}`.trim() || raw.TITLE,
      primaryPhone: phones[0],
      primaryEmail: emails[0],
    }
  }

  /**
   * Преобразует массив сырых данных Bitrix24 в массив Entity лидов
   */
  fromDTOArray = (raw: BitrixLeadRaw[]): Lead[] => {
    return raw.map((item) => this.fromDTO(item))
  }

  /**
   * Преобразует Entity лида в формат Bitrix24 для создания
   */
  toBitrix = (dto: CreateLead): Record<string, unknown> => {
    const fields: Record<string, unknown> = {
      TITLE: dto.title,
    }

    if (dto.name) fields.NAME = dto.name
    if (dto.lastName) fields.LAST_NAME = dto.lastName
    if (dto.secondName) fields.SECOND_NAME = dto.secondName
    if (dto.phone && dto.phone.length > 0) {
      fields.PHONE = dto.phone.map((value) => ({ VALUE: value, VALUE_TYPE: 'WORK' }))
    }
    if (dto.email && dto.email.length > 0) {
      fields.EMAIL = dto.email.map((value) => ({ VALUE: value, VALUE_TYPE: 'WORK' }))
    }
    if (dto.statusId) fields.STATUS_ID = dto.statusId
    if (dto.sourceId) fields.SOURCE_ID = dto.sourceId
    if (dto.companyId) fields.COMPANY_ID = dto.companyId
    if (dto.contactId) fields.CONTACT_ID = dto.contactId

    return fields
  }

  /**
   * Преобразует Entity лида в формат Bitrix24 для обновления
   */
  toBitrixUpdate = (dto: UpdateLead): Record<string, unknown> => {
    const fields: Record<string, unknown> = {}

    if (dto.title !== undefined) fields.TITLE = dto.title
    if (dto.name !== undefined) fields.NAME = dto.name
    if (dto.lastName !== undefined) fields.LAST_NAME = dto.lastName
    if (dto.secondName !== undefined) fields.SECOND_NAME = dto.secondName
    if (dto.phone !== undefined && dto.phone.length > 0) {
      fields.PHONE = dto.phone.map((value) => ({ VALUE: value, VALUE_TYPE: 'WORK' }))
    }
    if (dto.email !== undefined && dto.email.length > 0) {
      fields.EMAIL = dto.email.map((value) => ({ VALUE: value, VALUE_TYPE: 'WORK' }))
    }
    if (dto.statusId !== undefined) fields.STATUS_ID = dto.statusId
    if (dto.sourceId !== undefined) fields.SOURCE_ID = dto.sourceId
    if (dto.companyId !== undefined) fields.COMPANY_ID = dto.companyId
    if (dto.contactId !== undefined) fields.CONTACT_ID = dto.contactId

    return fields
  }
}

export const TransformLead = new LeadTransformer()
