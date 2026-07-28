import type { AppState, TimeBlock, Weekday } from './types'
import { GOAL_COLORS } from './types'
import { hhmmToMin } from './dates'

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

/** Valida um JSON importado antes de substituir o estado — import inválido nunca sobrescreve nada. */
export function validateAppState(data: unknown): ValidationResult {
  if (typeof data !== 'object' || data === null || Array.isArray(data)) {
    return { ok: false, error: 'O arquivo não contém um objeto JSON válido.' }
  }
  const d = data as Record<string, unknown>
  if (d.schemaVersion !== 1) {
    return {
      ok: false,
      error: `Versão de dados desconhecida (${String(d.schemaVersion)}). Este app entende a versão 1 — o arquivo pode ser de uma versão mais nova do Lume.`,
    }
  }
  if (!Array.isArray(d.goals) || !Array.isArray(d.blocks)) {
    return { ok: false, error: 'Estrutura inválida: esperado "goals" e "blocks" como listas.' }
  }
  if (typeof d.checkIns !== 'object' || d.checkIns === null || Array.isArray(d.checkIns)) {
    return { ok: false, error: 'Estrutura inválida: esperado "checkIns" como objeto.' }
  }

  const goalIds = new Set<string>()
  for (const g of d.goals as unknown[]) {
    const goal = g as Record<string, unknown>
    if (!isStr(goal.id) || !isStr(goal.title) || !isStr(goal.emoji) || !Array.isArray(goal.milestones)) {
      return { ok: false, error: 'Objetivo com estrutura inválida no arquivo.' }
    }
    if (!isStr(goal.color) || !(goal.color in GOAL_COLORS)) {
      return { ok: false, error: `Objetivo "${goal.title}" com cor desconhecida.` }
    }
    for (const m of goal.milestones as unknown[]) {
      const ms = m as Record<string, unknown>
      if (!isStr(ms.id) || !isStr(ms.title) || typeof ms.done !== 'boolean') {
        return { ok: false, error: `Etapa inválida no objetivo "${goal.title}".` }
      }
    }
    goalIds.add(goal.id)
  }

  const blockIds = new Set<string>()
  for (const b of d.blocks as unknown[]) {
    const block = b as Record<string, unknown>
    if (!isStr(block.id) || !isStr(block.title)) {
      return { ok: false, error: 'Bloco com estrutura inválida no arquivo.' }
    }
    if (block.goalId !== null && !isStr(block.goalId)) {
      return { ok: false, error: `Bloco "${block.title}" com vínculo de objetivo inválido.` }
    }
    if (isStr(block.goalId) && !goalIds.has(block.goalId)) {
      return { ok: false, error: `Bloco "${block.title}" aponta para um objetivo que não existe no arquivo.` }
    }
    if (!isStr(block.start) || !isStr(block.end) || !HHMM_RE.test(block.start) || !HHMM_RE.test(block.end)) {
      return { ok: false, error: `Bloco "${block.title}" com horários inválidos.` }
    }
    if (!Array.isArray(block.weekdays) || !block.weekdays.every(isWeekday)) {
      return { ok: false, error: `Bloco "${block.title}" com dias da semana inválidos.` }
    }
    blockIds.add(block.id)
  }

  for (const [key, c] of Object.entries(d.checkIns as Record<string, unknown>)) {
    const ci = c as Record<string, unknown>
    if (!isStr(ci.date) || !ISODATE_RE.test(ci.date) || !isStr(ci.blockId)) {
      return { ok: false, error: `Check-in inválido no arquivo (chave "${key}").` }
    }
  }

  return { ok: true, state: d as unknown as AppState }
}
