import type { AppState, Goal } from './types'

export type GoalStatus = 'archived' | 'queued' | 'completed' | 'active'

/** Concluído = tem etapas e todas estão feitas (fragmentar é obrigatório para concluir). */
export function isGoalCompleted(goal: Goal): boolean {
  return goal.milestones.length > 0 && goal.milestones.every((m) => m.done)
}

/** Status sempre derivado — nunca persistido, nunca dessincroniza. */
export function goalStatus(goal: Goal): GoalStatus {
  if (goal.archivedAt) return 'archived'
  if (goal.afterGoalId) return 'queued'
  if (isGoalCompleted(goal)) return 'completed'
  return 'active'
}

export function activeGoals(state: Pick<AppState, 'goals'>): Goal[] {
  return state.goals.filter((g) => goalStatus(g) === 'active' || goalStatus(g) === 'completed')
}

export function queuedGoals(state: Pick<AppState, 'goals'>): Goal[] {
  return state.goals.filter((g) => goalStatus(g) === 'queued')
}

/**
 * Objetivos na fila cujo bloqueador já foi concluído, arquivado ou não existe mais.
 * Dado quebrado (id órfão) libera a fila — nunca prender o usuário por lixo de dados.
 */
export function eligibleQueuedGoals(state: Pick<AppState, 'goals'>): Goal[] {
  const byId = new Map(state.goals.map((g) => [g.id, g]))
  return queuedGoals(state)
    .filter((g) => {
      const blocker = byId.get(g.afterGoalId!)
      return !blocker || Boolean(blocker.archivedAt) || isGoalCompleted(blocker)
    })
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt) || a.id.localeCompare(b.id))
}
