import { useState } from 'react'
import { Plus } from 'lucide-react'
import NavBar from '../../components/NavBar'
import BlockFormModal from './BlockFormModal'
import { useAppStore } from '../../store/useAppStore'
import { visibleBlocks } from '../../domain/schedule'
import { hhmmToMin } from '../../domain/dates'
import { GOAL_COLORS, OBLIGATORY_COLOR, type TimeBlock, type Weekday } from '../../domain/types'

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
      </main>

      {editing && (
        <BlockFormModal block={editing === 'new' ? undefined : editing} onClose={() => setEditing(null)} />
      )}
    </div>
  )
}
