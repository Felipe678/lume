import { create } from 'zustand'
import { createJSONStorage, persist, type StateStorage } from 'zustand/middleware'
import type { AppState, Goal, GoalColor, ISODate, TimeBlock, Weekday } from '../domain/types'
import { checkInKey, emptyState } from '../domain/types'
import { toISODate } from '../domain/dates'

export const STORAGE_KEY = 'lume:v1'

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
}

export interface BlockDraft {
  title: string
  goalId: string | null
  weekdays: Weekday[]
  start: string
  end: string
}

interface Actions {
  addGoal: (input: GoalInput) => void
  updateGoal: (id: string, patch: Partial<GoalInput>) => void
  /** blockMode: 'archive' arquiva os blocos junto; 'convert' transforma-os em Obrigatória. */
  archiveGoal: (id: string, blockMode: 'archive' | 'convert') => void
  addMilestone: (goalId: string, title: string) => void
  toggleMilestone: (goalId: string, milestoneId: string) => void
  removeMilestone: (goalId: string, milestoneId: string) => void
  addBlock: (draft: BlockDraft) => void
  updateBlock: (id: string, patch: Partial<BlockDraft>) => void
  deleteBlock: (id: string) => void
  checkIn: (blockId: string, date: ISODate, now: Date) => void
  undoCheckIn: (blockId: string, date: ISODate) => void
  replaceState: (state: AppState) => void
  clearAll: () => void
  seedDemo: () => void
}

export type AppStore = AppState & Actions

const mapGoal = (goals: Goal[], id: string, fn: (g: Goal) => Goal) =>
  goals.map((g) => (g.id === id ? fn(g) : g))

export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      ...emptyState(),

      addGoal: (input) =>
        set((s) => ({
          goals: [...s.goals, { ...input, id: newId(), milestones: [], createdAt: localToday() }],
        })),

      updateGoal: (id, patch) => set((s) => ({ goals: mapGoal(s.goals, id, (g) => ({ ...g, ...patch })) })),

      archiveGoal: (id, blockMode) =>
        set((s) => ({
          goals: mapGoal(s.goals, id, (g) => ({ ...g, archivedAt: localToday() })),
          blocks:
            blockMode === 'convert'
              ? s.blocks.map((b) => (b.goalId === id ? { ...b, goalId: null } : b))
              : s.blocks,
        })),

      addMilestone: (goalId, title) =>
        set((s) => ({
          goals: mapGoal(s.goals, goalId, (g) => ({
            ...g,
            milestones: [...g.milestones, { id: newId(), title, done: false }],
          })),
        })),

      toggleMilestone: (goalId, milestoneId) =>
        set((s) => ({
          goals: mapGoal(s.goals, goalId, (g) => ({
            ...g,
            milestones: g.milestones.map((m) =>
              m.id === milestoneId
                ? { ...m, done: !m.done, doneAt: m.done ? undefined : localToday() }
                : m,
            ),
          })),
        })),

      removeMilestone: (goalId, milestoneId) =>
        set((s) => ({
          goals: mapGoal(s.goals, goalId, (g) => ({
            ...g,
            milestones: g.milestones.filter((m) => m.id !== milestoneId),
          })),
        })),

      addBlock: (draft) =>
        set((s) => ({ blocks: [...s.blocks, { ...draft, id: newId(), createdAt: localToday() }] })),

      updateBlock: (id, patch) =>
        set((s) => ({ blocks: s.blocks.map((b) => (b.id === id ? { ...b, ...patch } : b)) })),

      deleteBlock: (id) => set((s) => ({ blocks: s.blocks.filter((b) => b.id !== id) })),

      checkIn: (blockId, date, now) =>
        set((s) => ({
          checkIns: {
            ...s.checkIns,
            [checkInKey(date, blockId)]: { date, blockId, completedAt: now.toISOString() },
          },
        })),

      undoCheckIn: (blockId, date) =>
        set((s) => {
          const next = { ...s.checkIns }
          delete next[checkInKey(date, blockId)]
          return { checkIns: next }
        }),

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
            milestones: [
              { id: newId(), title: 'Treinar 3x por semana durante 1 mês', done: false },
              { id: newId(), title: 'Correr 5 km sem parar', done: false },
            ],
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
            goals: [ingles, treino],
            blocks: [
              mkBlock('Aula de inglês', ingles.id, [1, 2, 3, 4, 5], '08:00', '09:00'),
              mkBlock('Academia', treino.id, [1, 3, 5], '18:00', '19:00'),
              mkBlock('Lavar louça', null, [0, 1, 2, 3, 4, 5, 6], '20:00', '20:30'),
              mkBlock('Leitura', ingles.id, [0, 6], '10:00', '11:00'),
            ],
          }
        }),
    }),
    {
      name: STORAGE_KEY,
      version: 1,
      storage: createJSONStorage(() => (storageAvailable ? localStorage : memoryStorage)),
      partialize: (s) => ({
        schemaVersion: s.schemaVersion,
        goals: s.goals,
        blocks: s.blocks,
        checkIns: s.checkIns,
      }),
    },
  ),
)

/** Estado puro (sem actions) — para export e derivações de domínio. */
export const selectAppState = (s: AppStore): AppState => ({
  schemaVersion: s.schemaVersion,
  goals: s.goals,
  blocks: s.blocks,
  checkIns: s.checkIns,
})
