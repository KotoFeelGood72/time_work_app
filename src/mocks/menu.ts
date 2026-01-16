import DashboardIcon from '@/components/icons/DashboardIcon.vue'
import ProjectIcon from '@/components/icons/ProjectIcon.vue'
import TaskIcon from '@/components/icons/TaskIcon.vue'
import EmployeeIcon from '@/components/icons/EmployeeIcon.vue'
import RepIcon from '@/components/icons/RepIcon.vue'

export const menu = [
  {title: 'Главная', path: '/', icon: DashboardIcon},
  {title: 'Проекты', path: '/projects', icon: ProjectIcon},
  {title: 'Задачи', path: '/tasks', icon: TaskIcon},
  {title: 'Сотрудники', path: '/employees', icon: EmployeeIcon},
  {title: 'Отчеты', path: '/reports', icon: RepIcon},
]
