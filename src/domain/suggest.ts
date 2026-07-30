import type { BlockDraft, GoalPriority, HHMM, ISODate, Weekday } from './types'
import { suggestedStartAvoidingWork, type WorkSchedule } from './work'

export interface PriorityPreset {
  weekdays: Weekday[]
  durationMin: number
  label: string
}

/** Prioridade → encaixes sugeridos: mais alta = mais dias e blocos mais longos. */
export const PRIORITY_PRESETS: Record<GoalPriority, PriorityPreset> = {
  alta: { weekdays: [1, 2, 3, 4, 5], durationMin: 60, label: '5× por semana · 1h por dia' },
  media: { weekdays: [1, 3, 5], durationMin: 45, label: '3× por semana · 45min' },
  baixa: { weekdays: [2, 4], durationMin: 30, label: '2× por semana · 30min' },
}

const DEFAULT_START: HHMM = '19:00'

function addMinutes(hhmm: string, minutes: number): string {
  const [h, m] = hhmm.split(':').map(Number)
  const total = Math.min(h * 60 + m + minutes, 23 * 60 + 59)
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`
}

export interface SuggestOptions {
  /** Quando informado, o horário sugerido desvia do trabalho. */
  workSchedule?: WorkSchedule
  /** Data de referência para escalas cíclicas (normalmente hoje). */
  refDate?: ISODate
  start?: HHMM
}

/**
 * Sugere os encaixes semanais de um objetivo novo conforme a prioridade,
 * respeitando a rotina de trabalho quando fornecida.
 * Retorna drafts editáveis — o usuário ajusta dias/horários no assistente.
 */
export function suggestBlocks(
  priority: GoalPriority,
  goalTitle: string,
  options: SuggestOptions = {},
): BlockDraft[] {
  const preset = PRIORITY_PRESETS[priority]
  const ws = options.workSchedule ?? { mode: 'none' as const }
  const refDate = options.refDate ?? '2026-01-05' // segunda arbitrária — irrelevante sem escala cíclica
  const start =
    options.start ?? suggestedStartAvoidingWork(ws, preset.weekdays, preset.durationMin, refDate, DEFAULT_START)
  return [
    {
      title: goalTitle,
      goalId: null, // preenchido ao salvar (o objetivo ainda não tem id)
      weekdays: [...preset.weekdays],
      start,
      end: addMinutes(start, preset.durationMin),
    },
  ]
}
