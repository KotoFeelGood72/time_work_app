// Transform функции для преобразования данных контактов

import type { BitrixContactRaw } from './dto'
import type { Contact, CreateContact, UpdateContact } from '@/entities/contact-entities'

class ContactTransformer {
  /**
   * Преобразует сырые данные Bitrix24 в Entity контакта
   */
  fromDTO = (raw: BitrixContactRaw): Contact => {
    const name = raw.NAME || ''
    const lastName = raw.LAST_NAME || ''
    const phones = raw.PHONE?.map((p) => p.VALUE) || []
    const emails = raw.EMAIL?.map((e) => e.VALUE) || []

    return {
      id: raw.ID,
      name,
      lastName: raw.LAST_NAME,
      secondName: raw.SECOND_NAME,
      phone: phones.length > 0 ? phones : undefined,
      email: emails.length > 0 ? emails : undefined,
      companyId: raw.COMPANY_ID,
      post: raw.POST,
      address: raw.ADDRESS,
      fullName: `${name} ${lastName}`.trim(),
      primaryPhone: phones[0],
      primaryEmail: emails[0],
    }
  }

  /**
   * Преобразует массив сырых данных Bitrix24 в массив Entity контактов
   */
  fromDTOArray = (raw: BitrixContactRaw[]): Contact[] => {
    return raw.map((item) => this.fromDTO(item))
  }

  /**
   * Преобразует Entity контакта в формат Bitrix24 для создания
   */
  toBitrix = (dto: CreateContact): Record<string, unknown> => {
    const fields: Record<string, unknown> = {
      NAME: dto.name,
    }

    if (dto.lastName) fields.LAST_NAME = dto.lastName
    if (dto.secondName) fields.SECOND_NAME = dto.secondName
    if (dto.phone && dto.phone.length > 0) {
      fields.PHONE = dto.phone.map((value) => ({ VALUE: value, VALUE_TYPE: 'WORK' }))
    }
    if (dto.email && dto.email.length > 0) {
      fields.EMAIL = dto.email.map((value) => ({ VALUE: value, VALUE_TYPE: 'WORK' }))
    }
    if (dto.companyId) fields.COMPANY_ID = dto.companyId
    if (dto.post) fields.POST = dto.post
    if (dto.address) fields.ADDRESS = dto.address

    return fields
  }

  /**
   * Преобразует Entity контакта в формат Bitrix24 для обновления
   */
  toBitrixUpdate = (dto: UpdateContact): Record<string, unknown> => {
    const fields: Record<string, unknown> = {}

    if (dto.name !== undefined) fields.NAME = dto.name
    if (dto.lastName !== undefined) fields.LAST_NAME = dto.lastName
    if (dto.secondName !== undefined) fields.SECOND_NAME = dto.secondName
    if (dto.phone !== undefined && dto.phone.length > 0) {
      fields.PHONE = dto.phone.map((value) => ({ VALUE: value, VALUE_TYPE: 'WORK' }))
    }
    if (dto.email !== undefined && dto.email.length > 0) {
      fields.EMAIL = dto.email.map((value) => ({ VALUE: value, VALUE_TYPE: 'WORK' }))
    }
    if (dto.companyId !== undefined) fields.COMPANY_ID = dto.companyId
    if (dto.post !== undefined) fields.POST = dto.post
    if (dto.address !== undefined) fields.ADDRESS = dto.address

    return fields
  }
}

export const TransformContact = new ContactTransformer()
