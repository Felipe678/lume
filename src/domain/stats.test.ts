import { describe, expect, it } from 'vitest'
import {
  computeGoalStats,
  investedMinutes,
  longestStreak,
  monthHeatmap,
  overallProgress,
  periodProgress,
  weeklyPaceMinutes,
} from './stats'
import { makeBlock, makeGoal, makeState, withCheckIns } from './test-helpers'

// Calendário: 2026-07-27 = segunda; 2026-07-29 = quarta.
const at = (h: number, m = 0) => new Date(2026, 6, 29, h, m)

const goal = makeGoal('g1', { createdAt: '2026-07-01', estimatedHours: 10 })
const gradeDiaria = [makeBlock('b1', [0, 1, 2, 3, 4, 5, 6], '08:00', '09:00', { goalId: 'g1' })]

describe('periodProgress', () => {
  it('conta agendados e concluídos no período', () => {
    const state = makeState({
      goals: [goal],
      blocks: gradeDiaria,
      checkIns: withCheckIns([
        ['2026-07-27', 'b1'],
        ['2026-07-28', 'b1'],
      ]),
    })
    expect(periodProgress(state, '2026-07-27', '2026-07-29', 'g1')).toEqual({ done: 2, total: 3 })
  })
})

describe('investedMinutes', () => {
  it('soma durações dos blocos com check-in; órfãos ficam fora', () => {
    const state = makeState({
      goals: [goal],
      blocks: gradeDiaria,
      checkIns: withCheckIns([
        ['2026-07-27', 'b1'],
        ['2026-07-28', 'b1'],
        ['2026-07-20', 'bloco-excluido'],
      ]),
    })
    expect(investedMinutes(state, 'g1')).toBe(120)
    expect(investedMinutes(state)).toBe(120)
  })
})

describe('weeklyPaceMinutes', () => {
  it('duração × dias da semana', () => {
    const state = makeState({ goals: [goal], blocks: gradeDiaria })
    expect(weeklyPaceMinutes(state, 'g1')).toBe(7 * 60)
  })
})

describe('computeGoalStats', () => {
  it('semana parcial: denominador = dias decorridos (seg→qua = 3)', () => {
    const state = makeState({
      goals: [goal],
      blocks: gradeDiaria,
      checkIns: withCheckIns([['2026-07-28', 'b1']]),
    })
    const stats = computeGoalStats(state, 'g1', at(12))
    expect(stats.weekly).toEqual({ done: 1, total: 3 })
    expect(stats.daily).toEqual({ done: 0, total: 1 })
    expect(stats.monthly.total).toBe(29)
  })

  it('clampa períodos em createdAt (objetivo criado no meio da semana)', () => {
    const novato = makeGoal('g1', { createdAt: '2026-07-29' })
    const state = makeState({ goals: [novato], blocks: gradeDiaria })
    const stats = computeGoalStats(state, 'g1', at(12))
    expect(stats.weekly.total).toBe(1)
    expect(stats.monthly.total).toBe(1)
  })

  it('projeção = ceil(restante / ritmo); casos degenerados viram null', () => {
    const state = makeState({
      goals: [goal], // 10h estimadas
      blocks: gradeDiaria, // 7h/semana
      checkIns: withCheckIns([['2026-07-28', 'b1']]), // 1h investida
    })
    const stats = computeGoalStats(state, 'g1', at(12))
    expect(stats.investedMin).toBe(60)
    expect(stats.remainingMin).toBe(9 * 60)
    expect(stats.projectedWeeks).toBe(2)

    const semEstimativa = makeState({ goals: [makeGoal('g1')], blocks: gradeDiaria })
    expect(computeGoalStats(semEstimativa, 'g1', at(12)).projectedWeeks).toBeNull()

    const semGrade = makeState({ goals: [goal] })
    expect(computeGoalStats(semGrade, 'g1', at(12)).paceMinPerWeek).toBe(0)
    expect(computeGoalStats(semGrade, 'g1', at(12)).projectedWeeks).toBeNull()
  })

  it('investido acima da estimativa clampa restante em 0', () => {
    const curto = makeGoal('g1', { estimatedHours: 1 })
    const state = makeState({
      goals: [curto],
      blocks: gradeDiaria,
      checkIns: withCheckIns([
        ['2026-07-27', 'b1'],
        ['2026-07-28', 'b1'],
      ]),
    })
    expect(computeGoalStats(state, 'g1', at(12)).remainingMin).toBe(0)
  })
})

describe('overallProgress', () => {
  it('média dos objetivos com etapas; fila/arquivados fora; null sem dados', () => {
    const done = { id: 'm', title: 'x', done: true }
    const pending = { id: 'm2', title: 'y', done: false }
    const state = makeState({
      goals: [
        makeGoal('a', { milestones: [done, pending] }), // 50%
        makeGoal('b', { milestones: [done] }), // 100% (completed conta)
        makeGoal('fila', { afterGoalId: 'a', milestones: [done] }),
        makeGoal('semEtapas'),
      ],
    })
    expect(overallProgress(state)).toBeCloseTo(0.75)
    expect(overallProgress(makeState())).toBeNull()
  })
})

describe('monthHeatmap', () => {
  it('um DayHeat por dia do mês, pela grade atual', () => {
    const state = makeState({
      goals: [goal],
      blocks: gradeDiaria,
      checkIns: withCheckIns([['2026-07-28', 'b1']]),
    })
    const heat = monthHeatmap(state, '2026-07')
    expect(heat).toHaveLength(31)
    expect(heat[27]).toEqual({ date: '2026-07-28', done: 1, total: 1 })
    expect(heat[0]).toEqual({ date: '2026-07-01', done: 0, total: 1 })
  })
})

describe('longestStreak', () => {
  it('maior sequência histórica, pulando dias neutros', () => {
    const uteis = [makeBlock('b1', [1, 2, 3, 4, 5], '08:00', '09:00')]
    const state = makeState({
      blocks: uteis,
      checkIns: withCheckIns([
        // sequência antiga de 3 (qua 8, qui 9, sex 10) — fds neutro — seg 13 quebra (sem check-in)
        ['2026-07-08', 'b1'],
        ['2026-07-09', 'b1'],
        ['2026-07-10', 'b1'],
        // atual de 2
        ['2026-07-27', 'b1'],
        ['2026-07-28', 'b1'],
      ]),
    })
    expect(longestStreak(state)).toBe(3)
    expect(longestStreak(makeState())).toBe(0)
  })
})
