// API методы для работы с компаниями

import { requestWrapper } from '../index'
import type { BitrixCompanyRaw } from './dto'
import { TransformCompany } from './transform'
import type {
  Company,
  CreateCompany,
  UpdateCompany,
  CompanyFilters,
} from '@/entities/company-entities'

/**
 * Получить список компаний
 */
export const fetchCompanies = (params: CompanyFilters & {
  filter?: Record<string, unknown>
  select?: string[]
  order?: Record<string, string>
  start?: number
} = {}) => {
  const requestParams: Record<string, unknown> = {
    filter: params.filter || {},
    select: params.select || ['ID', 'TITLE', 'PHONE', 'EMAIL'],
    order: params.order || { ID: 'DESC' },
    start: params.start || 0,
  }

  return requestWrapper<BitrixCompanyRaw[], Company[]>(
    'crm.company.list',
    requestParams,
    TransformCompany.fromDTOArray
  )
}

/**
 * Получить компанию по ID
 */
export const fetchCompany = (companyId: string) =>
  requestWrapper<BitrixCompanyRaw, Company>(
    'crm.company.get',
    { id: companyId },
    TransformCompany.fromDTO
  )

/**
 * Создать компанию
 */
export const createCompany = (dto: CreateCompany) => {
  const fields = TransformCompany.toBitrix(dto)
  return requestWrapper<{ id: string }, { id: string }>(
    'crm.company.add',
    { fields },
    (result) => result
  )
}

/**
 * Обновить компанию
 */
export const updateCompany = (companyId: string, dto: UpdateCompany) => {
  const fields = TransformCompany.toBitrixUpdate(dto)
  return requestWrapper<{ success: boolean }, boolean>(
    'crm.company.update',
    { id: companyId, fields },
    (result) => result.success
  )
}

/**
 * Удалить компанию
 */
export const deleteCompany = (companyId: string) =>
  requestWrapper<{ success: boolean }, boolean>(
    'crm.company.delete',
    { id: companyId },
    (result) => result.success
  )
