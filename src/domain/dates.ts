import type { HHMM, ISODate, Weekday } from './types'

/** Data LOCAL — jamais usar toISOString().slice(0,10), que é UTC e vira o dia mais cedo no fuso BR. */
export function toISODate(d: Date): ISODate {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function parseISODate(date: ISODate): Date {
  const [y, m, d] = date.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function addDaysISO(date: ISODate, days: number): ISODate {
  const d = parseISODate(date)
  d.setDate(d.getDate() + days)
  return toISODate(d)
}

export function weekdayOf(date: ISODate): Weekday {
  return parseISODate(date).getDay() as Weekday
}

export function hhmmToMin(hhmm: HHMM): number {
  const [h, m] = hhmm.split(':').map(Number)
  return h * 60 + m
}

export function minutesOfDay(d: Date): number {
  return d.getHours() * 60 + d.getMinutes()
}

export function formatDayLong(date: ISODate): string {
  return parseISODate(date).toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
}

export function formatClock(d: Date): string {
  return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

/** "faltam 1h 05min" / "faltam 23 min" / "termina agora" */
export function formatRemaining(minutes: number): string {
  if (minutes <= 1) return 'termina agora'
  if (minutes < 60) return `faltam ${minutes} min`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m === 0 ? `faltam ${h}h` : `faltam ${h}h ${String(m).padStart(2, '0')}min`
}
