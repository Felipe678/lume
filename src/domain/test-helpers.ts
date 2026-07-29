import type { AppState, CheckIn, Goal, TimeBlock, Weekday } from './types'
import { checkInKey, emptyState } from './types'

export function makeGoal(id: string, overrides: Partial<Goal> = {}): Goal {
  return {
    id,
    title: `Objetivo ${id}`,
    emoji: '🎯',
    color: 'amber',
    priority: 'media',
    milestones: [],
    createdAt: '2026-01-01',
    ...overrides,
  }
}

export function makeBlock(
  id: string,
  weekdays: Weekday[],
  start: string,
  end: string,
  overrides: Partial<TimeBlock> = {},
): TimeBlock {
  return {
    id,
    goalId: null,
    title: `Bloco ${id}`,
    weekdays,
    start,
    end,
    createdAt: '2026-01-01',
    ...overrides,
  }
}

export function makeState(overrides: Partial<AppState> = {}): AppState {
  return { ...emptyState(), ...overrides }
}

export function withCheckIns(pairs: Array<[string, string]>): Record<string, CheckIn> {
  const out: Record<string, CheckIn> = {}
  for (const [date, blockId] of pairs) {
    out[checkInKey(date, blockId)] = { date, blockId, completedAt: `${date}T12:00:00.000Z` }
  }
  return out
}
