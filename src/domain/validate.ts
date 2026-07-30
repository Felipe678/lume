import type { AppState, TimeBlock, Weekday } from './types'
import { GOAL_COLORS, PRIORITY_LABELS } from './types'
import { hhmmToMin } from './dates'
import { migrateToLatest, type AppStateV1, type AppStateV2 } from './migrate'

export interface BlockInput {
  id?: string
  title: string
  weekdays: Weekday[]
  start: string
  end: string
}

const HHMM_RE = /^([01]\d|2[0-3]):[0-5]\d$/
const ISODATE_RE = /^\d{4}-\d{2}-\d{2}$/

export function validateBlockInput(input: BlockInput): string[] {
  const errors: string[] = []
  if (!input.title.trim()) errors.push('Dê um título ao bloco.')
  if (input.weekdays.length === 0) errors.push('Escolha pelo menos um dia da semana.')
  if (!HHMM_RE.test(input.start) || !HHMM_RE.test(input.end)) {
    errors.push('Horários devem estar no formato HH:MM.')
    return errors
  }
  const start = hhmmToMin(input.start)
  const end = hhmmToMin(input.end)
  if (end <= start) {
    errors.push('O fim deve ser depois do início — blocos não cruzam a meia-noite (crie dois blocos).')
  } else if (end - start < 5) {
    errors.push('Duração mínima de 5 minutos.')
  }
  return errors
}

/** Blocos existentes que dividem dia da semana e se sobrepõem no horário (aviso, não bloqueio). */
export function findOverlaps(candidate: BlockInput, blocks: TimeBlock[]): TimeBlock[] {
  if (!HHMM_RE.test(candidate.start) || !HHMM_RE.test(candidate.end)) return []
  const s = hhmmToMin(candidate.start)
  const e = hhmmToMin(candidate.end)
  return blocks.filter((b) => {
    if (b.id === candidate.id) return false
    if (!b.weekdays.some((w) => candidate.weekdays.includes(w))) return false
    return s < hhmmToMin(b.end) && hhmmToMin(b.start) < e
  })
}

type ValidationResult = { ok: true; state: AppState } | { ok: false; error: string }

const isStr = (v: unknown): v is string => typeof v === 'string'
const isWeekday = (v: unknown): v is Weekday => typeof v === 'number' && Number.isInteger(v) && v >= 0 && v <= 6

/** Valida goals/blocks/checkIns (núcleo comum v1/v2). Retorna mensagem de erro ou null. */
function validateCore(d: Record<string, unknown>, requirePriority: boolean): string | null {
  if (!Array.isArray(d.goals) || !Array.isArray(d.blocks)) {
    return 'Estrutura inválida: esperado "goals" e "blocks" como listas.'
  }
  if (typeof d.checkIns !== 'object' || d.checkIns === null || Array.isArray(d.checkIns)) {
    return 'Estrutura inválida: esperado "checkIns" como objeto.'
  }

  const goalIds = new Set<string>()
  for (const g of d.goals as unknown[]) {
    const goal = g as Record<string, unknown>
    if (!isStr(goal.id) || !isStr(goal.title) || !isStr(goal.emoji) || !Array.isArray(goal.milestones)) {
      return 'Objetivo com estrutura inválida no arquivo.'
    }
    if (!isStr(goal.color) || !(goal.color in GOAL_COLORS)) {
      return `Objetivo "${goal.title}" com cor desconhecida.`
    }
    if (requirePriority && (!isStr(goal.priority) || !(goal.priority in PRIORITY_LABELS))) {
      return `Objetivo "${goal.title}" com prioridade inválida.`
    }
    if (goal.estimatedHours !== undefined && (typeof goal.estimatedHours !== 'number' || goal.estimatedHours <= 0)) {
      return `Objetivo "${goal.title}" com estimativa de horas inválida.`
    }
    if (goal.afterGoalId !== undefined && !isStr(goal.afterGoalId)) {
      return `Objetivo "${goal.title}" com fila inválida.`
    }
    // afterGoalId órfão é ACEITO — o domínio trata como "liberado"
    for (const m of goal.milestones as unknown[]) {
      const ms = m as Record<string, unknown>
      if (!isStr(ms.id) || !isStr(ms.title) || typeof ms.done !== 'boolean') {
        return `Etapa inválida no objetivo "${goal.title}".`
      }
    }
    goalIds.add(goal.id)
  }

  for (const b of d.blocks as unknown[]) {
    const block = b as Record<string, unknown>
    if (!isStr(block.id) || !isStr(block.title)) return 'Bloco com estrutura inválida no arquivo.'
    if (block.goalId !== null && !isStr(block.goalId)) {
      return `Bloco "${block.title}" com vínculo de objetivo inválido.`
    }
    if (isStr(block.goalId) && !goalIds.has(block.goalId)) {
      return `Bloco "${block.title}" aponta para um objetivo que não existe no arquivo.`
    }
    if (!isStr(block.start) || !isStr(block.end) || !HHMM_RE.test(block.start) || !HHMM_RE.test(block.end)) {
      return `Bloco "${block.title}" com horários inválidos.`
    }
    if (!Array.isArray(block.weekdays) || !block.weekdays.every(isWeekday)) {
      return `Bloco "${block.title}" com dias da semana inválidos.`
    }
  }

  for (const [key, c] of Object.entries(d.checkIns as Record<string, unknown>)) {
    const ci = c as Record<string, unknown>
    if (!isStr(ci.date) || !ISODATE_RE.test(ci.date) || !isStr(ci.blockId)) {
      return `Check-in inválido no arquivo (chave "${key}").`
    }
  }
  return null
}

