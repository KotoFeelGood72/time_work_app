// Entities для работы с лидами на фронте

export interface Lead {
  id: string
  title: string
  name?: string
  lastName?: string
  secondName?: string
  phone?: string[]
  email?: string[]
  statusId?: string
  sourceId?: string
  companyId?: string
  contactId?: string
  fullName?: string
  primaryPhone?: string
  primaryEmail?: string
}

export interface CreateLead {
  title: string
  name?: string
  lastName?: string
  secondName?: string
  phone?: string[]
  email?: string[]
  statusId?: string
  sourceId?: string
  companyId?: string
  contactId?: string
}

export interface UpdateLead {
  title?: string
  name?: string
  lastName?: string
  secondName?: string
  phone?: string[]
  email?: string[]
  statusId?: string
  sourceId?: string
  companyId?: string
  contactId?: string
}

export interface LeadFilters {
  statusId?: string
  sourceId?: string
  companyId?: string
  search?: string
}
