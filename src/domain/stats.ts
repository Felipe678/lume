import type { AppState, ISODate, TimeBlock } from './types'
import { checkInKey } from './types'
import {
  addDaysISO,
  hhmmToMin,
  startOfMonthISO,
  startOfWeekISO,
  toISODate,
  weekdayOf,
} from './dates'
import { visibleBlocks } from './schedule'
import { goalStatus } from './goals'
import { goalTotalProgress, type Ratio } from './progress'

/** Blocos que a grade ATUAL agenda para a data (aproximação consciente — ver KB). */
export function scheduledBlocksOn(
  state: Pick<AppState, 'goals' | 'blocks'>,
  date: ISODate,
  goalId?: string,
): TimeBlock[] {
  const weekday = weekdayOf(date)
  return visibleBlocks(state).filter(
    (b) => b.weekdays.includes(weekday) && (goalId === undefined || b.goalId === goalId),
  )
}

const blockMinutes = (b: TimeBlock) => hhmmToMin(b.end) - hhmmToMin(b.start)

/** Concluídos vs agendados no período [from, to] (inclusivo), pela grade atual. */
export function periodProgress(
  state: AppState,
  from: ISODate,
  to: ISODate,
  goalId?: string,
): Ratio {
  let done = 0
  let total = 0
  for (let day = from; day <= to; day = addDaysISO(day, 1)) {
    for (const b of scheduledBlocksOn(state, day, goalId)) {
      total++
      if (checkInKey(day, b.id) in state.checkIns) done++
    }
  }
  return { done, total }
}

/** Minutos investidos = soma das durações dos blocos com check-in (órfãos ficam fora). */
export function investedMinutes(state: AppState, goalId?: string): number {
  const byId = new Map(state.blocks.map((b) => [b.id, b]))
  let min = 0
  for (const c of Object.values(state.checkIns)) {
    const block = byId.get(c.blockId)
    if (!block) continue
    if (goalId !== undefined && block.goalId !== goalId) continue
    min += blockMinutes(block)
  }
  return min
}

/** Ritmo semanal da grade atual para o objetivo (min/semana). */
export function weeklyPaceMinutes(state: Pick<AppState, 'goals' | 'blocks'>, goalId: string): number {
  return visibleBlocks(state)
    .filter((b) => b.goalId === goalId)
    .reduce((sum, b) => sum + blockMinutes(b) * b.weekdays.length, 0)
}

export interface GoalStats {
  daily: Ratio
  weekly: Ratio
  monthly: Ratio
  investedMin: number
  estimatedMin: number | null
  remainingMin: number | null
  paceMinPerWeek: number
  /** Semanas para concluir no ritmo atual; null sem estimativa ou sem ritmo. */
  projectedWeeks: number | null
  milestones: Ratio
}

export function computeGoalStats(state: AppState, goalId: string, now: Date): GoalStats {
  const goal = state.goals.find((g) => g.id === goalId)
  const today = toISODate(now)
  // períodos clampados em createdAt: a grade não fabrica faltas de antes do objetivo existir
  const clamp = (from: ISODate) => (goal && goal.createdAt > from ? goal.createdAt : from)

  const investedMin = investedMinutes(state, goalId)
  const estimatedMin = goal?.estimatedHours ? goal.estimatedHours * 60 : null
  const remainingMin = estimatedMin === null ? null : Math.max(0, estimatedMin - investedMin)
  const paceMinPerWeek = weeklyPaceMinutes(state, goalId)

  return {
    daily: periodProgress(state, today, today, goalId),
    weekly: periodProgress(state, clamp(startOfWeekISO(today)), today, goalId),
    monthly: periodProgress(state, clamp(startOfMonthISO(today)), today, goalId),
    investedMin,
    estimatedMin,
    remainingMin,
    paceMinPerWeek,
    projectedWeeks:
      remainingMin === null || paceMinPerWeek === 0 ? null : Math.ceil(remainingMin / paceMinPerWeek),
    milestones: {
      done: goal?.milestones.filter((m) => m.done).length ?? 0,
      total: goal?.milestones.length ?? 0,
    },
  }
}

/** Progresso geral = média do progresso de etapas dos objetivos ativos/concluídos. null sem dados. */
export function overallProgress(state: Pick<AppState, 'goals'>): number | null {
  const fractions = state.goals
    .filter((g) => goalStatus(g) === 'active' || goalStatus(g) === 'completed')
    .map((g) => goalTotalProgress(g))
    .filter((f): f is number => f !== null)
  if (fractions.length === 0) return null
  return fractions.reduce((a, b) => a + b, 0) / fractions.length
}

export interface DayHeat {
  date: ISODate
  done: number
  total: number
}

/** Mapa de calor do mês "AAAA-MM": concluídos/agendados por dia, pela grade atual. */
export function monthHeatmap(state: AppState, month: string): DayHeat[] {
  const days: DayHeat[] = []
  const [y, m] = month.split('-').map(Number)
  const count = new Date(y, m, 0).getDate()
  for (let i = 1; i <= count; i++) {
    const date = `${month}-${String(i).padStart(2, '0')}`
    const blocks = scheduledBlocksOn(state, date)
    days.push({
      date,
      done: blocks.filter((b) => checkInKey(date, b.id) in state.checkIns).length,
      total: blocks.length,
    })
  }
  return days
}

/** Maior sequência histórica (dias acesos consecutivos, pulando neutros pela grade atual). */
export function longestStreak(state: AppState): number {
  const litDates = [...new Set(Object.values(state.checkIns).map((c) => c.date))].sort()
  if (litDates.length === 0) return 0
  let best = 0
  let run = 0
  let prev: ISODate | null = null
  for (const date of litDates) {
    if (prev === null) run = 1
    else {
      // dias entre prev e date: se todos neutros (0 agendados), a sequência continua
      let gapOk = true
      for (let d = addDaysISO(prev, 1); d < date; d = addDaysISO(d, 1)) {
        if (scheduledBlocksOn(state, d).length > 0) {
          gapOk = false
          break
        }
      }
      run = gapOk ? run + 1 : 1
    }
    best = Math.max(best, run)
    prev = date
  }
  return best
}
