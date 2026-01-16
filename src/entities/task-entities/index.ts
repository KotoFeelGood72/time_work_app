// Entities для работы с задачами на фронте

export interface Task {
  id: string
  title: string
  description?: string
  status: number
  createdBy: string
  responsibleId: string
  createdDate?: string
  deadline?: string
  priority?: number
  statusLabel?: string
  priorityLabel?: string
}

export interface CreateTask {
  title: string
  description?: string
  responsibleId: string
  createdBy?: string
  deadline?: string
  priority?: number
}

export interface UpdateTask {
  title?: string
  description?: string
  responsibleId?: string
  status?: number
  deadline?: string
  priority?: number
}

export interface TaskFilters {
  status?: number
  responsibleId?: string
  createdBy?: string
  priority?: number
  search?: string
}
