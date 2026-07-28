import { describe, expect, it } from 'vitest'
import { findOverlaps, validateAppState, validateBlockInput } from './validate'
import { makeBlock, makeGoal, makeState, withCheckIns } from './test-helpers'
import type { Weekday } from './types'

const base = { title: 'Inglês', weekdays: [1, 2] as Weekday[], start: '08:00', end: '09:00' }

describe('validateBlockInput', () => {
  it('aceita um bloco válido', () => {
    expect(validateBlockInput(base)).toEqual([])
  })

  it('exige título e pelo menos um dia', () => {
    expect(validateBlockInput({ ...base, title: '   ' })).toHaveLength(1)
    expect(validateBlockInput({ ...base, weekdays: [] })).toHaveLength(1)
  })

  it('rejeita fim <= início (não cruza a meia-noite)', () => {
    expect(validateBlockInput({ ...base, start: '22:00', end: '01:00' })).toHaveLength(1)
    expect(validateBlockInput({ ...base, start: '08:00', end: '08:00' })).toHaveLength(1)
  })

  it('exige duração mínima de 5 minutos', () => {
    expect(validateBlockInput({ ...base, start: '08:00', end: '08:04' })).toHaveLength(1)
    expect(validateBlockInput({ ...base, start: '08:00', end: '08:05' })).toEqual([])
  })

  it('rejeita horários malformados', () => {
    expect(validateBlockInput({ ...base, start: '25:00' })).toHaveLength(1)
    expect(validateBlockInput({ ...base, end: '8h30' })).toHaveLength(1)
  })
})

describe('findOverlaps', () => {
  const existing = [makeBlock('a', [1], '08:00', '10:00'), makeBlock('b', [3], '08:00', '10:00')]

  it('detecta sobreposição no mesmo dia', () => {
    const hits = findOverlaps({ ...base, weekdays: [1], start: '09:00', end: '11:00' }, existing)
    expect(hits.map((h) => h.id)).toEqual(['a'])
  })

  it('adjacente NÃO sobrepõe (intervalo semiaberto)', () => {
    expect(findOverlaps({ ...base, weekdays: [1], start: '10:00', end: '11:00' }, existing)).toEqual([])
  })

  it('dias diferentes não sobrepõem e o próprio bloco é ignorado', () => {
    expect(findOverlaps({ ...base, weekdays: [2], start: '08:00', end: '10:00' }, existing)).toEqual([])
    expect(
      findOverlaps({ id: 'a', ...base, weekdays: [1], start: '08:00', end: '10:00' }, existing),
    ).toEqual([])
  })
})

describe('validateAppState', () => {
  const goal = makeGoal('g1')
  const valid = makeState({
    goals: [goal],
    blocks: [makeBlock('b1', [1], '08:00', '09:00', { goalId: 'g1' })],
    checkIns: withCheckIns([['2026-07-28', 'b1']]),
  })

  it('aceita um estado válido (round-trip do export)', () => {
    const result = validateAppState(JSON.parse(JSON.stringify(valid)))
    expect(result.ok).toBe(true)
  })

  it('recusa versões de schema desconhecidas (arquivo de app mais novo)', () => {
    const result = validateAppState({ ...valid, schemaVersion: 3 })
    expect(result.ok).toBe(false)
  })

  it('aceita backup v1 e migra para v2 (check-ins são sagrados)', () => {
    const v1 = JSON.parse(JSON.stringify(valid)) as Record<string, unknown>
    v1.schemaVersion = 1
    delete v1.rewards
    delete v1.profile
    for (const g of v1.goals as Array<Record<string, unknown>>) delete g.priority
    const result = validateAppState(v1)
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.state.schemaVersion).toBe(2)
      expect(result.state.goals[0].priority).toBe('media')
      expect(result.state.rewards).toEqual([])
    }
  })

  it('v2 exige prioridade válida e aceita afterGoalId órfão', () => {
    const badPriority = JSON.parse(JSON.stringify(valid))
    badPriority.goals[0].priority = 'urgentíssima'
    expect(validateAppState(badPriority).ok).toBe(false)

    const orphanQueue = JSON.parse(JSON.stringify(valid))
    orphanQueue.goals[0].afterGoalId = 'fantasma'
    expect(validateAppState(orphanQueue).ok).toBe(true)
  })

  it('valida premiações: gatilho desconhecido recusado', () => {
    const bad = JSON.parse(JSON.stringify(valid))
    bad.rewards = [
      { id: 'r1', title: 'Prêmio', emoji: '🎁', category: 'Lazer', trigger: { kind: 'loteria' }, createdAt: '2026-01-01' },
    ]
    expect(validateAppState(bad).ok).toBe(false)
  })

  it('recusa não-objetos e estruturas erradas', () => {
    expect(validateAppState(null).ok).toBe(false)
    expect(validateAppState([]).ok).toBe(false)
    expect(validateAppState({ schemaVersion: 1, goals: {}, blocks: [], checkIns: {} }).ok).toBe(false)
    expect(validateAppState({ schemaVersion: 1, goals: [], blocks: [], checkIns: [] }).ok).toBe(false)
  })

  it('recusa bloco apontando para objetivo inexistente', () => {
    const broken = JSON.parse(JSON.stringify(valid))
    broken.blocks[0].goalId = 'fantasma'
    expect(validateAppState(broken).ok).toBe(false)
  })

  it('recusa cor de objetivo desconhecida e check-in malformado', () => {
    const badColor = JSON.parse(JSON.stringify(valid))
    badColor.goals[0].color = 'roxo-neon'
    expect(validateAppState(badColor).ok).toBe(false)

    const badCheckIn = JSON.parse(JSON.stringify(valid))
    badCheckIn.checkIns['x'] = { date: 'ontem', blockId: 'b1' }
    expect(validateAppState(badCheckIn).ok).toBe(false)
  })
})
