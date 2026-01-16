// Entities для работы с компаниями на фронте

export interface Company {
  id: string
  title: string
  phone?: string[]
  email?: string[]
  address?: string
  website?: string
  primaryPhone?: string
  primaryEmail?: string
}

export interface CreateCompany {
  title: string
  phone?: string[]
  email?: string[]
  address?: string
  website?: string
}

export interface UpdateCompany {
  title?: string
  phone?: string[]
  email?: string[]
  address?: string
  website?: string
}

export interface CompanyFilters {
  search?: string
}
