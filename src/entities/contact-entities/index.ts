// Entities для работы с контактами на фронте

export interface Contact {
  id: string
  name: string
  lastName?: string
  secondName?: string
  phone?: string[]
  email?: string[]
  companyId?: string
  post?: string
  address?: string
  fullName?: string
  primaryPhone?: string
  primaryEmail?: string
}

export interface CreateContact {
  name: string
  lastName?: string
  secondName?: string
  phone?: string[]
  email?: string[]
  companyId?: string
  post?: string
  address?: string
}

export interface UpdateContact {
  name?: string
  lastName?: string
  secondName?: string
  phone?: string[]
  email?: string[]
  companyId?: string
  post?: string
  address?: string
}

export interface ContactFilters {
  companyId?: string
  search?: string
}
