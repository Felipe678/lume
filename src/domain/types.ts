export type ID = string
/** Data LOCAL no formato "AAAA-MM-DD" — nunca derivada de toISOString (UTC). */
export type ISODate = string
/** Horário "HH:MM" (24h). */
export type HHMM = string
/** 0 = domingo (padrão Date.getDay()). */
export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6

export interface Milestone {
  id: ID
  title: string
  done: boolean
  doneAt?: ISODate
}

export type GoalPriority = 'alta' | 'media' | 'baixa'

export const PRIORITY_LABELS: Record<GoalPriority, string> = {
  alta: 'Alta',
  media: 'Média',
  baixa: 'Baixa',
}

export const PRIORITY_COLORS: Record<GoalPriority, string> = {
  alta: '#f43f5e',
  media: '#f59e0b',
  baixa: '#0ea5e9',
}

export interface Goal {
  id: ID
  title: string
  emoji: string
  color: GoalColor
  /** O porquê — a razão de existir do objetivo. */
  description?: string
  priority: GoalPriority
  /** Estimativa total de horas para concluir (projeção no detalhe). */
  estimatedHours?: number
  /** Presente => "na fila": começa após esse objetivo ser concluído. */
  afterGoalId?: ID
  milestones: Milestone[]
  createdAt: ISODate
  /** Carimbado quando as etapas chegam a 100% (galeria de conquistas). */
  completedAt?: ISODate
  archivedAt?: ISODate
}

export type RewardTrigger =
  | { kind: 'goal'; goalId: ID }
  | { kind: 'streak'; days: number }
  | { kind: 'hours'; hours: number; goalId?: ID }
  | { kind: 'perfectWeek' }

export interface Reward {
  id: ID
  title: string
  emoji: string
  /** Categoria livre para organização (material, experiência, lazer, descanso...). */
  category: string
  trigger: RewardTrigger
  createdAt: ISODate
  /** Carimbado uma única vez quando o gatilho é satisfeito. */
  unlockedAt?: ISODate
  /** Carimbado quando o usuário resgata o prêmio. */
  redeemedAt?: ISODate
}

export interface Profile {
  name: string
  avatarEmoji: string
}

export interface TimeBlock {
  id: ID
  /** null => "Obrigatória" (atividade sem objetivo). */
  goalId: ID | null
  title: string
  weekdays: Weekday[]
  start: HHMM
  /** Intervalo semiaberto [start, end); end > start — blocos não cruzam a meia-noite. */
  end: HHMM
  createdAt: ISODate
}

export interface CheckIn {
  date: ISODate
  blockId: ID
  completedAt: string
}

import type { WorkSchedule } from './work'

export interface AppState {
  schemaVersion: 3
  goals: Goal[]
  blocks: TimeBlock[]
  /** Chave lógica "AAAA-MM-DD:blockId" — idempotente por construção. */
  checkIns: Record<string, CheckIn>
  rewards: Reward[]
  profile: Profile
  /** Rotina de trabalho — o planejamento respeita essa disponibilidade. */
  workSchedule: WorkSchedule
}

/** Rascunho de bloco antes de ganhar id/createdAt (wizard, sugestões, store). */
export interface BlockDraft {
  title: string
  goalId: ID | null
  weekdays: Weekday[]
  start: HHMM
  end: HHMM
}

export const defaultProfile = (): Profile => ({ name: '', avatarEmoji: '🔥' })

export const checkInKey = (date: ISODate, blockId: ID) => `${date}:${blockId}`

export const GOAL_COLORS = {
  amber: '#f59e0b',
  sky: '#0ea5e9',
  emerald: '#10b981',
  rose: '#f43f5e',
  violet: '#8b5cf6',
  lime: '#84cc16',
  cyan: '#06b6d4',
  fuchsia: '#d946ef',
} as const

export type GoalColor = keyof typeof GOAL_COLORS

export const OBLIGATORY_COLOR = '#78716c'

export const emptyState = (): AppState => ({
  schemaVersion: 3,
  goals: [],
  blocks: [],
  checkIns: {},
  rewards: [],
  profile: defaultProfile(),
  workSchedule: { mode: 'none' },
})
