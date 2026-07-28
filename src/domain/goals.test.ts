import { describe, expect, it } from 'vitest'
import { eligibleQueuedGoals, goalStatus, isGoalCompleted } from './goals'
import { visibleBlocks } from './schedule'
import { makeBlock, makeGoal, makeState } from './test-helpers'

const done = { id: 'm1', title: 'etapa', done: true }
const pending = { id: 'm2', title: 'etapa', done: false }

describe('isGoalCompleted / goalStatus', () => {
  it('sem etapas nunca está concluído (fragmentar é obrigatório)', () => {
    expect(isGoalCompleted(makeGoal('g'))).toBe(false)
  })

  it('todas as etapas done => completed', () => {
    expect(goalStatus(makeGoal('g', { milestones: [done] }))).toBe('completed')
    expect(goalStatus(makeGoal('g', { milestones: [done, pending] }))).toBe('active')
  })

  it('precedência: archived > queued > completed', () => {
    expect(goalStatus(makeGoal('g', { archivedAt: '2026-01-02', afterGoalId: 'x', milestones: [done] }))).toBe('archived')
    expect(goalStatus(makeGoal('g', { afterGoalId: 'x', milestones: [done] }))).toBe('queued')
  })
})

describe('eligibleQueuedGoals (fila)', () => {
  it('bloqueador concluído libera; em andamento não', () => {
    const a = makeGoal('a', { milestones: [done] })
    const b = makeGoal('b', { afterGoalId: 'a' })
    expect(eligibleQueuedGoals(makeState({ goals: [a, b] })).map((g) => g.id)).toEqual(['b'])

    const aAtivo = makeGoal('a', { milestones: [pending] })
    expect(eligibleQueuedGoals(makeState({ goals: [aAtivo, b] }))).toEqual([])
  })

  it('bloqueador arquivado (desistiu) ou inexistente (dado quebrado) libera', () => {
    const arquivado = makeGoal('a', { archivedAt: '2026-01-05' })
    const b = makeGoal('b', { afterGoalId: 'a' })
    expect(eligibleQueuedGoals(makeState({ goals: [arquivado, b] })).map((g) => g.id)).toEqual(['b'])

    const orfao = makeGoal('c', { afterGoalId: 'nao-existe' })
    expect(eligibleQueuedGoals(makeState({ goals: [orfao] })).map((g) => g.id)).toEqual(['c'])
  })

  it('cadeia A→B→C: só o bloqueador direto conta', () => {
    const a = makeGoal('a', { milestones: [done] })
    const b = makeGoal('b', { afterGoalId: 'a', milestones: [pending] })
    const c = makeGoal('c', { afterGoalId: 'b' })
    // A concluído libera B; C continua preso (B na fila, não concluído)
    expect(eligibleQueuedGoals(makeState({ goals: [a, b, c] })).map((g) => g.id)).toEqual(['b'])
  })

  it('ordena por createdAt (um por vez, o mais antigo primeiro)', () => {
    const a = makeGoal('a', { milestones: [done] })
    const novo = makeGoal('novo', { afterGoalId: 'a', createdAt: '2026-03-01' })
    const velho = makeGoal('velho', { afterGoalId: 'a', createdAt: '2026-02-01' })
    expect(eligibleQueuedGoals(makeState({ goals: [a, novo, velho] })).map((g) => g.id)).toEqual([
      'velho',
      'novo',
    ])
  })
})

describe('visibleBlocks com fila', () => {
  it('blocos de objetivo na fila não aparecem na grade', () => {
    const state = makeState({
      goals: [makeGoal('fila', { afterGoalId: 'outro' }), makeGoal('ativo')],
      blocks: [
        makeBlock('b1', [1], '08:00', '09:00', { goalId: 'fila' }),
        makeBlock('b2', [1], '10:00', '11:00', { goalId: 'ativo' }),
        makeBlock('b3', [1], '12:00', '13:00'),
      ],
    })
    expect(visibleBlocks(state).map((b) => b.id)).toEqual(['b2', 'b3'])
  })
})
