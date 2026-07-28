import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import NavBar from '../../components/NavBar'
import ProgressBar from '../../components/ProgressBar'
import { selectAppState, useAppStore } from '../../store/useAppStore'
import { useNow } from '../../store/useClock'
import { useOverlays } from '../../store/useOverlays'
import { monthHeatmap, periodProgress } from '../../domain/stats'
import { goalStatus } from '../../domain/goals'
import { parseISODate, toISODate, weekdayOf } from '../../domain/dates'
import { GOAL_COLORS } from '../../domain/types'

const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]

function shiftMonth(month: string, delta: number): string {
  const [y, m] = month.split('-').map(Number)
  const d = new Date(y, m - 1 + delta, 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

export default function MesPage() {
  const now = useNow()
  const today = toISODate(now)
  const [month, setMonth] = useState(today.slice(0, 7))
  const store = useAppStore()
  const openDetail = useOverlays((s) => s.openDetail)
  const state = useMemo(
    () => selectAppState(store),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [store.goals, store.blocks, store.checkIns, store.rewards, store.profile],
  )

  const heat = useMemo(() => monthHeatmap(state, month), [state, month])
  const [y, m] = month.split('-').map(Number)
  // grade começa na segunda: quantas células vazias antes do dia 1
  const firstWeekday = weekdayOf(`${month}-01`)
  const lead = firstWeekday === 0 ? 6 : firstWeekday - 1

  const elapsed = heat.filter((d) => d.date <= today)
  const done = elapsed.reduce((s, d) => s + d.done, 0)
  const total = elapsed.reduce((s, d) => s + d.total, 0)

  const goalsWithMonth = state.goals
    .filter((g) => ['active', 'completed'].includes(goalStatus(g)))
    .map((g) => ({
      g,
      ratio: periodProgress(
        state,
        `${month}-01` < g.createdAt ? g.createdAt : `${month}-01`,
        heat[heat.length - 1].date < today ? heat[heat.length - 1].date : today,
        g.id,
      ),
    }))
    .filter(({ ratio }) => ratio.total > 0)

  const cellClass = (d: { date: string; done: number; total: number }) => {
    if (d.total === 0) return 'bg-ink-2/40 text-muted/30'
    const f = d.done / d.total
    if (f === 0) return d.date < today ? 'bg-ink-3 text-muted' : 'bg-ink-2 text-muted'
    if (f < 1) return 'bg-flame/40 text-ink font-semibold'
    return 'bg-flame text-ink font-bold'
  }

  return (
    <div className="min-h-dvh">
      <NavBar />
      <main className="mx-auto max-w-3xl p-4">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-xl font-bold">Plano mensal</h1>
          <div className="flex items-center gap-2">
            <button onClick={() => setMonth((mo) => shiftMonth(mo, -1))} className="rounded-lg p-1.5 text-muted hover:text-paper">
              <ChevronLeft size={18} />
            </button>
            <span className="w-36 text-center text-sm font-semibold">
              {MONTH_NAMES[m - 1]} {y}
            </span>
            <button onClick={() => setMonth((mo) => shiftMonth(mo, 1))} className="rounded-lg p-1.5 text-muted hover:text-paper">
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        <div className="mb-1 grid grid-cols-7 gap-1.5 text-center text-[10px] font-semibold tracking-widest text-muted uppercase">
          {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'].map((d) => (
            <span key={d}>{d}</span>
          ))}
        </div>
        <motion.div
          key={month}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-7 gap-1.5"
        >
          {Array.from({ length: lead }).map((_, i) => (
            <span key={`lead-${i}`} />
          ))}
          {heat.map((d) => (
            <div
              key={d.date}
              className={`flex aspect-square flex-col items-center justify-center rounded-lg text-sm tabular-nums ${cellClass(d)} ${
                d.date === today ? 'ring-2 ring-paper' : ''
              }`}
              title={d.total === 0 ? `${d.date} — livre` : `${d.date} — ${d.done}/${d.total} concluídas`}
            >
              {parseISODate(d.date).getDate()}
              {d.total > 0 && <span className="text-[9px] opacity-80">{d.done}/{d.total}</span>}
            </div>
          ))}
        </motion.div>

        <p className="mt-3 text-sm text-muted">
          {total === 0
            ? 'Nada agendado neste mês (pela grade atual).'
            : `${done} de ${total} atividades concluídas até hoje (${Math.round((done / total) * 100)}%).`}
        </p>

        {goalsWithMonth.length > 0 && (
          <section className="mt-6">
            <h2 className="mb-2 text-sm font-semibold tracking-widest text-muted uppercase">
              Objetivos no mês
            </h2>
            <div className="flex flex-col gap-2">
              {goalsWithMonth.map(({ g, ratio }) => (
                <button
                  key={g.id}
                  onClick={() => openDetail(g.id)}
                  className="flex items-center gap-3 rounded-xl bg-ink-2/60 p-3 text-left"
                >
                  <span className="w-40 truncate text-sm font-semibold">
                    {g.emoji} {g.title}
                  </span>
                  <ProgressBar
                    fraction={ratio.total === 0 ? 0 : ratio.done / ratio.total}
                    color={GOAL_COLORS[g.color]}
                    className="flex-1"
                  />
                  <span className="w-12 text-right text-xs text-muted tabular-nums">
                    {ratio.done}/{ratio.total}
                  </span>
                </button>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  )
}
