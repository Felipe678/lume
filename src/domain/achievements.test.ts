import { describe, expect, it } from 'vitest'
import {
  BADGES,
  hasAnyPerfectWeek,
  isPerfectWeek,
  isRewardTriggerMet,
  newlyUnlockedRewards,
  unlockedBadges,
} from './achievements'
import { makeBlock, makeGoal, makeState, withCheckIns } from './test-helpers'
import type { Reward } from './types'

const at = (h = 12) => new Date(2026, 6, 28, h) // terça 2026-07-28

const mkReward = (overrides: Partial<Reward>): Reward => ({
  id: 'r1',
  title: 'Prêmio',
  emoji: '🎁',
  category: 'Lazer',
  trigger: { kind: 'perfectWeek' },
  createdAt: '2026-01-01',
  ...overrides,
})

describe('badges', () => {
  it('estado vazio: nenhuma medalha', () => {
    expect(unlockedBadges(makeState(), at())).toEqual([])
  })

  it('primeiro check-in acende a Primeira Chama', () => {
    const state = makeState({
      blocks: [makeBlock('b1', [2], '08:00', '09:00')],
      checkIns: withCheckIns([['2026-07-28', 'b1']]),
    })
    const ids = unlockedBadges(state, at()).map((b) => b.id)
    expect(ids).toContain('primeira-chama')
    expect(ids).not.toContain('streak-7')
  })

  it('ids das medalhas são únicos', () => {
    expect(new Set(BADGES.map((b) => b.id)).size).toBe(BADGES.length)
  })
})

describe('semana perfeita', () => {
  const grade = [makeBlock('b1', [1, 3], '08:00', '09:00')] // seg e qua

  it('100% dos agendados da semana', () => {
    const state = makeState({
      blocks: grade,
      checkIns: withCheckIns([
        ['2026-07-20', 'b1'], // seg
        ['2026-07-22', 'b1'], // qua
      ]),
    })
    expect(isPerfectWeek(state, '2026-07-20')).toBe(true)
    expect(hasAnyPerfectWeek(state, at())).toBe(true)
  })

  it('semana com falta não é perfeita; semana atual (incompleta) não conta', () => {
    const faltou = makeState({
      blocks: grade,
      checkIns: withCheckIns([['2026-07-20', 'b1']]),
    })
    expect(isPerfectWeek(faltou, '2026-07-20')).toBe(false)

    const soAtual = makeState({
      blocks: grade,
      checkIns: withCheckIns([['2026-07-27', 'b1']]), // seg desta semana
    })
    expect(hasAnyPerfectWeek(soAtual, at())).toBe(false)
  })
})

describe('gatilhos de premiação', () => {
  it('goal: destrava só com o objetivo concluído; objetivo removido nunca destrava', () => {
    const done = { id: 'm', title: 'x', done: true }
    const state = makeState({ goals: [makeGoal('g1', { milestones: [done] })] })
    expect(isRewardTriggerMet(state, mkReward({ trigger: { kind: 'goal', goalId: 'g1' } }), at())).toBe(true)
    expect(isRewardTriggerMet(state, mkReward({ trigger: { kind: 'goal', goalId: 'sumiu' } }), at())).toBe(false)
  })

  it('streak e hours', () => {
    const state = makeState({
      blocks: [makeBlock('b1', [0, 1, 2, 3, 4, 5, 6], '08:00', '10:00')],
      checkIns: withCheckIns([
        ['2026-07-26', 'b1'],
        ['2026-07-27', 'b1'],
        ['2026-07-28', 'b1'],
      ]),
    })
    expect(isRewardTriggerMet(state, mkReward({ trigger: { kind: 'streak', days: 3 } }), at())).toBe(true)
    expect(isRewardTriggerMet(state, mkReward({ trigger: { kind: 'streak', days: 4 } }), at())).toBe(false)
    // 3 check-ins × 2h = 6h
    expect(isRewardTriggerMet(state, mkReward({ trigger: { kind: 'hours', hours: 6 } }), at())).toBe(true)
    expect(isRewardTriggerMet(state, mkReward({ trigger: { kind: 'hours', hours: 7 } }), at())).toBe(false)
  })

  it('newlyUnlockedRewards ignora as já destravadas', () => {
    const done = { id: 'm', title: 'x', done: true }
    const state = makeState({
      goals: [makeGoal('g1', { milestones: [done] })],
      rewards: [
        mkReward({ id: 'nova', trigger: { kind: 'goal', goalId: 'g1' } }),
        mkReward({ id: 'antiga', trigger: { kind: 'goal', goalId: 'g1' }, unlockedAt: '2026-07-01' }),
      ],
    })
    expect(newlyUnlockedRewards(state, at()).map((r) => r.id)).toEqual(['nova'])
  })
})
