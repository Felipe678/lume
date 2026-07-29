import { describe, expect, it } from 'vitest'
import { migrateV1toV2, type AppStateV1 } from './migrate'

const v1: AppStateV1 = {
  schemaVersion: 1,
  goals: [
    {
      id: 'g1',
      title: 'Inglês',
      emoji: '📚',
      color: 'sky',
      milestones: [{ id: 'm1', title: 'Unidade 1', done: true, doneAt: '2026-07-20' }],
      createdAt: '2026-07-01',
    },
  ],
  blocks: [
    { id: 'b1', goalId: 'g1', title: 'Aula', weekdays: [1, 3], start: '08:00', end: '09:00', createdAt: '2026-07-01' },
  ],
  checkIns: {
    '2026-07-28:b1': { date: '2026-07-28', blockId: 'b1', completedAt: '2026-07-28T11:00:00.000Z' },
  },
}

describe('migrateV1toV2', () => {
  it('adiciona prioridade média, rewards vazias e perfil default sem tocar no resto', () => {
    const v2 = migrateV1toV2(v1)
    expect(v2.schemaVersion).toBe(2)
    expect(v2.goals[0].priority).toBe('media')
    expect(v2.goals[0].milestones).toEqual(v1.goals[0].milestones)
    expect(v2.blocks).toEqual(v1.blocks)
    expect(v2.checkIns).toEqual(v1.checkIns)
    expect(v2.rewards).toEqual([])
    expect(v2.profile.avatarEmoji).toBe('🔥')
  })

  it('não sobrescreve prioridade se por algum motivo já existir', () => {
    const weird = {
      ...v1,
      goals: [{ ...v1.goals[0], priority: 'alta' } as (typeof v1.goals)[0]],
    }
    expect(migrateV1toV2(weird).goals[0].priority).toBe('alta')
  })
})
