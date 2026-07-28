import type { AppState, ISODate } from './types'
import { addDaysISO, weekdayOf } from './dates'
import { visibleBlocks } from './schedule'

const MAX_LOOKBACK_DAYS = 4000

/** Dia "aceso" = pelo menos um check-in naquele dia. */
export function isDayLit(state: Pick<AppState, 'checkIns'>, date: ISODate): boolean {
  return Object.values(state.checkIns).some((c) => c.date === date)
}

/** Quantos blocos a grade ATUAL agenda para essa data (aproximação consciente — ver KB). */
export function scheduledCountOn(state: Pick<AppState, 'goals' | 'blocks'>, date: ISODate): number {
  const weekday = weekdayOf(date)
  return visibleBlocks(state).filter((b) => b.weekdays.includes(weekday)).length
}

/**
 * Streak = dias acesos consecutivos terminando em hoje OU ontem (hoje vazio ainda não zera).
 * Dia neutro (0 blocos agendados) não quebra nem incrementa — apenas é pulado.
 * Dia com agenda e sem check-in quebra a sequência.
 */
export function computeStreak(state: AppState, today: ISODate): number {
  const lit = new Set(Object.values(state.checkIns).map((c) => c.date))
  if (lit.size === 0) return 0

  let streak = 0
  let day = lit.has(today) ? today : addDaysISO(today, -1)

  for (let i = 0; i < MAX_LOOKBACK_DAYS; i++) {
    if (lit.has(day)) streak++
    else if (scheduledCountOn(state, day) > 0) break
    day = addDaysISO(day, -1)
  }
  return streak
}
