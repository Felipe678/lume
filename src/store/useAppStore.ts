import { create } from 'zustand'
import { createJSONStorage, persist, type StateStorage } from 'zustand/middleware'
import type {
  AppState,
  BlockDraft,
  Goal,
  GoalColor,
  GoalPriority,
  ISODate,
  Profile,
  Reward,
  RewardTrigger,
  TimeBlock,
  Weekday,
} from '../domain/types'
import { checkInKey, emptyState } from '../domain/types'
import { toISODate } from '../domain/dates'
import { isGoalCompleted } from '../domain/goals'
import { newlyUnlockedRewards } from '../domain/achievements'
import { migrateV1toV2, type AppStateV1 } from '../domain/migrate'

export type { BlockDraft } from '../domain/types'

export const STORAGE_KEY = 'lume:v1' // nome histórico da chave; quem versiona é o persist

// localStorage pode não existir (modo privado / tela de config). App segue em memória, com banner.
export const storageAvailable = (() => {
  try {
    const probe = 'lume:probe'
    localStorage.setItem(probe, '1')
    localStorage.removeItem(probe)
    return true
  } catch {
    return false
  }
})()

const memory = new Map<string, string>()
const memoryStorage: StateStorage = {
  getItem: (k) => memory.get(k) ?? null,
  setItem: (k, v) => void memory.set(k, v),
  removeItem: (k) => void memory.delete(k),
}

const newId = () => crypto.randomUUID()
const localToday = () => toISODate(new Date())

export interface GoalInput {
  title: string
  emoji: string
  color: GoalColor
  description?: string
  priority: GoalPriority
  estimatedHours?: number
}

export interface GoalWizardInput extends GoalInput {
  afterGoalId?: string
  milestoneTitles: string[]
}

export interface RewardInput {
  title: string
  emoji: string
  category: string
  trigger: RewardTrigger
}

interface Actions {
  addGoal: (input: GoalInput) => void
  /** Cria objetivo + etapas + encaixes num único set (assistente). */
  createGoalWithBlocks: (input: GoalWizardInput, drafts: BlockDraft[]) => void
  updateGoal: (id: string, patch: Partial<GoalInput>) => void
  /** blockMode: 'archive' arquiva os blocos junto; 'convert' transforma-os em Obrigatória. */
  archiveGoal: (id: string, blockMode: 'archive' | 'convert') => void
  /** Tira o objetivo da fila (apaga afterGoalId). */
  activateGoal: (id: string) => void
  activateGoalWithBlocks: (id: string, drafts: BlockDraft[]) => void
  addMilestone: (goalId: string, title: string) => void
  toggleMilestone: (goalId: string, milestoneId: string) => void
  removeMilestone: (goalId: string, milestoneId: string) => void
  addBlock: (draft: BlockDraft) => void
  updateBlock: (id: string, patch: Partial<BlockDraft>) => void
  deleteBlock: (id: string) => void
  checkIn: (blockId: string, date: ISODate, now: Date) => void
  undoCheckIn: (blockId: string, date: ISODate) => void
  addReward: (input: RewardInput) => void
  updateReward: (id: string, patch: Partial<RewardInput>) => void
  deleteReward: (id: string) => void
  redeemReward: (id: string) => void
  setProfile: (profile: Profile) => void
  replaceState: (state: AppState) => void
  clearAll: () => void
  seedDemo: () => void
}

export type AppStore = AppState & Actions

const mapGoal = (goals: Goal[], id: string, fn: (g: Goal) => Goal) =>
  goals.map((g) => (g.id === id ? fn(g) : g))

/** Recarimba completedAt conforme as etapas (cruza 100% → carimba; desfaz → limpa). */
const stampCompletion = (g: Goal): Goal => {
  const completed = isGoalCompleted(g)
  if (completed && !g.completedAt) return { ...g, completedAt: localToday() }
  if (!completed && g.completedAt) return { ...g, completedAt: undefined }
  return g
}

/** Marca unlockedAt (uma única vez) nas premiações cujo gatilho passou a ser satisfeito. */
const reconcileRewards = (next: AppState, now: Date): Reward[] => {
  const newly = newlyUnlockedRewards(next, now)
  if (newly.length === 0) return next.rewards
  const ids = new Set(newly.map((r) => r.id))
  return next.rewards.map((r) => (ids.has(r.id) ? { ...r, unlockedAt: toISODate(now) } : r))
}

