import type { Goal } from './types'
import type { DayActivity } from './schedule'

export interface Ratio {
  done: number
  total: number
}

/** Progresso total do objetivo = etapas concluídas / total. null quando não há etapas (mostrar "—"). */
export function goalTotalProgress(goal: Goal): number | null {
  if (goal.milestones.length === 0) return null
  return goal.milestones.filter((m) => m.done).length / goal.milestones.length
}

export function dayProgress(activities: DayActivity[]): Ratio {
  return {
    done: activities.filter((a) => a.status === 'done').length,
    total: activities.length,
  }
}

export function goalDayProgress(activities: DayActivity[], goalId: string): Ratio {
  const own = activities.filter((a) => a.block.goalId === goalId)
  return {
    done: own.filter((a) => a.status === 'done').length,
    total: own.length,
  }
}
