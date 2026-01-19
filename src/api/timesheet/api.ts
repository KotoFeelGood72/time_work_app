// API методы для работы с табелем учета рабочего времени

import { requestWrapper } from '../index'
import type {
  BitrixDepartmentRaw,
  TimemanStatusData,
  TimemanRecord,
  TimemanWorktime,
  TaskElapsedItem,
  TimemanTimecontrolReport,
  TimemanTimecontrolUser,
} from './dto'
import { TransformTimesheet } from './transform'
import type {
  TimesheetData,
  TimesheetFilters,
  Department,
} from '@/entities/timesheet-entities'

/**
 * Получить табель учета рабочего времени
 * Использует методы Bitrix24 API для получения данных табеля
 *
 * ПРИМЕЧАНИЕ: Метод timeman.timecontrol.list НЕ СУЩЕСТВУЕТ в Bitrix24 API.
 * Вместо него используются следующие методы (в порядке приоритета):
 * 0. timeman.timecontrol.reports.get - получение отчетов о времени работы сотрудников (НАИБОЛЕЕ ТОЧНЫЙ)
 * 1. tasks.elapseditem.getlist - получение времени, затраченного на задачи
 * 2. timeman.record.list - получение записей табеля времени (если доступен)
 * 3. timeman.worktime.list - получение записей рабочего времени (если доступен)
 * 4. timeman.status - получение статуса текущего пользователя (работает только для текущего пользователя)
 *
 * Документация:
 * - https://apidocs.bitrix24.com/api-reference/timeman/timecontrol/timeman-timecontrol-reports-get.html
 * - https://apidocs.bitrix24.ru/api-reference/tasks/elapsed-item/index.html
 * - https://apidocs.bitrix24.ru/api-reference/index.html
 */
