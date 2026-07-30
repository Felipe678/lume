import { describe, expect, it } from 'vitest'
import { isManualActive, manualExpired, resolveFocus, type ManualFocus } from './focusSession'
import { getDayActivities } from './schedule'
import { makeBlock, makeState, withCheckIns } from './test-helpers'

// 2026-07-29 é quarta (weekday 3)
const DATE = '2026-07-29'
const at = (h: number, m = 0) => new Date(2026, 6, 29, h, m)

const grade = [
  makeBlock('manha', [3], '08:00', '09:00'),
  makeBlock('tarde', [3], '14:00', '15:00'),
  makeBlock('noite', [3], '19:00', '20:00'),
]

const mkManual = (blockId: string, startedAt: Date, durationMin = 60): ManualFocus => ({
  date: DATE,
  blockId,
  startedAtMs: startedAt.getTime(),
  durationMin,
})

describe('isManualActive / manualExpired', () => {
  it('ativa dentro da janela, expira no fim', () => {
    const mf = mkManual('tarde', at(10), 60)
    expect(isManualActive(mf, at(10, 30))).toBe(true)
    expect(isManualActive(mf, at(11))).toBe(false)
    expect(manualExpired(mf, at(11), DATE)).toBe(true)
    expect(manualExpired(mf, at(10, 30), DATE)).toBe(false)
  })

  it('sessão futura (time travel para trás) não é ativa', () => {
    const mf = mkManual('tarde', at(10), 60)
    expect(isManualActive(mf, at(9))).toBe(false)
    expect(manualExpired(mf, at(9), DATE)).toBe(false)
  })

  it('expiração só conta no mesmo dia da sessão', () => {
    const mf = mkManual('tarde', at(10), 60)
    expect(manualExpired(mf, at(12), '2026-07-30')).toBe(false)
  })
})

describe('resolveFocus', () => {
  it('sem sessão manual delega ao relógio', () => {
    const state = makeState({ blocks: grade })
    const now = at(8, 30)
    const r = resolveFocus(getDayActivities(state, DATE, now), now, null)
    expect(r.source).toBe('schedule')
    expect(r.current?.block.id).toBe('manha')
    expect(r.next?.block.id).toBe('tarde')
  })

  it('manual ativa VENCE o bloco do relógio (edge 7)', () => {
    const state = makeState({ blocks: grade })
    const now = at(8, 30)
    const mf = mkManual('tarde', at(8, 15), 60) // iniciou "tarde" antecipada durante "manha"
    const r = resolveFocus(getDayActivities(state, DATE, now), now, mf)
    expect(r.source).toBe('manual')
    expect(r.current?.block.id).toBe('tarde')
    expect(r.manualEndsAtMs).toBe(at(9, 15).getTime())
    // next pula o próprio bloco manual
    expect(r.next?.block.id).not.toBe('tarde')
  })

  it('bloco da sessão excluído/inexistente → descarta e volta ao relógio (edge 10)', () => {
    const state = makeState({ blocks: grade })
    const now = at(8, 30)
    const mf = mkManual('bloco-excluido', at(8), 60)
    const r = resolveFocus(getDayActivities(state, DATE, now), now, mf)
    expect(r.source).toBe('schedule')
    expect(r.current?.block.id).toBe('manha')
  })

  it('sessão de bloco já concluído → ignorada (edge 6/13)', () => {
    const state = makeState({ blocks: grade, checkIns: withCheckIns([[DATE, 'tarde']]) })
    const now = at(10)
    const mf = mkManual('tarde', at(9, 30), 60)
    const r = resolveFocus(getDayActivities(state, DATE, now), now, mf)
    expect(r.source).toBe(null)
    expect(r.current).toBeUndefined()
  })

  it('virada de dia: activities do novo dia não têm o bloco → sessão descartada (edge 8)', () => {
    const state = makeState({ blocks: grade }) // blocos só na quarta
    const thursday = new Date(2026, 6, 30, 0, 30)
    const mf = mkManual('noite', at(23, 50), 60) // ainda "ativa" pelo horário
    const r = resolveFocus(getDayActivities(state, '2026-07-30', thursday), thursday, mf)
    expect(r.source).toBe(null)
  })
})
