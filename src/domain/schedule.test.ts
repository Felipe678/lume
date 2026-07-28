import { describe, expect, it } from 'vitest'
import { getCurrentAndNext, getDayActivities } from './schedule'
import { makeBlock, makeGoal, makeState, withCheckIns } from './test-helpers'

// 2026-07-28 é terça (weekday 2)
const DATE = '2026-07-28'
const at = (h: number, m = 0) => new Date(2026, 6, 28, h, m)

describe('getDayActivities', () => {
  it('ordena por horário de início', () => {
    const state = makeState({
      blocks: [
        makeBlock('tarde', [2], '14:00', '15:00'),
        makeBlock('manha', [2], '08:00', '09:00'),
      ],
    })
    const acts = getDayActivities(state, DATE, at(7))
    expect(acts.map((a) => a.block.id)).toEqual(['manha', 'tarde'])
  })

  it('status por horário: done > current > upcoming > missed', () => {
    const state = makeState({
      blocks: [
        makeBlock('cedo', [2], '06:00', '07:00'),
        makeBlock('agora', [2], '08:00', '09:00'),
        makeBlock('depois', [2], '10:00', '11:00'),
        makeBlock('feito', [2], '05:00', '05:30'),
      ],
      checkIns: withCheckIns([[DATE, 'feito']]),
    })
    const acts = getDayActivities(state, DATE, at(8, 30))
    const byId = Object.fromEntries(acts.map((a) => [a.block.id, a.status]))
    expect(byId).toEqual({ feito: 'done', cedo: 'missed', agora: 'current', depois: 'upcoming' })
  })

  it('intervalo semiaberto: às 09:00 em ponto o bloco 08–09 acabou e o 09–10 é o atual', () => {
    const state = makeState({
      blocks: [makeBlock('a', [2], '08:00', '09:00'), makeBlock('b', [2], '09:00', '10:00')],
    })
    const acts = getDayActivities(state, DATE, at(9, 0))
    const byId = Object.fromEntries(acts.map((a) => [a.block.id, a.status]))
    expect(byId.a).toBe('missed')
    expect(byId.b).toBe('current')
  })

  it('não inclui blocos de outros dias da semana', () => {
    const state = makeState({ blocks: [makeBlock('segunda', [1], '08:00', '09:00')] })
    expect(getDayActivities(state, DATE, at(8))).toHaveLength(0)
  })

  it('exclui blocos de objetivos arquivados', () => {
    const state = makeState({
      goals: [makeGoal('g1', { archivedAt: '2026-07-01' }), makeGoal('g2')],
      blocks: [
        makeBlock('arquivado', [2], '08:00', '09:00', { goalId: 'g1' }),
        makeBlock('vivo', [2], '10:00', '11:00', { goalId: 'g2' }),
      ],
    })
    const acts = getDayActivities(state, DATE, at(8))
    expect(acts.map((a) => a.block.id)).toEqual(['vivo'])
    expect(acts[0].goal?.id).toBe('g2')
  })

  it('dia no passado sem check-in fica missed; no futuro fica upcoming', () => {
    const state = makeState({ blocks: [makeBlock('b', [1], '08:00', '09:00')] })
    // 2026-07-27 (segunda) visto de terça:
    expect(getDayActivities(state, '2026-07-27', at(8))[0].status).toBe('missed')
    // 2026-08-03 (segunda seguinte):
    expect(getDayActivities(state, '2026-08-03', at(8))[0].status).toBe('upcoming')
  })
})

describe('getCurrentAndNext', () => {
  it('sobreposição: início mais recente vence; empate → menor id', () => {
    const state = makeState({
      blocks: [
        makeBlock('longo', [2], '08:00', '12:00'),
        makeBlock('curto', [2], '09:00', '09:30'),
        makeBlock('aa-empate', [2], '09:00', '10:00'),
      ],
    })
    const now = at(9, 15)
    const acts = getDayActivities(state, DATE, now)
    const { current } = getCurrentAndNext(acts, now)
    expect(current?.block.id).toBe('aa-empate')
  })

  it('current existe mesmo já concluído (Painel mostra estado done)', () => {
    const state = makeState({
      blocks: [makeBlock('agora', [2], '08:00', '09:00')],
      checkIns: withCheckIns([[DATE, 'agora']]),
    })
    const now = at(8, 30)
    const { current } = getCurrentAndNext(getDayActivities(state, DATE, now), now)
    expect(current?.block.id).toBe('agora')
    expect(current?.status).toBe('done')
  })

  it('check-in antecipado tira o bloco da fila de "próxima"', () => {
    const state = makeState({
      blocks: [makeBlock('prox', [2], '10:00', '11:00'), makeBlock('dep', [2], '14:00', '15:00')],
      checkIns: withCheckIns([[DATE, 'prox']]),
    })
    const now = at(8)
    const { next } = getCurrentAndNext(getDayActivities(state, DATE, now), now)
    expect(next?.block.id).toBe('dep')
  })

  it('sem janela ativa: current indefinido, next é a primeira por vir', () => {
    const state = makeState({
      blocks: [makeBlock('b', [2], '10:00', '11:00')],
    })
    const now = at(9)
    const { current, next } = getCurrentAndNext(getDayActivities(state, DATE, now), now)
    expect(current).toBeUndefined()
    expect(next?.block.id).toBe('b')
  })
})
