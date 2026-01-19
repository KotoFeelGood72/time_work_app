import type { TimeEntry } from '@/entities/timesheet-entities'

/**
 * Форматирует TimeEntry в строку формата HH:MM
 * @param entry - объект с часами и минутами
 * @returns строка в формате "HH:MM"
 */
export const formatTime = (entry: TimeEntry): string => {
  const hours = entry.hours.toString().padStart(2, '0')
  const minutes = entry.minutes.toString().padStart(2, '0')
  return `${hours}:${minutes}`
}

/**
 * Форматирует общее время из часов и минут в строку формата H:MM
 * Нормализует время (60 минут = 1 час)
 * @param hours - количество часов
 * @param minutes - количество минут
 * @returns строка в формате "H:MM" (часы без ведущего нуля)
 */
export const formatTotalTime = (hours: number, minutes: number): string => {
  const totalMinutes = hours * 60 + minutes
  const h = Math.floor(totalMinutes / 60)
  const m = totalMinutes % 60
  return `${h}:${m.toString().padStart(2, '0')}`
}