const REWARD_KINDS = new Set(['goal', 'streak', 'hours', 'perfectWeek'])

function validateRewardsAndProfile(d: Record<string, unknown>): string | null {
  if (!Array.isArray(d.rewards)) return 'Estrutura inválida: esperado "rewards" como lista.'
  for (const r of d.rewards as unknown[]) {
    const reward = r as Record<string, unknown>
    if (!isStr(reward.id) || !isStr(reward.title) || !isStr(reward.emoji) || !isStr(reward.category)) {
      return 'Premiação com estrutura inválida no arquivo.'
    }
    const t = reward.trigger as Record<string, unknown> | undefined
    if (!t || !isStr(t.kind) || !REWARD_KINDS.has(t.kind)) {
      return `Premiação "${reward.title}" com gatilho inválido.`
    }
    if (t.kind === 'goal' && !isStr(t.goalId)) return `Premiação "${reward.title}" sem objetivo do gatilho.`
    if (t.kind === 'streak' && (typeof t.days !== 'number' || t.days <= 0)) {
      return `Premiação "${reward.title}" com dias de sequência inválidos.`
    }
    if (t.kind === 'hours' && (typeof t.hours !== 'number' || t.hours <= 0)) {
      return `Premiação "${reward.title}" com horas inválidas.`
    }
  }
  const p = d.profile as Record<string, unknown> | undefined
  if (!p || !isStr(p.name) || !isStr(p.avatarEmoji)) {
    return 'Estrutura inválida: esperado "profile" com nome e emoji.'
  }
  return null
}

const WORK_MODES = new Set(['none', 'weekly', 'rotation'])

/** Valida uma rotina de trabalho. Retorna mensagem de erro ou null. */
export function validateWorkSchedule(v: unknown): string | null {
  if (typeof v !== 'object' || v === null) return 'Rotina de trabalho inválida.'
  const w = v as Record<string, unknown>
  if (!isStr(w.mode) || !WORK_MODES.has(w.mode)) return 'Modo de trabalho desconhecido.'
  if (w.mode === 'none') return null
  if (!isStr(w.start) || !isStr(w.end) || !HHMM_RE.test(w.start) || !HHMM_RE.test(w.end)) {
    return 'Horários de trabalho inválidos.'
  }
  if (w.start === w.end) return 'Início e fim do trabalho não podem ser iguais.'
  if (w.mode === 'weekly') {
    if (!Array.isArray(w.weekdays) || w.weekdays.length === 0 || !w.weekdays.every(isWeekday)) {
      return 'Escolha pelo menos um dia de trabalho.'
    }
    return null
  }
  // rotation
  if (typeof w.daysOn !== 'number' || !Number.isInteger(w.daysOn) || w.daysOn < 1) return 'Dias de trabalho da escala inválidos.'
  if (typeof w.daysOff !== 'number' || !Number.isInteger(w.daysOff) || w.daysOff < 1) return 'Dias de folga da escala inválidos.'
  if (!isStr(w.anchorDate) || !ISODATE_RE.test(w.anchorDate)) return 'Data de referência da escala inválida.'
  return null
}

/**
 * Valida um JSON importado antes de substituir o estado — import inválido nunca sobrescreve nada.
 * Aceita backups v1/v2 (migrados na hora) e v3; retorna sempre estado v3.
 */
export function validateAppState(data: unknown): ValidationResult {
  if (typeof data !== 'object' || data === null || Array.isArray(data)) {
    return { ok: false, error: 'O arquivo não contém um objeto JSON válido.' }
  }
  const d = data as Record<string, unknown>

  if (d.schemaVersion === 1) {
    const coreError = validateCore(d, false)
    if (coreError) return { ok: false, error: coreError }
    return { ok: true, state: migrateToLatest(d as unknown as AppStateV1, 1) }
  }

  if (d.schemaVersion === 2) {
    const error = validateCore(d, true) ?? validateRewardsAndProfile(d)
    if (error) return { ok: false, error }
    return { ok: true, state: migrateToLatest(d as unknown as AppStateV2, 2) }
  }

  if (d.schemaVersion === 3) {
    const error =
      validateCore(d, true) ?? validateRewardsAndProfile(d) ?? validateWorkSchedule(d.workSchedule)
    if (error) return { ok: false, error }
    return { ok: true, state: d as unknown as AppState }
  }

  return {
    ok: false,
    error: `Versão de dados desconhecida (${String(d.schemaVersion)}). Este app entende as versões 1, 2 e 3 — o arquivo pode ser de uma versão mais nova do Lume.`,
  }
}
