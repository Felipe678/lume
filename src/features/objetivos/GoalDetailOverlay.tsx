import { useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { CalendarPlus, X } from 'lucide-react'
import { Link } from 'react-router'
import { selectAppState, useAppStore } from '../../store/useAppStore'
import { useNow } from '../../store/useClock'
import { useOverlays } from '../../store/useOverlays'
import { useUiPrefs } from '../../store/useUiPrefs'
import { computeGoalStats } from '../../domain/stats'
import { formatHours } from '../../domain/dates'
import { GOAL_COLORS, PRIORITY_COLORS, PRIORITY_LABELS } from '../../domain/types'
import type { Ratio } from '../../domain/progress'
import DonutChart from '../../components/DonutChart'
import ProgressBar from '../../components/ProgressBar'

function PeriodMeter({ label, ratio, color }: { label: string; ratio: Ratio; color: string }) {
  const chartStyle = useUiPrefs((s) => s.chartStyle)
  const fraction = ratio.total === 0 ? 0 : ratio.done / ratio.total
  return (
    <div className="flex flex-1 flex-col items-center gap-2 rounded-2xl border border-ink-3 bg-ink-2/60 p-4">
      <span className="text-xs font-semibold tracking-widest text-muted uppercase">{label}</span>
      {chartStyle === 'donut' ? (
        <DonutChart fraction={fraction} color={color} size={80} thickness={8}>
          <span className="text-sm font-bold tabular-nums">
            {ratio.done}/{ratio.total}
          </span>
        </DonutChart>
      ) : (
        <div className="flex w-full flex-col items-center gap-1.5">
          <span className="text-xl font-bold tabular-nums">
            {ratio.done}/{ratio.total}
          </span>
          <ProgressBar fraction={fraction} color={color} className="w-full" />
        </div>
      )}
      <span className="text-xs text-muted tabular-nums">
        {ratio.total === 0 ? 'nada agendado' : `${Math.round(fraction * 100)}%`}
      </span>
    </div>
  )
}

/** Overlay de detalhe do progresso — abre por cima de qualquer tela, o relógio segue rodando. */
export default function GoalDetailOverlay({ goalId }: { goalId: string }) {
  const closeDetail = useOverlays((s) => s.closeDetail)
  const chartStyle = useUiPrefs((s) => s.chartStyle)
  const now = useNow()
  const store = useAppStore()
  const state = useMemo(
    () => selectAppState(store),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [store.goals, store.blocks, store.checkIns, store.rewards, store.profile],
  )
  const goal = state.goals.find((g) => g.id === goalId)
  const stats = useMemo(() => computeGoalStats(state, goalId, now), [state, goalId, now])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && closeDetail()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [closeDetail])

  // objetivo sumiu (arquivado em outra aba, import...) — fecha em silêncio
  if (!goal || goal.archivedAt) {
    closeDetail()
    return null
  }

  const color = GOAL_COLORS[goal.color]
  const milestoneFraction = stats.milestones.total === 0 ? 0 : stats.milestones.done / stats.milestones.total

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="fixed inset-0 z-50 overflow-y-auto bg-ink"
    >
      <div className="mx-auto max-w-3xl p-5">
        <header className="mb-5 flex items-start justify-between">
          <div className="min-w-0">
            <h1 className="truncate text-2xl font-extrabold">
              {goal.emoji} {goal.title}
            </h1>
            <div className="mt-1 flex items-center gap-2 text-sm">
              <span
                className="rounded-full px-2 py-0.5 text-xs font-bold text-ink"
                style={{ backgroundColor: PRIORITY_COLORS[goal.priority] }}
              >
                {PRIORITY_LABELS[goal.priority]}
              </span>
              {goal.description && <span className="truncate text-muted">{goal.description}</span>}
            </div>
          </div>
          <button onClick={closeDetail} className="p-2 text-muted hover:text-paper" aria-label="Fechar">
            <X size={24} />
          </button>
        </header>

        {/* Status geral do objetivo */}
        <section className="mb-4 rounded-2xl border border-ink-3 bg-ink-2/60 p-5">
          <div className="mb-3 flex items-baseline justify-between">
            <h2 className="text-sm font-semibold tracking-widest text-muted uppercase">Status geral</h2>
            <span className="text-sm text-muted tabular-nums">
              {stats.milestones.done}/{stats.milestones.total} etapas
            </span>
          </div>
          {stats.milestones.total === 0 ? (
            <p className="text-sm text-muted">
              Sem etapas ainda — fragmente o objetivo para enxergar o progresso.
            </p>
          ) : chartStyle === 'donut' ? (
            <div className="flex items-center justify-center py-2">
              <DonutChart fraction={milestoneFraction} color={color} size={160} thickness={14}>
                <span className="text-3xl font-extrabold tabular-nums">
                  {Math.round(milestoneFraction * 100)}%
                </span>
              </DonutChart>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <div className="h-5 flex-1 overflow-hidden rounded-full bg-ink-3">
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: color }}
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.round(milestoneFraction * 100)}%` }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                />
              </div>
              <span className="text-2xl font-extrabold tabular-nums" style={{ color }}>
                {Math.round(milestoneFraction * 100)}%
              </span>
            </div>
          )}
        </section>

        {/* Atividade por período */}
        <section className="mb-4 flex gap-3">
          <PeriodMeter label="Hoje" ratio={stats.daily} color={color} />
          <PeriodMeter label="Semana" ratio={stats.weekly} color={color} />
          <PeriodMeter label="Mês" ratio={stats.monthly} color={color} />
        </section>

        {/* Horas e projeção */}
        <section className="rounded-2xl border border-ink-3 bg-ink-2/60 p-5">
          <h2 className="mb-3 text-sm font-semibold tracking-widest text-muted uppercase">Tempo</h2>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold tabular-nums" style={{ color }}>
              {formatHours(stats.investedMin)}
            </span>
            <span className="text-muted">
              investidas{stats.estimatedMin !== null && <> · de {formatHours(stats.estimatedMin)} estimadas</>}
            </span>
          </div>

          {stats.estimatedMin !== null && (
            <ProgressBar
              fraction={stats.estimatedMin === 0 ? 0 : stats.investedMin / stats.estimatedMin}
              color={color}
              className="mt-3"
            />
          )}

          <div className="mt-4 text-sm">
            {stats.estimatedMin === null ? (
              <p className="text-muted">
                Defina uma <b>estimativa de horas</b> no objetivo para ver quanto falta e a projeção de
                conclusão.
              </p>
            ) : stats.remainingMin === 0 ? (
              <p className="text-muted">
                Estimativa atingida 🎉 — ajuste as horas ou conclua as etapas restantes.
              </p>
            ) : stats.paceMinPerWeek === 0 ? (
              <p className="flex items-center gap-2 text-amber-300">
                <CalendarPlus size={16} />
                Faltam {formatHours(stats.remainingMin!)} — mas este objetivo não tem horários na grade.{' '}
                <Link to="/grade" onClick={closeDetail} className="underline">
                  Adicionar encaixes
                </Link>
              </p>
            ) : (
              <p>
                Faltam <b style={{ color }}>{formatHours(stats.remainingMin!)}</b>. No ritmo atual da grade (
                {formatHours(stats.paceMinPerWeek)}/semana), ~
                <b style={{ color }}>
                  {stats.projectedWeeks} {stats.projectedWeeks === 1 ? 'semana' : 'semanas'}
                </b>{' '}
                para concluir.
              </p>
            )}
          </div>
        </section>
      </div>
    </motion.div>
  )
}
