import { describe, expect, it } from 'vitest'
import { addDaysISO, formatRemaining, hhmmToMin, toISODate, weekdayOf } from './dates'

describe('toISODate', () => {
  it('usa a data LOCAL, mesmo à noite (nunca UTC)', () => {
    // 23:50 local — em UTC-3 o toISOString já teria virado o dia
    expect(toISODate(new Date(2026, 6, 28, 23, 50))).toBe('2026-07-28')
    expect(toISODate(new Date(2026, 0, 1, 0, 0))).toBe('2026-01-01')
  })
})

describe('addDaysISO', () => {
  it('cruza viradas de mês e ano', () => {
    expect(addDaysISO('2026-07-31', 1)).toBe('2026-08-01')
    expect(addDaysISO('2026-08-01', -1)).toBe('2026-07-31')
    expect(addDaysISO('2026-01-01', -1)).toBe('2025-12-31')
  })
})

describe('weekdayOf', () => {
  it('bate com o calendário real', () => {
    expect(weekdayOf('2026-07-28')).toBe(2) // terça
    expect(weekdayOf('2026-07-26')).toBe(0) // domingo
  })
})

describe('hhmmToMin', () => {
  it('converte horários', () => {
    expect(hhmmToMin('00:00')).toBe(0)
    expect(hhmmToMin('08:30')).toBe(510)
    expect(hhmmToMin('23:59')).toBe(1439)
  })
})

describe('formatRemaining', () => {
  it('formata tempo restante legível', () => {
    expect(formatRemaining(0)).toBe('termina agora')
    expect(formatRemaining(1)).toBe('termina agora')
    expect(formatRemaining(23)).toBe('faltam 23 min')
    expect(formatRemaining(60)).toBe('faltam 1h')
    expect(formatRemaining(65)).toBe('faltam 1h 05min')
  })
})
