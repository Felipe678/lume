import type { HHMM, ISODate, Weekday } from './types'
import { addDaysISO, hhmmToMin, parseISODate, weekdayOf } from './dates'

/**
 * Rotina de trabalho do usuário — a disponibilidade que o planejamento respeita.
 * `end <= start` significa turno noturno: vira o dia (ex.: plantão 19:00–07:00).
 */
export type WorkSchedule =
  | { mode: 'none' }
  | { mode: 'weekly'; weekdays: Weekday[]; start: HHMM; end: HHMM }
  | {
      mode: 'rotation'
      /** dias seguidos trabalhando (12x36 => 1) */
      daysOn: number
      /** dias seguidos de folga (12x36 => 1) */
      daysOff: number
      /** uma data conhecida de trabalho (primeiro dia ON do ciclo) */
      anchorDate: ISODate
      start: HHMM
      end: HHMM
    }

export const noWork = (): WorkSchedule => ({ mode: 'none' })

/** [startMin, endMin) em minutos do dia. */
export interface WorkSegment {
  startMin: number
  endMin: number
}

const daysBetween = (a: ISODate, b: ISODate): number =>
  Math.round((parseISODate(b).getTime() - parseISODate(a).getTime()) / 86_400_000)

/** O TURNO COMEÇA nesse dia? (turno noturno derrama no dia seguinte, mas "começa" aqui) */
export function isShiftDay(ws: WorkSchedule, date: ISODate): boolean {
  if (ws.mode === 'none') return false
  if (ws.mode === 'weekly') return ws.weekdays.includes(weekdayOf(date))
  const cycle = ws.daysOn + ws.daysOff
  if (cycle <= 0) return false
  // módulo normalizado: funciona com âncora no futuro (diff negativo)
  const pos = ((daysBetween(ws.anchorDate, date) % cycle) + cycle) % cycle
  return pos < ws.daysOn
}

const isOvernight = (ws: Exclude<WorkSchedule, { mode: 'none' }>) =>
  hhmmToMin(ws.end) <= hhmmToMin(ws.start)

/** Segmentos de trabalho que ocupam a data (0 a 2 — plantões noturnos consecutivos). */
export function workSegmentsOn(ws: WorkSchedule, date: ISODate): WorkSegment[] {
  if (ws.mode === 'none') return []
  const start = hhmmToMin(ws.start)
  const end = hhmmToMin(ws.end)
  const segments: WorkSegment[] = []
  if (!isOvernight(ws)) {
    if (isShiftDay(ws, date)) segments.push({ startMin: start, endMin: end })
    return segments
  }
  // noturno: o turno de ONTEM derrama [0, end) hoje; o de HOJE ocupa [start, 24h)
  if (isShiftDay(ws, addDaysISO(date, -1)) && end > 0) segments.push({ startMin: 0, endMin: end })
  if (isShiftDay(ws, date)) segments.push({ startMin: start, endMin: 24 * 60 })
  return segments
}

export function isWorkDay(ws: WorkSchedule, date: ISODate): boolean {
  return workSegmentsOn(ws, date).length > 0
}

export interface WorkConflict {
  /** dias da semana em conflito (modo weekly) */
  weekdays?: Weekday[]
  /** fração de ocorrências em conflito na amostra (modo rotation) */
  ratio?: number
  label: string
}

const overlaps = (aStart: number, aEnd: number, seg: WorkSegment) =>
  aStart < seg.endMin && seg.startMin < aEnd

const DAY_SHORT: Record<Weekday, string> = { 0: 'dom', 1: 'seg', 2: 'ter', 3: 'qua', 4: 'qui', 5: 'sex', 6: 'sáb' }
const ROTATION_SAMPLE_DAYS = 28

/**
 * O bloco (weekdays + horário) conflita com o trabalho?
 * weekly: verificação exata por dia da semana; rotation: amostra os próximos 28 dias.
 */
export function blockConflictsWork(
  ws: WorkSchedule,
  weekdays: Weekday[],
  startMin: number,
  endMin: number,
  refDate: ISODate,
): WorkConflict | null {
  if (ws.mode === 'none' || weekdays.length === 0) return null

  if (ws.mode === 'weekly') {
    // percorre uma semana concreta a partir de refDate para reaproveitar workSegmentsOn (cobre noturno)
    const hit = new Set<Weekday>()
    for (let i = 0; i < 7; i++) {
      const date = addDaysISO(refDate, i)
      const wd = weekdayOf(date)
      if (!weekdays.includes(wd)) continue
      if (workSegmentsOn(ws, date).some((seg) => overlaps(startMin, endMin, seg))) hit.add(wd)
    }
    if (hit.size === 0) return null
    const labels = [...hit].sort().map((w) => DAY_SHORT[w]).join('/')
    return { weekdays: [...hit], label: `Conflita com seu trabalho (${labels}).` }
  }

  // rotation
  let occurrences = 0
  let conflicts = 0
  for (let i = 0; i < ROTATION_SAMPLE_DAYS; i++) {
    const date = addDaysISO(refDate, i)
    if (!weekdays.includes(weekdayOf(date))) continue
    occurrences++
    if (workSegmentsOn(ws, date).some((seg) => overlaps(startMin, endMin, seg))) conflicts++
  }
  if (occurrences === 0 || conflicts === 0) return null
  const ratio = conflicts / occurrences
  return {
    ratio,
    label: `Conflita com sua escala em ~${Math.round(ratio * 100)}% das ocorrências (próximas 4 semanas).`,
  }
}

const clampToDay = (min: number) => Math.max(0, Math.min(min, 23 * 60 + 59))
const minToHHMM = (min: number): HHMM => {
  const m = clampToDay(min)
  return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`
}

/**
 * Horário de início sugerido que desvia do trabalho.
 * Tenta o preferido (19:00); se conflitar, fim do trabalho + 1h; turno noturno → manhã (09:00).
 */
export function suggestedStartAvoidingWork(
  ws: WorkSchedule,
  weekdays: Weekday[],
  durationMin: number,
  refDate: ISODate,
  preferred: HHMM = '19:00',
): HHMM {
  if (ws.mode === 'none') return preferred
  const prefMin = hhmmToMin(preferred)
  const fits = (startMin: number) =>
    blockConflictsWork(ws, weekdays, startMin, startMin + durationMin, refDate) === null &&
    startMin + durationMin <= 24 * 60

  if (fits(prefMin)) return preferred
  if (isOvernight(ws)) {
    // trabalha à noite → sugere manhã
    for (const candidate of [9 * 60, 10 * 60, 14 * 60]) {
      if (fits(candidate)) return minToHHMM(candidate)
    }
    return '09:00'
  }
  const afterWork = hhmmToMin(ws.end) + 60
  if (fits(afterWork)) return minToHHMM(afterWork)
  const beforeWork = hhmmToMin(ws.start) - 60 - durationMin
  if (beforeWork >= 6 * 60 && fits(beforeWork)) return minToHHMM(beforeWork)
  return minToHHMM(afterWork) // melhor esforço; conflito residual vira aviso na UI
}
