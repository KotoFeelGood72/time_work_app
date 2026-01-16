// Transform функции для преобразования данных компаний

import type { BitrixCompanyRaw } from './dto'
import type { Company, CreateCompany, UpdateCompany } from '@/entities/company-entities'

class CompanyTransformer {
  /**
   * Преобразует сырые данные Bitrix24 в Entity компании
   */
  fromDTO = (raw: BitrixCompanyRaw): Company => {
    const phones = raw.PHONE?.map((p) => p.VALUE) || []
    const emails = raw.EMAIL?.map((e) => e.VALUE) || []

    return {
      id: raw.ID,
      title: raw.TITLE || '',
      phone: phones.length > 0 ? phones : undefined,
      email: emails.length > 0 ? emails : undefined,
      address: raw.ADDRESS,
      website: raw.WEB,
      primaryPhone: phones[0],
      primaryEmail: emails[0],
    }
  }

  /**
   * Преобразует массив сырых данных Bitrix24 в массив Entity компаний
   */
  fromDTOArray = (raw: BitrixCompanyRaw[]): Company[] => {
    return raw.map((item) => this.fromDTO(item))
  }

  /**
   * Преобразует Entity компании в формат Bitrix24 для создания
   */
  toBitrix = (dto: CreateCompany): Record<string, unknown> => {
    const fields: Record<string, unknown> = {
      TITLE: dto.title,
    }

    if (dto.phone && dto.phone.length > 0) {
      fields.PHONE = dto.phone.map((value) => ({ VALUE: value, VALUE_TYPE: 'WORK' }))
    }
    if (dto.email && dto.email.length > 0) {
      fields.EMAIL = dto.email.map((value) => ({ VALUE: value, VALUE_TYPE: 'WORK' }))
    }
    if (dto.address) fields.ADDRESS = dto.address
    if (dto.website) fields.WEB = dto.website

    return fields
  }

  /**
   * Преобразует Entity компании в формат Bitrix24 для обновления
   */
  toBitrixUpdate = (dto: UpdateCompany): Record<string, unknown> => {
    const fields: Record<string, unknown> = {}

    if (dto.title !== undefined) fields.TITLE = dto.title
    if (dto.phone !== undefined && dto.phone.length > 0) {
      fields.PHONE = dto.phone.map((value) => ({ VALUE: value, VALUE_TYPE: 'WORK' }))
    }
    if (dto.email !== undefined && dto.email.length > 0) {
      fields.EMAIL = dto.email.map((value) => ({ VALUE: value, VALUE_TYPE: 'WORK' }))
    }
    if (dto.address !== undefined) fields.ADDRESS = dto.address
    if (dto.website !== undefined) fields.WEB = dto.website

    return fields
  }
}

export const TransformCompany = new CompanyTransformer()