export const fetchTimesheet = async (
  filters: TimesheetFilters
): Promise<TimesheetData> => {
  // Формируем параметры запроса
  const requestParams: Record<string, unknown> = {
    filter: {},
  }

  // Добавляем фильтры по дате
  if (filters.month && filters.year) {
    const startDate = new Date(filters.year, filters.month - 1, 1)
    const endDate = new Date(filters.year, filters.month, 0)

    requestParams.filter = {
      ...(requestParams.filter as Record<string, unknown>),
      '>=DATE_START': startDate.toISOString().split('T')[0],
      '<=DATE_START': endDate.toISOString().split('T')[0],
    }
  }

  // Фильтр по подразделению
  if (filters.departmentId) {
    requestParams.filter = {
      ...(requestParams.filter as Record<string, unknown>),
      UF_DEPARTMENT: filters.departmentId,
    }
  }

  // Получаем пользователей для формирования структуры табеля
  const userFilter: Record<string, unknown> = { ACTIVE: true }
  if (filters.departmentId && filters.departmentId !== '0') {
    userFilter.UF_DEPARTMENT = filters.departmentId
  }

  interface UserForTimesheet {
    ID: string
    NAME?: string
    LAST_NAME?: string
  }

  const users = await requestWrapper<UserForTimesheet[], UserForTimesheet[]>(
    'user.get',
    {
      filter: userFilter,
      select: ['ID', 'NAME', 'LAST_NAME'],
    },
    (result) => result
  )

  // Получаем данные о времени работы через timeman API
  // Пробуем несколько методов API для получения данных о времени работы сотрудников
  const startDate = filters.month && filters.year
    ? new Date(filters.year, filters.month - 1, 1)
    : new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  const endDate = filters.month && filters.year
    ? new Date(filters.year, filters.month, 0)
    : new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)

  const startDateStr = startDate.toISOString().split('T')[0] || ''
  const endDateStr = endDate.toISOString().split('T')[0] || ''

  // ПРИОРИТЕТ 0: Пробуем получить данные через timeman.timecontrol.reports.get
  // Это наиболее точный метод для получения данных о времени работы сотрудников
  // Документация: https://apidocs.bitrix24.com/api-reference/timeman/timecontrol/timeman-timecontrol-reports-get.html
  try {
    console.log('[Timesheet API] Пробуем получить данные через timeman.timecontrol.reports.get...')

    // Получаем отчеты для каждого пользователя
    const reportPromises = users.map(async (user) => {
      try {
        const report = await requestWrapper<TimemanTimecontrolReport, TimemanTimecontrolReport>(
          'timeman.timecontrol.reports.get',
          {
            USER_ID: parseInt(user.ID, 10),
            MONTH: filters.month || new Date().getMonth() + 1,
            YEAR: filters.year || new Date().getFullYear(),
            WORKDAY_HOURS: 8, // Стандартный рабочий день 8 часов
          },
          (result) => result
        )

        return { userId: user.ID, report }
      } catch (error) {
        console.warn(`[Timesheet API] Не удалось получить отчет для пользователя ${user.ID}:`, error)
        return { userId: user.ID, report: null }
      }
    })

    const reportsResults = await Promise.all(reportPromises)
    let reportsCount = 0

    reportsResults.forEach(({ userId, report }) => {
      if (!report?.result?.report?.days) return

      const user = users.find((u) => u.ID === userId)
      if (!user) return

      report.result.report.days.forEach((day) => {
        // Извлекаем дату из index (формат YYYYMMDD) или day_title
        let recordDate = ''
        if (day.index && day.index.length === 8) {
          // Формат YYYYMMDD
          const year = day.index.substring(0, 4)
          const month = day.index.substring(4, 6)
          const date = day.index.substring(6, 8)
          recordDate = `${year}-${month}-${date}`
        } else if (day.workday_date_start) {
          const tParts = day.workday_date_start.split('T')
          const spaceParts = day.workday_date_start.split(' ')
          const datePart = (tParts[0] || spaceParts[0] || '').trim()
          if (datePart) {
            recordDate = datePart
          }
        } else if (day.day_title) {
          // Формат MM/DD/YYYY
          const parts = day.day_title.split('/')
          if (parts.length === 3) {
            const month = parts[0]?.trim()
            const date = parts[1]?.trim()
            const year = parts[2]?.trim()
            if (month && date && year) {
              recordDate = `${year}-${month.padStart(2, '0')}-${date.padStart(2, '0')}`
            }
          }
        }

        if (!recordDate || recordDate < startDateStr || recordDate > endDateStr) return

        // Используем workday_duration_final или workday_duration (в секундах)
        const durationSeconds = day.workday_duration_final || day.workday_duration || 0

        if (durationSeconds > 0) {
          const hours = Math.floor(durationSeconds / 3600)
          const minutes = Math.floor((durationSeconds % 3600) / 60)

          if (hours > 0 || minutes > 0) {
            timesheetEntries.push({
              ID: `${userId}_${recordDate}`,
              EMPLOYEE_ID: userId,
              EMPLOYEE_NAME: `${user.NAME || ''} ${user.LAST_NAME || ''}`.trim() || userId,
              EMPLOYEE_CODE: `#${userId}`,
              DATE: recordDate,
              HOURS: hours,
              MINUTES: minutes,
            })
            reportsCount++
          }
        }
      })
    })

    if (reportsCount > 0) {
      console.log(`[Timesheet API] Получено ${reportsCount} записей через timeman.timecontrol.reports.get`)
    } else {
      console.log('[Timesheet API] timeman.timecontrol.reports.get вернул пустой результат')
    }
  } catch (error) {
    console.warn('[Timesheet API] Не удалось получить данные через timeman.timecontrol.reports.get:', error)
    // Пробуем альтернативные методы
  }

  if (!startDateStr || !endDateStr) {
    console.error('Не удалось определить даты для запроса')
    // Возвращаем пустую структуру
    return {
      departmentId: filters.departmentId,
      departmentName: filters.departmentName || 'Все подразделения',
      month: filters.month || new Date().getMonth() + 1,
      year: filters.year || new Date().getFullYear(),
      employees: users.map((user) => ({
        employeeId: user.ID,
        employeeName: `${user.NAME || ''} ${user.LAST_NAME || ''}`.trim() || user.ID,
        employeeCode: `#${user.ID}`,
        entries: {},
        totalHours: 0,
        totalMinutes: 0,
      })),
      workingDays: 0,
      dailyTotals: {},
      grandTotal: { hours: 0, minutes: 0 },
    }
  }

  const timesheetEntries: Array<{
    ID: string
    EMPLOYEE_ID: string
    EMPLOYEE_NAME: string
    EMPLOYEE_CODE: string
    DATE: string
    HOURS: number
    MINUTES: number
    DEPARTMENT_ID?: string
    DEPARTMENT_NAME?: string
  }> = []

  // ПРИОРИТЕТ 1: Пробуем получить данные через tasks.elapseditem.getlist
  // Это наиболее надежный способ получения времени работы сотрудников через время, затраченное на задачи
  // Документация: https://apidocs.bitrix24.ru/api-reference/tasks/elapsed-item/index.html
  try {
    console.log('[Timesheet API] Пробуем получить данные через tasks.elapseditem.getlist...')

    // Получаем список ID пользователей для фильтрации
    // Если выбран конкретный департамент, используем только пользователей из этого департамента
    const userIds = users.map(u => u.ID)

    // Формируем фильтр для запроса
    const elapsedFilter: Record<string, unknown> = {
      '>=CREATED_DATE': `${startDateStr} 00:00:00`,
      '<=CREATED_DATE': `${endDateStr} 23:59:59`,
    }

    // Добавляем фильтр по пользователям, если они есть
    // Bitrix24 может поддерживать фильтр по массиву USER_ID
    if (userIds.length > 0) {
      if (userIds.length === 1) {
        elapsedFilter.USER_ID = userIds[0]
      } else {
        // Для нескольких пользователей пробуем использовать массив или оператор IN
        elapsedFilter.USER_ID = userIds
      }
    }

    const elapsedItems = await requestWrapper<TaskElapsedItem[] | { result?: TaskElapsedItem[] }, TaskElapsedItem[]>(
      'tasks.elapseditem.getlist',
      {
        filter: elapsedFilter,
        select: ['ID', 'TASK_ID', 'USER_ID', 'SECONDS', 'MINUTES', 'CREATED_DATE', 'DATE_START'],
        order: { CREATED_DATE: 'ASC' },
      },
      (result) => {
        // Обрабатываем разные форматы ответа
        if (Array.isArray(result)) {
          return result
        } else if (result && typeof result === 'object' && 'result' in result && Array.isArray(result.result)) {
          return result.result
        }
        return []
      }
    )

    if (Array.isArray(elapsedItems) && elapsedItems.length > 0) {
      console.log(`[Timesheet API] Получено ${elapsedItems.length} записей через tasks.elapseditem.getlist`)

      // Группируем записи по пользователям и датам
      const timeByUserAndDate = new Map<string, Map<string, number>>() // Map<userId, Map<date, seconds>>

      elapsedItems.forEach((item) => {
        const userId = item.USER_ID
        if (!userId) return

        // Определяем дату записи
        let recordDate = ''
        if (item.CREATED_DATE) {
          const parts = item.CREATED_DATE.split(' ')
          const dateParts = item.CREATED_DATE.split('T')
          recordDate = (parts[0] || dateParts[0] || '').trim()
        } else if (item.DATE_START) {
          const parts = item.DATE_START.split(' ')
          const dateParts = item.DATE_START.split('T')
          recordDate = (parts[0] || dateParts[0] || '').trim()
        }

        if (!recordDate || recordDate < startDateStr || recordDate > endDateStr) return

        // Получаем время в секундах
        let seconds = 0
        if (item.SECONDS) {
          seconds = item.SECONDS
        } else if (item.MINUTES) {
          seconds = item.MINUTES * 60
        }

        if (seconds <= 0) return

        // Группируем по пользователю и дате
        if (!timeByUserAndDate.has(userId)) {
          timeByUserAndDate.set(userId, new Map<string, number>())
        }

        const userDates = timeByUserAndDate.get(userId)!
        if (userDates) {
          const currentSeconds = userDates.get(recordDate) || 0
          userDates.set(recordDate, currentSeconds + seconds)
        }
      })

      // Преобразуем сгруппированные данные в формат табеля
      timeByUserAndDate.forEach((datesMap, userId) => {
        const user = users.find((u) => u.ID === userId)
        if (!user) return

        datesMap.forEach((totalSeconds, date) => {
          const hours = Math.floor(totalSeconds / 3600)
          const minutes = Math.floor((totalSeconds % 3600) / 60)

          if (hours > 0 || minutes > 0) {
            timesheetEntries.push({
              ID: `${userId}_${date}`,
              EMPLOYEE_ID: userId,
              EMPLOYEE_NAME: `${user.NAME || ''} ${user.LAST_NAME || ''}`.trim() || userId,
              EMPLOYEE_CODE: `#${userId}`,
              DATE: date,
              HOURS: hours,
              MINUTES: minutes,
            })
          }
        })
      })

      console.log(`[Timesheet API] Обработано ${timesheetEntries.length} записей времени из задач`)
    } else {
      console.log('[Timesheet API] tasks.elapseditem.getlist вернул пустой результат')
    }
  } catch (error) {
    console.warn('[Timesheet API] Не удалось получить данные через tasks.elapseditem.getlist:', error)
    // Пробуем альтернативные методы
  }

  // ПРИОРИТЕТ 2: Пробуем получить данные через timeman.record.list (если доступен)
  // Этот метод позволяет получить записи табеля времени для всех сотрудников
  if (timesheetEntries.length === 0) {
    try {
      console.log('[Timesheet API] Пробуем получить данные через timeman.record.list...')
    const records = await requestWrapper<TimemanRecord[], TimemanRecord[]>(
      'timeman.record.list',
      {
        filter: {
          '>=DATE_START': startDateStr,
          '<=DATE_START': endDateStr,
          ...(filters.departmentId && filters.departmentId !== '0' ? {} : {}), // Фильтр по департаменту будет применен позже
        },
        select: ['ID', 'USER_ID', 'DATE_START', 'DATE_FINISH', 'TIME_START', 'TIME_FINISH', 'DURATION'],
      },
      (result) => result
    )

    if (Array.isArray(records) && records.length > 0) {
      console.log(`[Timesheet API] Получено ${records.length} записей через timeman.record.list`)
      records.forEach((record) => {
        const userId = record.USER_ID
        const user = users.find((u) => u.ID === userId)
        if (!user) return

        const dateStart = record.DATE_START || record.DATE_FINISH
        if (!dateStart) return

        // Определяем дату записи
        const recordDate = dateStart.split(' ')[0] || dateStart.split('T')[0]
        if (!recordDate || recordDate < startDateStr || recordDate > endDateStr) return

        // Вычисляем длительность
        let durationSeconds = 0
        if (record.DURATION) {
          // Если DURATION в минутах (обычно так), умножаем на 60
          durationSeconds = record.DURATION > 10000 ? record.DURATION : record.DURATION * 60
        } else if (record.TIME_START && record.TIME_FINISH) {
          // Вычисляем разницу между временем начала и окончания
          const start = new Date(`${recordDate}T${record.TIME_START}`)
          const finish = new Date(`${recordDate}T${record.TIME_FINISH}`)
          if (!isNaN(start.getTime()) && !isNaN(finish.getTime())) {
            durationSeconds = Math.floor((finish.getTime() - start.getTime()) / 1000)
          }
        }

        if (durationSeconds > 0) {
          const hours = Math.floor(durationSeconds / 3600)
          const minutes = Math.floor((durationSeconds % 3600) / 60)

          if (hours > 0 || minutes > 0) {
            timesheetEntries.push({
              ID: `${userId}_${recordDate}`,
              EMPLOYEE_ID: userId,
              EMPLOYEE_NAME: `${user.NAME || ''} ${user.LAST_NAME || ''}`.trim() || userId,
              EMPLOYEE_CODE: `#${userId}`,
              DATE: recordDate,
              HOURS: hours,
              MINUTES: minutes,
            })
          }
        }
      })
    } else {
      console.log('[Timesheet API] timeman.record.list вернул пустой результат')
    }
    } catch (error) {
      console.warn('[Timesheet API] Не удалось получить данные через timeman.record.list:', error)
      // Пробуем альтернативный метод
    }
  }

  // ПРИОРИТЕТ 3: Если не получили данные через предыдущие методы, пробуем timeman.worktime.list
  if (timesheetEntries.length === 0) {
    try {
      console.log('[Timesheet API] Пробуем получить данные через timeman.worktime.list...')
      const worktimeRecords = await requestWrapper<TimemanWorktime[], TimemanWorktime[]>(
        'timeman.worktime.list',
        {
          filter: {
            '>=DATE': startDateStr,
            '<=DATE': endDateStr,
          },
        },
        (result) => result
      )

      if (Array.isArray(worktimeRecords) && worktimeRecords.length > 0) {
        worktimeRecords.forEach((record) => {
          const userId = record.USER_ID
          const user = users.find((u) => u.ID === userId)
          if (!user) return

          const recordDate = record.DATE || record.DATE_START?.split(' ')[0] || record.DATE_START?.split('T')[0]
          if (!recordDate || recordDate < startDateStr || recordDate > endDateStr) return

          let hours = record.HOURS || 0
          let minutes = record.MINUTES || 0

          if (record.DURATION && (hours === 0 && minutes === 0)) {
            // Если есть DURATION, но нет HOURS/MINUTES, вычисляем
            const durationSeconds = record.DURATION > 10000 ? record.DURATION : record.DURATION * 60
            hours = Math.floor(durationSeconds / 3600)
            minutes = Math.floor((durationSeconds % 3600) / 60)
          }

          if (hours > 0 || minutes > 0) {
            timesheetEntries.push({
              ID: `${userId}_${recordDate}`,
              EMPLOYEE_ID: userId,
              EMPLOYEE_NAME: `${user.NAME || ''} ${user.LAST_NAME || ''}`.trim() || userId,
              EMPLOYEE_CODE: `#${userId}`,
              DATE: recordDate,
              HOURS: hours,
              MINUTES: minutes,
            })
          }
        })
      } else {
        console.log('[Timesheet API] timeman.worktime.list вернул пустой результат')
      }
    } catch (error) {
      console.warn('[Timesheet API] Не удалось получить данные через timeman.worktime.list:', error)
    }
  }

  // ПРИОРИТЕТ 4: Если все еще нет данных, пробуем получить данные для каждого пользователя через timeman.status
  // (работает только для текущего пользователя или требует прав администратора)
  if (timesheetEntries.length === 0) {
    try {
      console.log('[Timesheet API] Пробуем получить данные через timeman.status (только для текущего пользователя)...')
      const statusData = await requestWrapper<TimemanStatusData, TimemanStatusData>(
        'timeman.status',
        {},
        (result) => result
      )

      if (statusData) {
        const result = statusData.result || statusData
        const timeData = statusData.time

        let dateStart: Date | null = null
        if (result.date_start) {
          if (typeof result.date_start === 'string') {
            dateStart = new Date(result.date_start)
          } else if (typeof result.date_start === 'number') {
            dateStart = new Date(result.date_start * 1000)
          }
        } else if (timeData?.start) {
          dateStart = new Date(timeData.start * 1000)
        } else if (result.start) {
          dateStart = new Date(result.start * 1000)
        }

        if (dateStart && !isNaN(dateStart.getTime()) && dateStart >= startDate && dateStart <= endDate) {
          const dateStr = dateStart.toISOString().split('T')[0]
          if (dateStr) {
            const durationSeconds = result.duration || timeData?.duration || 0
            const operatingSeconds = result.operating || 0
            const actualDuration = durationSeconds > 0 ? durationSeconds : operatingSeconds

            if (actualDuration > 0) {
              const hours = Math.floor(actualDuration / 3600)
              const minutes = Math.floor((actualDuration % 3600) / 60)

              if (hours > 0 || minutes > 0) {
                // Получаем ID текущего пользователя из ответа или используем первый из списка
                const currentUserId = users[0]?.ID || ''
                const currentUser = users.find(u => u.ID === currentUserId) || users[0]

                if (currentUser) {
                  timesheetEntries.push({
                    ID: `${currentUser.ID}_${dateStr}`,
                    EMPLOYEE_ID: currentUser.ID,
                    EMPLOYEE_NAME: `${currentUser.NAME || ''} ${currentUser.LAST_NAME || ''}`.trim() || currentUser.ID,
                    EMPLOYEE_CODE: `#${currentUser.ID}`,
                    DATE: dateStr,
                    HOURS: hours,
                    MINUTES: minutes,
                  })
                }
              }
            }
          }
        }
      } else {
        console.log('[Timesheet API] timeman.status не вернул данных')
      }
    } catch (error) {
      console.warn('[Timesheet API] Не удалось получить данные через timeman.status:', error)
    }
  }

  // Логируем итоговый результат
  if (timesheetEntries.length > 0) {
    console.log(`[Timesheet API] ✓ Всего получено ${timesheetEntries.length} записей о времени работы`)
    console.log(`[Timesheet API] Данные получены для ${new Set(timesheetEntries.map(e => e.EMPLOYEE_ID)).size} сотрудников`)
  } else {
    console.warn('[Timesheet API] ⚠ Не удалось получить данные о времени работы через доступные методы API')
    console.warn('[Timesheet API] Возможные причины:')
    console.warn('[Timesheet API] 1. Метод tasks.elapseditem.getlist недоступен или не возвращает данных')
    console.warn('[Timesheet API] 2. Методы timeman.record.list и timeman.worktime.list недоступны на вашем портале')
    console.warn('[Timesheet API] 3. Недостаточно прав для получения данных о времени работы сотрудников')
    console.warn('[Timesheet API] 4. Учет рабочего времени не настроен на портале')
    console.warn('[Timesheet API] 5. В выбранном периоде нет записей о времени работы')
  }

  // Если получили данные через timeman, преобразуем их
  if (timesheetEntries.length > 0) {
    return TransformTimesheet.fromDTOArray(timesheetEntries)
  }

  // Если данных нет, возвращаем пустую структуру
  return {
    departmentId: filters.departmentId,
    departmentName: filters.departmentName || 'Все подразделения',
    month: filters.month || new Date().getMonth() + 1,
    year: filters.year || new Date().getFullYear(),
    employees: users.map((user) => ({
      employeeId: user.ID,
      employeeName: `${user.NAME || ''} ${user.LAST_NAME || ''}`.trim() || user.ID,
      employeeCode: `#${user.ID}`,
      entries: {},
      totalHours: 0,
      totalMinutes: 0,
    })),
    workingDays: 0,
    dailyTotals: {},
    grandTotal: { hours: 0, minutes: 0 },
  }
}

