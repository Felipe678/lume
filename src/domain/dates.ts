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

/** Segunda-feira da semana da data (semana começa na segunda, como a grade). */
export function startOfWeekISO(date: ISODate): ISODate {
  const d = parseISODate(date)
  const dow = d.getDay() // 0 = domingo
  const delta = dow === 0 ? -6 : 1 - dow
  d.setDate(d.getDate() + delta)
  return toISODate(d)
}

export function startOfMonthISO(date: ISODate): ISODate {
  return `${date.slice(0, 7)}-01`
}

/** Todos os dias de um mês "AAAA-MM". */
export function daysOfMonth(month: string): ISODate[] {
  const [y, m] = month.split('-').map(Number)
  const count = new Date(y, m, 0).getDate()
  return Array.from({ length: count }, (_, i) => `${month}-${String(i + 1).padStart(2, '0')}`)
}

/** "12h30" / "45min" / "0min" */
export function formatHours(minutes: number): string {
  if (minutes < 60) return `${Math.round(minutes)}min`
  const h = Math.floor(minutes / 60)
  const m = Math.round(minutes % 60)
  return m === 0 ? `${h}h` : `${h}h${String(m).padStart(2, '0')}`
}

/** Contagem regressiva "MM:SS" ou "H:MM:SS" para o modo Foco. */
export function formatCountdown(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds))
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  const p = (n: number) => String(n).padStart(2, '0')
  return h > 0 ? `${h}:${p(m)}:${p(sec)}` : `${p(m)}:${p(sec)}`
}

/** "faltam 1h 05min" / "faltam 23 min" / "termina agora" */
export function formatRemaining(minutes: number): string {
  if (minutes <= 1) return 'termina agora'
  if (minutes < 60) return `faltam ${minutes} min`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m === 0 ? `faltam ${h}h` : `faltam ${h}h ${String(m).padStart(2, '0')}min`
}
