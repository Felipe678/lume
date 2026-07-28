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

export interface Goal {
  id: ID
  title: string
  emoji: string
  color: GoalColor
  description?: string
  milestones: Milestone[]
  createdAt: ISODate
  archivedAt?: ISODate
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

export interface AppState {
  schemaVersion: 1
  goals: Goal[]
  blocks: TimeBlock[]
  /** Chave lógica "AAAA-MM-DD:blockId" — idempotente por construção. */
  checkIns: Record<string, CheckIn>
}

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
  schemaVersion: 1,
  goals: [],
  blocks: [],
  checkIns: {},
})
