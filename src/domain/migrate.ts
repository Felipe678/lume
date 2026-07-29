import type { AppState, CheckIn, Goal, TimeBlock } from './types'
import { defaultProfile } from './types'

/** Shape congelado do estado v1 — só o migrador conhece. */
export interface AppStateV1 {
  schemaVersion: 1
  goals: Array<Omit<Goal, 'priority'>>
  blocks: TimeBlock[]
  checkIns: Record<string, CheckIn>
}

/** v1 → v2: goals ganham prioridade neutra; rewards e perfil nascem vazios. */
export function migrateV1toV2(v1: AppStateV1): AppState {
  return {
    schemaVersion: 2,
    goals: v1.goals.map((g) => ({ priority: 'media' as const, ...g }) as Goal),
    blocks: v1.blocks,
    checkIns: v1.checkIns,
    rewards: [],
    profile: defaultProfile(),
  }
}
