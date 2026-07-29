import type { DayActivity } from './schedule'

/** Separa as atividades do dia: blocos de objetivo (foco) vs Rotina (estilo de vida). */
export function splitRoutine(activities: DayActivity[]): {
  goalActs: DayActivity[]
  routine: DayActivity[]
} {
  return {
    goalActs: activities.filter((a) => a.block.goalId !== null),
    routine: activities.filter((a) => a.block.goalId === null),
  }
}

export interface RoutineSuggestion {
  title: string
  emoji: string
  durationMin: number
}

/** Rotinas comuns para o quick-add — um toque e o formulário vem pré-preenchido. */
export const ROUTINE_SUGGESTIONS: RoutineSuggestion[] = [
  { title: 'Arrumar a cama', emoji: '🛏️', durationMin: 10 },
  { title: 'Tomar banho', emoji: '🚿', durationMin: 20 },
  { title: 'Almoçar', emoji: '🍽️', durationMin: 45 },
  { title: 'Lavar a louça', emoji: '🧽', durationMin: 20 },
  { title: 'Esteira', emoji: '🏃', durationMin: 30 },
  { title: 'Bicicleta ergométrica', emoji: '🚴', durationMin: 30 },
  { title: 'Musculação', emoji: '🏋️', durationMin: 60 },
  { title: 'Dar comida pro peixe', emoji: '🐠', durationMin: 5 },
  { title: 'Tirar o lixo', emoji: '🗑️', durationMin: 10 },
  { title: 'Organizar a mesa do escritório', emoji: '🖥️', durationMin: 15 },
  { title: 'Leitura', emoji: '📖', durationMin: 30 },
  { title: 'Meditação', emoji: '🧘', durationMin: 15 },
  { title: 'Caminhada', emoji: '🚶', durationMin: 30 },
]
