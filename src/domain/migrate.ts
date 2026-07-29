import type { AppState, CheckIn, Goal, Profile, Reward, TimeBlock } from './types'
import { defaultProfile } from './types'

/** Shape congelado do estado v1 — só o migrador conhece. */
export interface AppStateV1 {
  schemaVersion: 1
  goals: Array<Omit<Goal, 'priority'>>
  blocks: TimeBlock[]
  checkIns: Record<string, CheckIn>
}

/** Shape congelado do estado v2. */
export interface AppStateV2 {
  schemaVersion: 2
  goals: Goal[]
  blocks: TimeBlock[]
  checkIns: Record<string, CheckIn>
  rewards: Reward[]
  profile: Profile
}

/** v1 → v2: goals ganham prioridade neutra; rewards e perfil nascem vazios. */
export function migrateV1toV2(v1: AppStateV1): AppStateV2 {
  return {
    schemaVersion: 2,
    goals: v1.goals.map((g) => ({ priority: 'media' as const, ...g }) as Goal),
    blocks: v1.blocks,
    checkIns: v1.checkIns,
    rewards: [],
    profile: defaultProfile(),
  }
}

/** v2 → v3: nasce a rotina de trabalho (vazia). */
export function migrateV2toV3(v2: AppStateV2): AppState {
  return { ...v2, schemaVersion: 3, workSchedule: { mode: 'none' } }
}

/** Migra qualquer versão conhecida até a atual. */
export function migrateToLatest(persisted: unknown, version: number): AppState {
  let state = persisted as AppStateV1 | AppStateV2 | AppState
  if (version < 2) state = migrateV1toV2(state as AppStateV1)
  if (version < 3) state = migrateV2toV3(state as AppStateV2)
  return state as AppState
}
