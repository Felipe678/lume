import type { AppState, ISODate, Reward } from './types'
import { addDaysISO, startOfWeekISO, toISODate } from './dates'
import { computeStreak } from './streak'
import { investedMinutes, longestStreak, periodProgress, scheduledBlocksOn } from './stats'
import { isGoalCompleted } from './goals'

export interface Badge {
  id: string
  title: string
  emoji: string
  description: string
  isUnlocked: (state: AppState, now: Date) => boolean
}

const checkInCount = (s: AppState) => Object.keys(s.checkIns).length
const completedGoals = (s: AppState) => s.goals.filter((g) => isGoalCompleted(g)).length
const bestStreak = (s: AppState, now: Date) =>
  Math.max(longestStreak(s), computeStreak(s, toISODate(now)))

/** Semana (a partir da segunda dada) com 100% dos blocos agendados concluídos. */
export function isPerfectWeek(state: AppState, weekStart: ISODate): boolean {
  const { done, total } = periodProgress(state, weekStart, addDaysISO(weekStart, 6))
  return total > 0 && done === total
}

/** Alguma semana completa (terminada) foi perfeita? Varre da 1ª semana com check-in até a semana passada. */
export function hasAnyPerfectWeek(state: AppState, now: Date): boolean {
  const dates = Object.values(state.checkIns).map((c) => c.date)
  if (dates.length === 0) return false
  const first = startOfWeekISO(dates.reduce((a, b) => (a < b ? a : b)))
  const lastClosed = addDaysISO(startOfWeekISO(toISODate(now)), -7)
  for (let w = first; w <= lastClosed; w = addDaysISO(w, 7)) {
    if (isPerfectWeek(state, w)) return true
  }
  return false
}

/** Medalhas automáticas — derivadas dos dados, sem configuração. */
export const BADGES: Badge[] = [
  {
    id: 'primeira-chama',
    title: 'Primeira Chama',
    emoji: '🔥',
    description: 'Seu primeiro check-in — a chama acendeu.',
    isUnlocked: (s) => checkInCount(s) >= 1,
  },
  {
    id: 'streak-7',
    title: 'Uma Semana Acesa',
    emoji: '🕯️',
    description: '7 dias de sequência.',
    isUnlocked: (s, n) => bestStreak(s, n) >= 7,
  },
  {
    id: 'streak-21',
    title: 'Três Semanas',
    emoji: '🏮',
    description: '21 dias de sequência — o hábito está nascendo.',
    isUnlocked: (s, n) => bestStreak(s, n) >= 21,
  },
  {
    id: 'streak-66',
    title: 'Hábito Forjado',
    emoji: '⚒️',
    description: '66 dias — o marco científico da formação de um hábito.',
    isUnlocked: (s, n) => bestStreak(s, n) >= 66,
  },
  {
    id: 'streak-100',
    title: 'Centurião',
    emoji: '🏆',
    description: '100 dias de sequência.',
    isUnlocked: (s, n) => bestStreak(s, n) >= 100,
  },
  {
    id: 'primeiro-objetivo',
    title: 'Do Começo ao Fim',
    emoji: '🎯',
    description: 'Primeiro objetivo concluído — sem mudar de rota.',
    isUnlocked: (s) => completedGoals(s) >= 1,
  },
  {
    id: 'semana-perfeita',
    title: 'Semana Perfeita',
    emoji: '💎',
    description: '100% dos blocos de uma semana concluídos.',
    isUnlocked: (s, n) => hasAnyPerfectWeek(s, n),
  },
  {
    id: 'checkins-10',
    title: 'Aquecendo',
    emoji: '✅',
    description: '10 check-ins.',
    isUnlocked: (s) => checkInCount(s) >= 10,
  },
  {
    id: 'checkins-100',
    title: 'Constância de Verdade',
    emoji: '💯',
    description: '100 check-ins.',
    isUnlocked: (s) => checkInCount(s) >= 100,
  },
  {
    id: 'checkins-500',
    title: 'Inabalável',
    emoji: '🗿',
    description: '500 check-ins.',
    isUnlocked: (s) => checkInCount(s) >= 500,
  },
  {
    id: 'horas-10',
    title: '10 Horas Investidas',
    emoji: '⏳',
    description: '10 horas de vida investidas em objetivos.',
    isUnlocked: (s) => investedMinutes(s) >= 10 * 60,
  },
  {
    id: 'horas-50',
    title: 'Meio Cento',
    emoji: '⌛',
    description: '50 horas investidas.',
    isUnlocked: (s) => investedMinutes(s) >= 50 * 60,
  },
  {
    id: 'horas-100',
    title: 'Mestre do Tempo',
    emoji: '👑',
    description: '100 horas investidas.',
    isUnlocked: (s) => investedMinutes(s) >= 100 * 60,
  },
]

export function unlockedBadges(state: AppState, now: Date): Badge[] {
  return BADGES.filter((b) => b.isUnlocked(state, now))
}

/** O gatilho desta premiação está satisfeito pelos dados atuais? */
export function isRewardTriggerMet(state: AppState, reward: Reward, now: Date): boolean {
  const t = reward.trigger
  switch (t.kind) {
    case 'goal': {
      const goal = state.goals.find((g) => g.id === t.goalId)
      // objetivo removido nunca destrava sozinho — o usuário edita a premiação
      return goal ? isGoalCompleted(goal) : false
    }
    case 'streak':
      return bestStreak(state, now) >= t.days
    case 'hours':
      return investedMinutes(state, t.goalId) >= t.hours * 60
    case 'perfectWeek':
      return hasAnyPerfectWeek(state, now)
  }
}

/** Premiações ainda não destravadas cujo gatilho acabou de ser satisfeito. */
export function newlyUnlockedRewards(state: AppState, now: Date): Reward[] {
  return state.rewards.filter((r) => !r.unlockedAt && isRewardTriggerMet(state, r, now))
}

/** Sugestões de categoria para o formulário de premiações. */
export const REWARD_CATEGORIES = [
  { emoji: '🛍️', label: 'Material', hint: 'perfume, tênis, gadget' },
  { emoji: '✈️', label: 'Experiência', hint: 'viagem, jantar especial, show' },
  { emoji: '🎮', label: 'Lazer', hint: 'jogar X horas, maratonar série' },
  { emoji: '😴', label: 'Descanso', hint: 'dia off, spa, dormir até tarde' },
  { emoji: '📚', label: 'Investir em mim', hint: 'curso, livro, equipamento' },
] as const
