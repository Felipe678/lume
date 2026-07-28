import { describe, expect, it } from 'vitest'
import { computeStreak, isDayLit, scheduledCountOn } from './streak'
import { makeBlock, makeGoal, makeState, withCheckIns } from './test-helpers'

// Calendário de referência: 2026-07-27 = segunda, 2026-07-28 = terça.
const WEEKDAYS_UTEIS = [1, 2, 3, 4, 5] as const

const gradeSemana = () => [makeBlock('b1', [...WEEKDAYS_UTEIS], '08:00', '09:00')]

describe('computeStreak', () => {
  it('primeira utilização: sem check-ins → 0', () => {
    expect(computeStreak(makeState({ blocks: gradeSemana() }), '2026-07-28')).toBe(0)
  })

  it('um check-in hoje → 1', () => {
    const state = makeState({
      blocks: gradeSemana(),
      checkIns: withCheckIns([['2026-07-28', 'b1']]),
    })
    expect(computeStreak(state, '2026-07-28')).toBe(1)
  })

  it('dias consecutivos somam', () => {
    const state = makeState({
      blocks: gradeSemana(),
      checkIns: withCheckIns([
        ['2026-07-27', 'b1'],
        ['2026-07-28', 'b1'],
      ]),
    })
    expect(computeStreak(state, '2026-07-28')).toBe(2)
  })

  it('hoje ainda vazio NÃO zera — a chama de ontem vale até a meia-noite', () => {
    const state = makeState({
      blocks: gradeSemana(),
      checkIns: withCheckIns([
        ['2026-07-24', 'b1'], // sexta
        ['2026-07-27', 'b1'], // segunda
      ]),
    })
    // hoje é terça, sem check-in; fim de semana é neutro (grade só tem dias úteis)
    expect(computeStreak(state, '2026-07-28')).toBe(2)
  })

  it('dia neutro (sem blocos agendados) é pulado, não quebra', () => {
    const state = makeState({
      blocks: gradeSemana(), // seg–sex ⇒ sáb/dom neutros
      checkIns: withCheckIns([
        ['2026-07-24', 'b1'], // sexta
        ['2026-07-27', 'b1'], // segunda
        ['2026-07-28', 'b1'], // terça
      ]),
    })
    expect(computeStreak(state, '2026-07-28')).toBe(3)
  })

  it('dia com agenda e sem check-in QUEBRA a sequência', () => {
    const state = makeState({
      blocks: gradeSemana(),
      checkIns: withCheckIns([
        ['2026-07-23', 'b1'], // quinta
        // sexta 24: agendada, sem check-in → quebra
        ['2026-07-27', 'b1'], // segunda
        ['2026-07-28', 'b1'], // terça
      ]),
    })
    expect(computeStreak(state, '2026-07-28')).toBe(2)
  })

  it('atravessa virada de mês', () => {
    const state = makeState({
      blocks: [makeBlock('b1', [0, 1, 2, 3, 4, 5, 6], '08:00', '09:00')],
      checkIns: withCheckIns([
        ['2026-07-31', 'b1'],
        ['2026-08-01', 'b1'],
      ]),
    })
    expect(computeStreak(state, '2026-08-01')).toBe(2)
  })

  it('grade vazia: todos os dias são neutros e o streak vem só dos dias acesos', () => {
    const state = makeState({
      checkIns: withCheckIns([
        ['2026-07-20', 'antigo'],
        ['2026-07-28', 'antigo'],
      ]),
    })
    // dias entre 20 e 28 são neutros (sem grade) → pulados
    expect(computeStreak(state, '2026-07-28')).toBe(2)
  })

  it('blocos de objetivo arquivado não contam como agenda', () => {
    const goal = makeGoal('g1', { archivedAt: '2026-07-01' })
    const state = makeState({
      goals: [goal],
      blocks: [makeBlock('b1', [1, 2, 3, 4, 5], '08:00', '09:00', { goalId: 'g1' })],
      checkIns: withCheckIns([
        ['2026-07-24', 'b1'],
        ['2026-07-28', 'b1'],
      ]),
    })
    // grade visível vazia → seg 27 é neutro, não quebra
    expect(computeStreak(state, '2026-07-28')).toBe(2)
  })
})

describe('isDayLit / scheduledCountOn', () => {
  it('detecta dia aceso', () => {
    const state = makeState({ checkIns: withCheckIns([['2026-07-28', 'b1']]) })
    expect(isDayLit(state, '2026-07-28')).toBe(true)
    expect(isDayLit(state, '2026-07-27')).toBe(false)
  })

  it('conta agenda do dia pela grade atual', () => {
    const state = makeState({ blocks: gradeSemana() })
    expect(scheduledCountOn(state, '2026-07-28')).toBe(1) // terça
    expect(scheduledCountOn(state, '2026-07-26')).toBe(0) // domingo
  })
})