const pure = (s: AppStore): AppState => ({
  schemaVersion: 2,
  goals: s.goals,
  blocks: s.blocks,
  checkIns: s.checkIns,
  rewards: s.rewards,
  profile: s.profile,
})

export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      ...emptyState(),

      addGoal: (input) =>
        set((s) => ({
          goals: [...s.goals, { ...input, id: newId(), milestones: [], createdAt: localToday() }],
        })),

      createGoalWithBlocks: (input, drafts) =>
        set((s) => {
          const { milestoneTitles, ...goalFields } = input
          const goalId = newId()
          const goal: Goal = {
            ...goalFields,
            id: goalId,
            milestones: milestoneTitles.map((title) => ({ id: newId(), title, done: false })),
            createdAt: localToday(),
          }
          const blocks: TimeBlock[] = drafts.map((d) => ({
            ...d,
            goalId,
            id: newId(),
            createdAt: localToday(),
          }))
          return { goals: [...s.goals, goal], blocks: [...s.blocks, ...blocks] }
        }),

      updateGoal: (id, patch) =>
        set((s) => ({ goals: mapGoal(s.goals, id, (g) => stampCompletion({ ...g, ...patch })) })),

      archiveGoal: (id, blockMode) =>
        set((s) => ({
          goals: mapGoal(s.goals, id, (g) => ({ ...g, archivedAt: localToday() })),
          blocks:
            blockMode === 'convert'
              ? s.blocks.map((b) => (b.goalId === id ? { ...b, goalId: null } : b))
              : s.blocks,
        })),

      activateGoal: (id) =>
        set((s) => ({ goals: mapGoal(s.goals, id, (g) => ({ ...g, afterGoalId: undefined })) })),

      activateGoalWithBlocks: (id, drafts) =>
        set((s) => ({
          goals: mapGoal(s.goals, id, (g) => ({ ...g, afterGoalId: undefined })),
          blocks: [
            ...s.blocks,
            ...drafts.map((d) => ({ ...d, goalId: id, id: newId(), createdAt: localToday() })),
          ],
        })),

      addMilestone: (goalId, title) =>
        set((s) => ({
          goals: mapGoal(s.goals, goalId, (g) =>
            stampCompletion({
              ...g,
              milestones: [...g.milestones, { id: newId(), title, done: false }],
            }),
          ),
        })),

      toggleMilestone: (goalId, milestoneId) =>
        set((s) => {
          const now = new Date()
          const goals = mapGoal(s.goals, goalId, (g) =>
            stampCompletion({
              ...g,
              milestones: g.milestones.map((m) =>
                m.id === milestoneId
                  ? { ...m, done: !m.done, doneAt: m.done ? undefined : localToday() }
                  : m,
              ),
            }),
          )
          const next = { ...pure(s as AppStore), goals }
          return { goals, rewards: reconcileRewards(next, now) }
        }),

      removeMilestone: (goalId, milestoneId) =>
        set((s) => ({
          goals: mapGoal(s.goals, goalId, (g) =>
            stampCompletion({
              ...g,
              milestones: g.milestones.filter((m) => m.id !== milestoneId),
            }),
          ),
        })),

      addBlock: (draft) =>
        set((s) => ({ blocks: [...s.blocks, { ...draft, id: newId(), createdAt: localToday() }] })),

      updateBlock: (id, patch) =>
        set((s) => ({ blocks: s.blocks.map((b) => (b.id === id ? { ...b, ...patch } : b)) })),

      deleteBlock: (id) => set((s) => ({ blocks: s.blocks.filter((b) => b.id !== id) })),

      checkIn: (blockId, date, now) =>
        set((s) => {
          const checkIns = {
            ...s.checkIns,
            [checkInKey(date, blockId)]: { date, blockId, completedAt: now.toISOString() },
          }
          const next = { ...pure(s as AppStore), checkIns }
          return { checkIns, rewards: reconcileRewards(next, now) }
        }),

      undoCheckIn: (blockId, date) =>
        set((s) => {
          const next = { ...s.checkIns }
          delete next[checkInKey(date, blockId)]
          return { checkIns: next }
        }),

      addReward: (input) =>
        set((s) => {
          const reward: Reward = { ...input, id: newId(), createdAt: localToday() }
          const next = { ...pure(s as AppStore), rewards: [...s.rewards, reward] }
          // gatilho já satisfeito ao criar (ex.: streak 7 com streak atual 10) destrava na hora
          return { rewards: reconcileRewards(next, new Date()) }
        }),

      updateReward: (id, patch) =>
        set((s) => ({
          rewards: s.rewards.map((r) => (r.id === id ? { ...r, ...patch } : r)),
        })),

      deleteReward: (id) => set((s) => ({ rewards: s.rewards.filter((r) => r.id !== id) })),

      redeemReward: (id) =>
        set((s) => ({
          rewards: s.rewards.map((r) =>
            r.id === id && r.unlockedAt && !r.redeemedAt ? { ...r, redeemedAt: localToday() } : r,
          ),
        })),

      setProfile: (profile) => set({ profile }),

      replaceState: (state) => set({ ...state }),

      clearAll: () => set({ ...emptyState() }),

      seedDemo: () =>
        set(() => {
          const today = localToday()
          const ingles: Goal = {
            id: newId(),
            title: 'Aprender inglês',
            emoji: '📚',
            color: 'sky',
            priority: 'alta',
            estimatedHours: 120,
            milestones: [
              { id: newId(), title: 'Terminar unidade 1 do curso', done: true, doneAt: today },
              { id: newId(), title: 'Assistir 1 série sem legenda', done: false },
              { id: newId(), title: 'Conversação de 30 min', done: false },
            ],
            createdAt: today,
          }
          const treino: Goal = {
            id: newId(),
            title: 'Ficar em forma',
            emoji: '💪',
            color: 'emerald',
            priority: 'media',
            estimatedHours: 60,
            milestones: [
              { id: newId(), title: 'Treinar 3x por semana durante 1 mês', done: false },
              { id: newId(), title: 'Correr 5 km sem parar', done: false },
            ],
            createdAt: today,
          }
          const violao: Goal = {
            id: newId(),
            title: 'Aprender violão',
            emoji: '🎸',
            color: 'violet',
            priority: 'baixa',
            afterGoalId: ingles.id,
            milestones: [{ id: newId(), title: 'Tocar a primeira música inteira', done: false }],
            createdAt: today,
          }
          const mkBlock = (
            title: string,
            goalId: string | null,
            weekdays: Weekday[],
            start: string,
            end: string,
          ): TimeBlock => ({ id: newId(), title, goalId, weekdays, start, end, createdAt: today })

          return {
            ...emptyState(),
            goals: [ingles, treino, violao],
            blocks: [
              mkBlock('Aula de inglês', ingles.id, [1, 2, 3, 4, 5], '08:00', '09:00'),
              mkBlock('Academia', treino.id, [1, 3, 5], '18:00', '19:00'),
              mkBlock('Lavar louça', null, [0, 1, 2, 3, 4, 5, 6], '20:00', '20:30'),
              mkBlock('Leitura', ingles.id, [0, 6], '10:00', '11:00'),
            ],
            rewards: [
              {
                id: newId(),
                title: 'Comprar o perfume que eu quero',
                emoji: '🛍️',
                category: 'Material',
                trigger: { kind: 'goal', goalId: ingles.id },
                createdAt: today,
              },
              {
                id: newId(),
                title: 'Uma noite inteira de jogos sem culpa',
                emoji: '🎮',
                category: 'Lazer',
                trigger: { kind: 'streak', days: 7 },
                createdAt: today,
              },
            ],
            profile: { name: '', avatarEmoji: '🔥' },
          }
        }),
    }),
    {
      name: STORAGE_KEY,
      version: 2,
      storage: createJSONStorage(() => (storageAvailable ? localStorage : memoryStorage)),
      migrate: (persisted, version) =>
        version < 2 ? (migrateV1toV2(persisted as AppStateV1) as AppStore) : (persisted as AppStore),
      partialize: (s) => pure(s),
    },
  ),
)

/** Estado puro (sem actions) — para export e derivações de domínio. */
export const selectAppState = pure
