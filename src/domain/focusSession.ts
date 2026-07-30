import type { ID, ISODate } from './types'
import { getCurrentAndNext, type DayActivity } from './schedule'

/**
 * Sessão de foco iniciada manualmente ("quero fazer essa agora"):
 * começa em startedAtMs e dura a duração do bloco. Persistida por aparelho.
 */
export interface ManualFocus {
  date: ISODate
  blockId: ID
  startedAtMs: number
  durationMin: number
}

export function manualEndsAtMs(mf: ManualFocus): number {
  return mf.startedAtMs + mf.durationMin * 60_000
}

/** Ativa = janela [startedAt, startedAt+duração) contém o agora. Sessão "futura" (time travel) é inválida. */
export function isManualActive(mf: ManualFocus | null, now: Date): mf is ManualFocus {
  if (!mf) return false
  const t = now.getTime()
  return t >= mf.startedAtMs && t < manualEndsAtMs(mf)
}

/** Já passou do fim (e chegou a existir hoje)? — dispara o popup de transição. */
export function manualExpired(mf: ManualFocus | null, now: Date, today: ISODate): boolean {
  if (!mf || mf.date !== today) return false
  return now.getTime() >= manualEndsAtMs(mf)
}

export interface FocusResolution {
  current?: DayActivity
  source: 'schedule' | 'manual' | null
  /** fim da sessão manual (para o timer) quando source === 'manual' */
  manualEndsAtMs?: number
  next?: DayActivity
}

/**
 * Resolve o foco atual: a sessão manual ativa vence o derivado do relógio.
 * A sessão só vale se o bloco ainda existe nas atividades DE HOJE (virada de dia /
 * bloco excluído descartam) e ainda não foi concluída.
 */
export function resolveFocus(
  activities: DayActivity[],
  now: Date,
  mf: ManualFocus | null,
): FocusResolution {
  const { current: schedCurrent, next: schedNext } = getCurrentAndNext(activities, now)

  if (isManualActive(mf, now)) {
    const act = activities.find((a) => a.block.id === mf.blockId)
    if (act && act.status !== 'done') {
      const next = schedNext?.block.id === mf.blockId ? undefined : schedNext
      return { current: act, source: 'manual', manualEndsAtMs: manualEndsAtMs(mf), next }
    }
  }

  return {
    current: schedCurrent,
    source: schedCurrent ? 'schedule' : null,
    next: schedNext,
  }
}