/**
 * Получить отчет о времени работы конкретного сотрудника
 * Использует метод timeman.timecontrol.reports.get из Bitrix24 API
 * Документация: https://apidocs.bitrix24.com/api-reference/timeman/timecontrol/timeman-timecontrol-reports-get.html
 *
 * @param userId - ID сотрудника
 * @param month - Номер месяца (1-12)
 * @param year - Год
 * @param workdayHours - Продолжительность рабочего дня в часах (по умолчанию 8)
 * @param idleMinutes - Максимальное время отсутствия на рабочем месте, не считающееся отсутствием (опционально)
 * @returns Отчет о времени работы сотрудника
 */
export const fetchEmployeeTimeReport = async (
  userId: number | string,
  month: number,
  year: number,
  workdayHours: number = 8,
  idleMinutes?: number
): Promise<TimemanTimecontrolReport> => {
  const params: Record<string, unknown> = {
    USER_ID: typeof userId === 'string' ? parseInt(userId, 10) : userId,
    MONTH: month,
    YEAR: year,
    WORKDAY_HOURS: workdayHours,
  }

  if (idleMinutes !== undefined) {
    params.IDLE_MINUTES = idleMinutes
  }

  return await requestWrapper<TimemanTimecontrolReport, TimemanTimecontrolReport>(
    'timeman.timecontrol.reports.get',
    params,
    (result) => result
  )
}

