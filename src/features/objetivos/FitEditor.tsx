import { Plus, Trash2 } from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'
import { useNow } from '../../store/useClock'
import { visibleBlocks } from '../../domain/schedule'
import { findOverlaps, validateBlockInput } from '../../domain/validate'
import { blockConflictsWork } from '../../domain/work'
import { hhmmToMin, toISODate } from '../../domain/dates'
import type { BlockDraft, Weekday } from '../../domain/types'
import { DAY_LABELS, DAY_ORDER } from '../grade/GradePage'

const inputClass = 'rounded-lg bg-ink-3 px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-flame'

/**
 * Editor de encaixes semanais (usado no assistente e na ativação da fila).
 * Recebe drafts sugeridos pela prioridade e deixa o usuário ajustar tudo.
 */
export default function FitEditor({
  drafts,
  onChange,
}: {
  drafts: BlockDraft[]
  onChange: (drafts: BlockDraft[]) => void
}) {
  const goals = useAppStore((s) => s.goals)
  const blocks = useAppStore((s) => s.blocks)
  const workSchedule = useAppStore((s) => s.workSchedule)
  const today = toISODate(useNow())
  const existing = visibleBlocks({ goals, blocks })

  const update = (i: number, patch: Partial<BlockDraft>) =>
    onChange(drafts.map((d, j) => (j === i ? { ...d, ...patch } : d)))

  const toggleDay = (i: number, day: Weekday) => {
    const ws = drafts[i].weekdays
    update(i, { weekdays: ws.includes(day) ? ws.filter((w) => w !== day) : [...ws, day].sort() })
  }

  return (
    <div className="flex flex-col gap-3">
      {drafts.map((d, i) => {
        const errors = validateBlockInput(d)
        const overlaps = findOverlaps(d, existing)
        const workConflict =
          errors.length === 0
            ? blockConflictsWork(workSchedule, d.weekdays, hhmmToMin(d.start), hhmmToMin(d.end), today)
            : null
        return (
          <div key={i} className="rounded-xl border border-ink-3 bg-ink-2/60 p-3">
            <div className="flex items-center gap-2">
              <input
                className={`${inputClass} flex-1`}
                value={d.title}
                maxLength={60}
                onChange={(e) => update(i, { title: e.target.value })}
                placeholder="Nome do bloco"
              />
              {drafts.length > 1 && (
                <button
                  onClick={() => onChange(drafts.filter((_, j) => j !== i))}
                  className="p-2 text-muted hover:text-red-400"
                  title="Remover horário"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>

            <div className="mt-2 flex gap-1">
              {DAY_ORDER.map((day) => (
                <button
                  key={day}
                  type="button"
                  onClick={() => toggleDay(i, day)}
                  className={`flex-1 rounded-lg py-1.5 text-xs font-semibold transition-colors ${
                    d.weekdays.includes(day) ? 'bg-flame text-ink' : 'bg-ink-3 text-muted hover:text-paper'
                  }`}
                >
                  {DAY_LABELS[day]}
                </button>
              ))}
            </div>

            <div className="mt-2 flex items-center gap-2 text-sm">
              <input
                type="time"
                step={300}
                className={inputClass}
                value={d.start}
                onChange={(e) => update(i, { start: e.target.value })}
              />
              <span className="text-muted">até</span>
              <input
                type="time"
                step={300}
                className={inputClass}
                value={d.end}
                onChange={(e) => update(i, { end: e.target.value })}
              />
            </div>

            {errors.length > 0 && (
              <ul className="mt-2 rounded-lg bg-red-950/50 p-2 text-xs text-red-300">
                {errors.map((e) => (
                  <li key={e}>{e}</li>
                ))}
              </ul>
            )}
            {overlaps.length > 0 && (
              <p className="mt-2 rounded-lg bg-amber-950/40 p-2 text-xs text-amber-300">
                Sobrepõe {overlaps.map((o) => `"${o.title}"`).join(', ')} — pode salvar mesmo assim.
              </p>
            )}
            {workConflict && (
              <p className="mt-2 rounded-lg bg-amber-950/40 p-2 text-xs text-amber-300">
                💼 {workConflict.label} Pode salvar, mas talvez outro horário encaixe melhor.
              </p>
            )}
          </div>
        )
      })}

      <button
        onClick={() =>
          onChange([
            ...drafts,
            { ...drafts[drafts.length - 1], weekdays: [...(drafts[drafts.length - 1]?.weekdays ?? [1])] },
          ])
        }
        className="flex items-center justify-center gap-1.5 rounded-xl border border-dashed border-ink-3 py-2.5 text-sm text-muted hover:text-paper"
      >
        <Plus size={16} /> Outro horário
      </button>
    </div>
  )
}

/** Todos os drafts são válidos? (para habilitar o botão de salvar) */
export function allDraftsValid(drafts: BlockDraft[]): boolean {
  return drafts.length > 0 && drafts.every((d) => validateBlockInput(d).length === 0)
}
