import type { AppState, Goal, ISODate, TimeBlock } from './types'
import { checkInKey } from './types'
import { hhmmToMin, minutesOfDay, toISODate, weekdayOf } from './dates'

export type ActivityStatus = 'done' | 'current' | 'upcoming' | 'missed'

/** Instância concreta de um bloco num dia — sempre derivada, nunca persistida. */
export interface DayActivity {
  block: TimeBlock
  goal: Goal | null
  date: ISODate
  status: ActivityStatus
  startMin: number
  endMin: number
}

/** Blocos visíveis: exclui os de objetivos arquivados. */
export function visibleBlocks(state: Pick<AppState, 'goals' | 'blocks'>): TimeBlock[] {
  const archived = new Set(state.goals.filter((g) => g.archivedAt).map((g) => g.id))
  return state.blocks.filter((b) => b.goalId === null || !archived.has(b.goalId))
}

export function getDayActivities(state: AppState, date: ISODate, now: Date): DayActivity[] {
  const weekday = weekdayOf(date)
  const goalsById = new Map(state.goals.map((g) => [g.id, g]))
  const today = toISODate(now)
  const nowMin = minutesOfDay(now)

  return visibleBlocks(state)
    .filter((b) => b.weekdays.includes(weekday))
    .map<DayActivity>((b) => {
      const startMin = hhmmToMin(b.start)
      const endMin = hhmmToMin(b.end)
      const done = checkInKey(date, b.id) in state.checkIns
      let status: ActivityStatus
      if (done) status = 'done'
      else if (date < today) status = 'missed'
      else if (date > today) status = 'upcoming'
      else if (nowMin >= startMin && nowMin < endMin) status = 'current'
      else if (endMin <= nowMin) status = 'missed'
      else status = 'upcoming'
      return {
        block: b,
        goal: b.goalId ? (goalsById.get(b.goalId) ?? null) : null,
        date,
        status,
        startMin,
        endMin,
      }
    })
    .sort((a, b) => a.startMin - b.startMin || a.block.id.localeCompare(b.block.id))
}

/**
 * `current` = atividade cuja janela [start, end) contém o agora, mesmo se já concluída
 * (o Painel diferencia pelo status). Sobreposição: início mais recente vence; empate → menor id.
 * `next` = primeira atividade ainda por vir e não concluída (check-in antecipado pula a fila).
 */
export function getCurrentAndNext(
  activities: DayActivity[],
  now: Date,
): { current?: DayActivity; next?: DayActivity } {
  const nowMin = minutesOfDay(now)
  const inWindow = activities
    .filter((a) => nowMin >= a.startMin && nowMin < a.endMin)
    .sort((a, b) => b.startMin - a.startMin || a.block.id.localeCompare(b.block.id))
  const next = activities.find((a) => a.status === 'upcoming')
  return { current: inWindow[0], next }
}
