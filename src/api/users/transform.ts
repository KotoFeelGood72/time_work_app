// Transform функции для преобразования данных пользователей

import type { BitrixUserRaw } from './dto'
import type { User, CreateUser, UpdateUser } from '@/entities/user-entities'

class UserTransformer {
  /**
   * Преобразует сырые данные Bitrix24 в Entity пользователя
   */
  fromDTO = (raw: BitrixUserRaw): User => {
    const name = raw.NAME || ''
    const lastName = raw.LAST_NAME || ''

    return {
      id: raw.ID,
      name,
      lastName,
      secondName: raw.SECOND_NAME,
      email: raw.EMAIL || '',
      photo: raw.PERSONAL_PHOTO,
      mobile: raw.PERSONAL_MOBILE,
      position: raw.WORK_POSITION,
      active: raw.ACTIVE === 'Y' || raw.ACTIVE === 'true',
      fullName: `${name} ${lastName}`.trim(),
    }
  }

  /**
   * Преобразует массив сырых данных Bitrix24 в массив Entity пользователей
   */
  fromDTOArray = (raw: BitrixUserRaw[]): User[] => {
    return raw.map((item) => this.fromDTO(item))
  }

  /**
   * Преобразует Entity пользователя в формат Bitrix24 для создания
   */
  toBitrix = (dto: CreateUser): Record<string, unknown> => {
    const fields: Record<string, unknown> = {
      NAME: dto.name,
      LAST_NAME: dto.lastName,
      EMAIL: dto.email,
    }

    if (dto.secondName) fields.SECOND_NAME = dto.secondName
    if (dto.mobile) fields.PERSONAL_MOBILE = dto.mobile
    if (dto.position) fields.WORK_POSITION = dto.position
    if (dto.active !== undefined) fields.ACTIVE = dto.active ? 'Y' : 'N'

    return fields
  }

  /**
   * Преобразует Entity пользователя в формат Bitrix24 для обновления
   */
  toBitrixUpdate = (dto: UpdateUser): Record<string, unknown> => {
    const fields: Record<string, unknown> = {}

    if (dto.name !== undefined) fields.NAME = dto.name
    if (dto.lastName !== undefined) fields.LAST_NAME = dto.lastName
    if (dto.secondName !== undefined) fields.SECOND_NAME = dto.secondName
    if (dto.email !== undefined) fields.EMAIL = dto.email
    if (dto.mobile !== undefined) fields.PERSONAL_MOBILE = dto.mobile
    if (dto.position !== undefined) fields.WORK_POSITION = dto.position
    if (dto.active !== undefined) fields.ACTIVE = dto.active ? 'Y' : 'N'

    return fields
  }
}

export const TransformUser = new UserTransformer()