/**
 * Получить список пользователей в отделе для отчетов о времени
 * Использует метод timeman.timecontrol.reports.users.get из Bitrix24 API
 * Документация: https://apidocs.bitrix24.com/api-reference/timeman/timecontrol/timeman-timecontrol-reports-users-get.html
 *
 * @param departmentId - ID отдела (опционально, только для менеджеров и администраторов)
 * @returns Список пользователей с информацией о времени работы
 */
export const fetchTimeControlUsers = async (
  departmentId?: number | string
): Promise<TimemanTimecontrolUser[]> => {
  const params: Record<string, unknown> = {}

  if (departmentId !== undefined) {
    params.DEPARTMENT_ID = typeof departmentId === 'string' ? parseInt(departmentId, 10) : departmentId
  }

  return await requestWrapper<TimemanTimecontrolUser[] | { result?: TimemanTimecontrolUser[] }, TimemanTimecontrolUser[]>(
    'timeman.timecontrol.reports.users.get',
    params,
    (result) => {
      if (Array.isArray(result)) {
        return result
      } else if (result && typeof result === 'object' && 'result' in result && Array.isArray(result.result)) {
        return result.result
      }
      return []
    }
  )
}

/**
 * Получить список подразделений
 * Использует метод department.get из Bitrix24 API
 * Документация: https://apidocs.bitrix24.ru/api-reference/departments/department-get.html
 * Метод может вызывать любой пользователь согласно документации
 */
