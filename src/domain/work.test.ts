import { describe, expect, it } from 'vitest'
import {
  blockConflictsWork,
  isShiftDay,
  isWorkDay,
  suggestedStartAvoidingWork,
  workSegmentsOn,
  type WorkSchedule,
} from './work'

// Calendário: 2026-07-27 seg · 28 ter · 29 qua · 30 qui · 31 sex · 08-01 sáb · 08-02 dom

const weeklyDay: WorkSchedule = { mode: 'weekly', weekdays: [1, 2, 3, 4, 5], start: '08:00', end: '18:00' }
const nightShift: WorkSchedule = { mode: 'weekly', weekdays: [1], start: '19:00', end: '07:00' } // seg 19h → ter 7h
const escala12x36: WorkSchedule = {
  mode: 'rotation',
  daysOn: 1,
  daysOff: 1,
  anchorDate: '2026-07-29',
  start: '07:00',
  end: '19:00',
}

describe('isShiftDay / workSegmentsOn', () => {
  it('weekly: dias úteis com segmento único', () => {
    expect(isShiftDay(weeklyDay, '2026-07-29')).toBe(true)
    expect(isShiftDay(weeklyDay, '2026-08-02')).toBe(false) // domingo
    expect(workSegmentsOn(weeklyDay, '2026-07-29')).toEqual([{ startMin: 480, endMin: 1080 }])
    expect(workSegmentsOn(weeklyDay, '2026-08-02')).toEqual([])
  })

  it('noturno (end <= start): derrama no dia seguinte', () => {
    // segunda: turno começa 19h
    expect(workSegmentsOn(nightShift, '2026-07-27')).toEqual([{ startMin: 19 * 60, endMin: 1440 }])
    // terça: derrame [0, 7h) do turno de segunda
    expect(workSegmentsOn(nightShift, '2026-07-28')).toEqual([{ startMin: 0, endMin: 7 * 60 }])
    expect(isWorkDay(nightShift, '2026-07-28')).toBe(true)
    // quarta: nada
    expect(workSegmentsOn(nightShift, '2026-07-29')).toEqual([])
  })

  it('rotação 12x36 (1 trabalha / 1 folga) com âncora', () => {
    expect(isShiftDay(escala12x36, '2026-07-29')).toBe(true)
    expect(isShiftDay(escala12x36, '2026-07-30')).toBe(false)
    expect(isShiftDay(escala12x36, '2026-07-31')).toBe(true)
  })

  it('âncora no futuro funciona (módulo normalizado)', () => {
    const futura: WorkSchedule = { ...escala12x36, anchorDate: '2026-08-02' }
    // 08-02 ON, 08-01 OFF, 07-31 ON, 07-30 OFF, 07-29 ON
    expect(isShiftDay(futura, '2026-07-29')).toBe(true)
    expect(isShiftDay(futura, '2026-07-30')).toBe(false)
  })

  it('ciclo inválido (daysOn 0) nunca é dia de turno', () => {
    const broken: WorkSchedule = { ...escala12x36, daysOn: 0, daysOff: 0 }
    expect(isShiftDay(broken, '2026-07-29')).toBe(false)
  })
})

describe('blockConflictsWork', () => {
  it('weekly: bloco dentro do expediente conflita, fora não', () => {
    const conflict = blockConflictsWork(weeklyDay, [1, 3], 17 * 60, 19 * 60, '2026-07-29')
    expect(conflict).not.toBeNull()
    expect(conflict!.weekdays!.sort()).toEqual([1, 3])

    expect(blockConflictsWork(weeklyDay, [1, 3], 19 * 60, 20 * 60, '2026-07-29')).toBeNull()
    expect(blockConflictsWork(weeklyDay, [0, 6], 9 * 60, 10 * 60, '2026-07-29')).toBeNull() // fim de semana livre
  })

  it('noturno: derrame conflita com bloco da manhã do dia seguinte', () => {
    // bloco terça 06:00-06:30 — segunda à noite vira terça de manhã
    const conflict = blockConflictsWork(nightShift, [2], 6 * 60, 6 * 60 + 30, '2026-07-27')
    expect(conflict).not.toBeNull()
  })

  it('rotação: reporta fração das ocorrências em conflito (~50% no 12x36)', () => {
    const conflict = blockConflictsWork(escala12x36, [1, 2, 3, 4, 5, 6, 0], 10 * 60, 11 * 60, '2026-07-29')
    expect(conflict).not.toBeNull()
    expect(conflict!.ratio!).toBeGreaterThan(0.3)
    expect(conflict!.ratio!).toBeLessThan(0.7)
  })

  it('sem trabalho ou sem dias → null', () => {
    expect(blockConflictsWork({ mode: 'none' }, [1], 0, 60, '2026-07-29')).toBeNull()
    expect(blockConflictsWork(weeklyDay, [], 0, 60, '2026-07-29')).toBeNull()
  })
})

describe('suggestedStartAvoidingWork', () => {
  it('sem conflito mantém o preferido (19:00)', () => {
    expect(suggestedStartAvoidingWork(weeklyDay, [1, 2, 3], 60, '2026-07-29')).toBe('19:00')
  })

  it('trabalho até tarde empurra para depois do expediente + 1h', () => {
    const tarde: WorkSchedule = { mode: 'weekly', weekdays: [1, 2, 3, 4, 5], start: '12:00', end: '21:00' }
    expect(suggestedStartAvoidingWork(tarde, [1, 2, 3], 60, '2026-07-29')).toBe('22:00')
  })

  it('turno noturno sugere a manhã', () => {
    const nightDaily: WorkSchedule = { mode: 'weekly', weekdays: [0, 1, 2, 3, 4, 5, 6], start: '19:00', end: '07:00' }
    expect(suggestedStartAvoidingWork(nightDaily, [1, 2, 3], 60, '2026-07-29')).toBe('09:00')
  })
})
