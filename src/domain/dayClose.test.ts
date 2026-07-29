import { describe, expect, it } from 'vitest'
import { buildDayCloseSummary, isDayCloseAvailable } from './dayClose'
import { getDayActivities } from './schedule'
import { makeBlock, makeState, withCheckIns } from './test-helpers'

// 2026-07-29 quarta
const DATE = '2026-07-29'
const at = (h: number, m = 0) => new Date(2026, 6, 29, h, m)

const grade = [
  makeBlock('a', [3], '08:00', '09:00'),
  makeBlock('b', [3], '19:00', '20:00'),
  makeBlock('amanha', [4], '10:00', '11:00'),
]

describe('isDayCloseAvailable', () => {
  it('só depois da última janela do dia (edge 43)', () => {
    const state = makeState({ blocks: grade })
    expect(isDayCloseAvailable(getDayActivities(state, DATE, at(19, 30)), at(19, 30))).toBe(false)
    expect(isDayCloseAvailable(getDayActivities(state, DATE, at(20)), at(20))).toBe(true)
  })

  it('dia sem atividades nunca fecha', () => {
    expect(isDayCloseAvailable([], at(23))).toBe(false)
  })
})

describe('buildDayCloseSummary', () => {
  it('resume feitas/perdidas, chama e preview de amanhã', () => {
    const state = makeState({
      blocks: grade,
      checkIns: withCheckIns([[DATE, 'a']]),
    })
    const s = buildDayCloseSummary(state, DATE, at(21))
    expect(s.done).toBe(1)
    expect(s.missed).toBe(1)
    expect(s.total).toBe(2)
    expect(s.streak).toBe(1)
    expect(s.tomorrow.map((a) => a.block.id)).toEqual(['amanha'])
  })
})