export const fetchDepartments = async (): Promise<Department[]> => {
  try {
    // Согласно документации, метод department.get поддерживает параметры:
    // - sort: поле для сортировки (ID, NAME, SORT, PARENT, UF_HEAD)
    // - order: направление сортировки (ASC, DESC)
    // - ID: фильтр по идентификатору подразделения
    const result = await requestWrapper<BitrixDepartmentRaw[], Department[]>(
      'department.get',
      {
        sort: 'SORT', // Сортировка по порядку сортировки
        order: 'ASC', // По возрастанию
      },
      (data) => {
        // Обрабатываем разные форматы ответа
        if (Array.isArray(data)) {
          return TransformTimesheet.departmentsFromDTO(data)
        } else if (typeof data === 'object' && data !== null) {
          // Если ответ - объект, преобразуем его в массив
          const departmentsArray = Object.values(data).filter(
            (item): item is BitrixDepartmentRaw =>
              typeof item === 'object' && item !== null && 'ID' in item && 'NAME' in item
          )
          return TransformTimesheet.departmentsFromDTO(departmentsArray)
        }
        return []
      }
    )

    // Добавляем опцию "По всей компании" в начало списка
    return [
      { id: '0', name: 'По всей компании' },
      ...result,
    ]
  } catch (error) {
    console.warn('Ошибка получения подразделений через department.get, используем fallback:', error)

    // Fallback: получаем подразделения из пользователей
    // Это работает, так как user.get не требует дополнительных прав
    try {
      interface UserWithDepartment {
        ID: string
        UF_DEPARTMENT?: string | string[]
        UF_DEPARTMENT_NAME?: string | string[]
      }

      const users = await requestWrapper<UserWithDepartment[], UserWithDepartment[]>(
        'user.get',
        {
          filter: { ACTIVE: true },
          select: ['ID', 'UF_DEPARTMENT', 'UF_DEPARTMENT_NAME'],
        },
        (result) => result
      )

      const departmentsMap = new Map<string, { id: string; name: string }>()

      users.forEach((user) => {
        const deptIds = Array.isArray(user.UF_DEPARTMENT)
          ? user.UF_DEPARTMENT
          : user.UF_DEPARTMENT
            ? [user.UF_DEPARTMENT]
            : []

        const deptNames = Array.isArray(user.UF_DEPARTMENT_NAME)
          ? user.UF_DEPARTMENT_NAME
          : user.UF_DEPARTMENT_NAME
            ? [user.UF_DEPARTMENT_NAME]
            : []

        deptIds.forEach((deptId: string, index: number) => {
          if (deptId && !departmentsMap.has(deptId)) {
            const deptName = deptNames[index] || deptId
            departmentsMap.set(deptId, {
              id: deptId,
              name: typeof deptName === 'string' ? deptName : deptId,
            })
          }
        })
      })

      const departments: Department[] = Array.from(departmentsMap.values())

      // Сортируем по названию для удобства
      departments.sort((a, b) => a.name.localeCompare(b.name))

      return [
        { id: '0', name: 'По всей компании' },
        ...departments,
      ]
    } catch (fallbackError) {
      console.error('Ошибка получения подразделений через fallback:', fallbackError)
      // Возвращаем хотя бы базовый список
      return [{ id: '0', name: 'По всей компании' }]
    }
  }
}

