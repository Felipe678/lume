import type { AppState, ISODate } from './types'
import { addDaysISO, minutesOfDay, toISODate } from './dates'
import { getDayActivities, type DayActivity } from './schedule'
import { computeStreak } from './streak'

export interface DayCloseSummary {
  date: ISODate
  done: number
  missed: number
  total: number
  streak: number
  phraseSeed: string
  tomorrow: DayActivity[]
}

/** O fechamento fica disponível quando a última janela do dia já terminou. */
export function isDayCloseAvailable(activities: DayActivity[], now: Date): boolean {
  if (activities.length === 0) return false
  const lastEnd = Math.max(...activities.map((a) => a.endMin))
  return lastEnd <= minutesOfDay(now)
}

export function buildDayCloseSummary(state: AppState, date: ISODate, now: Date): DayCloseSummary {
  const activities = getDayActivities(state, date, now)
  const done = activities.filter((a) => a.status === 'done').length
  return {
    date,
    done,
    missed: activities.length - done,
    total: activities.length,
    streak: computeStreak(state, toISODate(now)),
    phraseSeed: `${date}:close`,
    tomorrow: getDayActivities(state, addDaysISO(date, 1), now),
  }
}
