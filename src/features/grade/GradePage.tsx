import { useState } from 'react'
import { ListChecks, Plus } from 'lucide-react'
import NavBar from '../../components/NavBar'
import BlockFormModal, { type BlockPreset } from './BlockFormModal'
import { useAppStore } from '../../store/useAppStore'
import { visibleBlocks } from '../../domain/schedule'
import { hhmmToMin } from '../../domain/dates'
import { ROUTINE_SUGGESTIONS } from '../../domain/routine'
import { GOAL_COLORS, OBLIGATORY_COLOR, type TimeBlock, type Weekday } from '../../domain/types'

const minToHHMM = (min: number) =>
  `${String(Math.floor(min / 60)).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}`

export const DAY_ORDER: Weekday[] = [1, 2, 3, 4, 5, 6, 0]
export const DAY_LABELS: Record<Weekday, string> = {
  0: 'Dom',
  1: 'Seg',
  2: 'Ter',
  3: 'Qua',
  4: 'Qui',
  5: 'Sex',
  6: 'Sáb',
}

export default function GradePage() {
  const goals = useAppStore((s) => s.goals)
  const blocks = useAppStore((s) => s.blocks)
  const [editing, setEditing] = useState<TimeBlock | 'new' | null>(null)
  const [routinePreset, setRoutinePreset] = useState<BlockPreset | null>(null)

  const visible = visibleBlocks({ goals, blocks })
  const goalsById = new Map(goals.map((g) => [g.id, g]))

  return (
    <div className="min-h-dvh">
      <NavBar />
      <main className="mx-auto max-w-6xl p-4">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Grade semanal</h1>
            <p className="text-sm text-muted">
              Defina uma vez, siga todo dia — como o horário da escola.
            </p>
          </div>
          <button
            onClick={() => setEditing('new')}
            className="flex items-center gap-1.5 rounded-full bg-flame px-4 py-2 text-sm font-semibold text-ink"
          >
            <Plus size={16} /> Novo bloco
          </button>
        </div>

        <div className="overflow-x-auto">
          <div className="grid min-w-[840px] grid-cols-7 gap-2">
            {DAY_ORDER.map((day) => {
              const dayBlocks = visible
                .filter((b) => b.weekdays.includes(day))
                .sort((a, b) => hhmmToMin(a.start) - hhmmToMin(b.start) || a.id.localeCompare(b.id))
              return (
                <div key={day} className="rounded-xl bg-ink-2/50 p-2">
                  <div className="mb-2 text-center text-xs font-semibold tracking-widest text-muted uppercase">
                    {DAY_LABELS[day]}
                  </div>
                  <div className="flex flex-col gap-1.5">
                    {dayBlocks.map((b) => {
                      const goal = b.goalId ? goalsById.get(b.goalId) : null
                      const color = goal ? GOAL_COLORS[goal.color] : OBLIGATORY_COLOR
                      return (
                        <button
                          key={b.id}
                          onClick={() => setEditing(b)}
                          className="rounded-lg border-l-4 bg-ink-2 p-2 text-left hover:bg-ink-3"
                          style={{ borderLeftColor: color }}
                        >
                          <div className="text-[11px] text-muted tabular-nums">
                            {b.start}–{b.end}
                          </div>
                          <div className="truncate text-xs font-medium">
                            {goal ? `${goal.emoji} ` : ''}
                            {b.title}
                          </div>
                        </button>
                      )
                    })}
                    {dayBlocks.length === 0 && (
                      <div className="py-4 text-center text-xs text-muted/40">livre</div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
        <section className="mt-6">
          <h2 className="mb-1 flex items-center gap-1.5 text-sm font-semibold tracking-widest text-muted uppercase">
            <ListChecks size={14} /> Rotinas do dia a dia
          </h2>
          <p className="mb-2 text-xs text-muted">
            Tarefas que são estilo de vida — um toque e ela entra na sua grade.
          </p>
          <div className="flex flex-wrap gap-1.5">
            {ROUTINE_SUGGESTIONS.map((r) => (
              <button
                key={r.title}
                onClick={() =>
                  setRoutinePreset({
                    title: r.title,
                    weekdays: [0, 1, 2, 3, 4, 5, 6],
                    start: '20:00',
                    end: minToHHMM(20 * 60 + r.durationMin),
                    goalId: null,
                  })
                }
                className="rounded-full bg-ink-2 px-3 py-1.5 text-xs text-muted ring-1 ring-ink-3 hover:text-paper"
              >
                {r.emoji} {r.title}
              </button>
            ))}
          </div>
        </section>
      </main>

      {editing && (
        <BlockFormModal block={editing === 'new' ? undefined : editing} onClose={() => setEditing(null)} />
      )}
      {routinePreset && <BlockFormModal preset={routinePreset} onClose={() => setRoutinePreset(null)} />}
    </div>
  )
}
