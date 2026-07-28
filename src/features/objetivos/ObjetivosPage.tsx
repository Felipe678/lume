import { useState } from 'react'
import { motion } from 'framer-motion'
import { Archive, Clock, Pencil, Play, Plus, Sparkles, X } from 'lucide-react'
import NavBar from '../../components/NavBar'
import ProgressBar from '../../components/ProgressBar'
import ConfirmDialog, { type ConfirmAction } from '../../components/ConfirmDialog'
import GoalFormModal from './GoalFormModal'
import ActivateGoalFlow from './ActivateGoalFlow'
import { useAppStore } from '../../store/useAppStore'
import { useOverlays } from '../../store/useOverlays'
import { goalTotalProgress } from '../../domain/progress'
import { investedMinutes } from '../../domain/stats'
import { goalStatus } from '../../domain/goals'
import { formatHours } from '../../domain/dates'
import { GOAL_COLORS, PRIORITY_COLORS, PRIORITY_LABELS, type Goal } from '../../domain/types'

export default function ObjetivosPage() {
  const goals = useAppStore((s) => s.goals)
  const openWizard = useOverlays((s) => s.openWizard)
  const [editing, setEditing] = useState<Goal | null>(null)
  const [archiving, setArchiving] = useState<Goal | null>(null)
  const [activating, setActivating] = useState<Goal | null>(null)

  const active = goals.filter((g) => ['active', 'completed'].includes(goalStatus(g)))
  const queued = goals.filter((g) => goalStatus(g) === 'queued')
  const archivedCount = goals.filter((g) => goalStatus(g) === 'archived').length

  return (
    <div className="min-h-dvh">
      <NavBar />
      <main className="mx-auto max-w-3xl p-4">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Objetivos</h1>
            <p className="text-sm text-muted">
              O quê, por quê e com que prioridade — o resto a semana resolve.
            </p>
          </div>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={openWizard}
            className="flex items-center gap-1.5 rounded-full bg-flame px-4 py-2 text-sm font-semibold text-ink"
          >
            <Plus size={16} /> Novo objetivo
          </motion.button>
        </div>

        <div className="flex flex-col gap-3">
          {active.map((g) => (
            <GoalCard key={g.id} goal={g} onEdit={() => setEditing(g)} onArchive={() => setArchiving(g)} />
          ))}
          {active.length === 0 && queued.length === 0 && (
            <button
              onClick={openWizard}
              className="rounded-xl border border-dashed border-ink-3 bg-ink-2/40 p-8 text-center text-sm text-muted hover:text-paper"
            >
              Nenhum objetivo ainda. Este é o coração do Lume — crie o primeiro.
            </button>
          )}
        </div>

        {queued.length > 0 && (
          <section className="mt-6">
            <h2 className="mb-2 flex items-center gap-1.5 text-sm font-semibold tracking-widest text-muted uppercase">
              <Clock size={14} /> Na fila
            </h2>
            <div className="flex flex-col gap-2">
              {queued.map((g) => {
                const blocker = goals.find((b) => b.id === g.afterGoalId)
                return (
                  <div
                    key={g.id}
                    className="flex items-center gap-3 rounded-xl border border-ink-3 bg-ink-2/40 p-3"
                  >
                    <span className="text-xl">{g.emoji}</span>
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-semibold">{g.title}</div>
                      <div className="text-xs text-muted">
                        começa após {blocker ? `${blocker.emoji} ${blocker.title}` : 'objetivo removido — liberado'}
                      </div>
                    </div>
                    <button
                      onClick={() => setActivating(g)}
                      className="flex shrink-0 items-center gap-1 rounded-full bg-ink-3 px-3 py-1.5 text-xs font-semibold text-muted hover:text-flame"
                      title="Furar a fila e ativar agora"
                    >
                      <Play size={12} /> Ativar agora
                    </button>
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {archivedCount > 0 && (
          <p className="mt-4 text-xs text-muted">
            {archivedCount} objetivo(s) arquivado(s) — fora da grade e do painel.
          </p>
        )}
      </main>

      {editing && <GoalFormModal goal={editing} onClose={() => setEditing(null)} />}
      {archiving && <ArchiveDialog goal={archiving} onClose={() => setArchiving(null)} />}
      {activating && <ActivateGoalFlow goal={activating} onClose={() => setActivating(null)} />}
    </div>
  )
}

function GoalCard({ goal, onEdit, onArchive }: { goal: Goal; onEdit: () => void; onArchive: () => void }) {
  const toggleMilestone = useAppStore((s) => s.toggleMilestone)
  const removeMilestone = useAppStore((s) => s.removeMilestone)
  const addMilestone = useAppStore((s) => s.addMilestone)
  const openDetail = useOverlays((s) => s.openDetail)
  const store = useAppStore()
  const [newMilestone, setNewMilestone] = useState('')

  const color = GOAL_COLORS[goal.color]
  const total = goalTotalProgress(goal)
  const complete = total === 1
  const invested = investedMinutes(
    { schemaVersion: 2, goals: store.goals, blocks: store.blocks, checkIns: store.checkIns, rewards: store.rewards, profile: store.profile },
    goal.id,
  )

  const submitMilestone = () => {
    const t = newMilestone.trim()
    if (!t) return
    addMilestone(goal.id, t)
    setNewMilestone('')
  }

  return (
    <motion.div
      layout
      className="rounded-2xl border-l-4 bg-ink-2/60 p-4"
      style={{ borderLeftColor: color }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h2 className="truncate text-lg font-bold">
            {goal.emoji} {goal.title}
            <span
              className="ml-2 rounded-full px-2 py-0.5 align-middle text-[10px] font-bold text-ink"
              style={{ backgroundColor: PRIORITY_COLORS[goal.priority] }}
            >
              {PRIORITY_LABELS[goal.priority]}
            </span>
            {complete && (
              <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-flame/15 px-2 py-0.5 text-xs font-semibold text-flame">
                <Sparkles size={12} /> Concluído!
              </span>
            )}
          </h2>
          {goal.description && <p className="mt-0.5 text-sm text-muted">{goal.description}</p>}
          <p className="mt-1 text-xs text-muted tabular-nums">
            ⏱ {formatHours(invested)} investidas
            {goal.estimatedHours && <> · de {goal.estimatedHours}h estimadas</>}
          </p>
        </div>
        <div className="flex shrink-0 gap-1">
          <button onClick={onEdit} className="rounded-lg p-2 text-muted hover:text-paper" title="Editar">
            <Pencil size={16} />
          </button>
          <button onClick={onArchive} className="rounded-lg p-2 text-muted hover:text-paper" title="Arquivar">
            <Archive size={16} />
          </button>
        </div>
      </div>

      <button onClick={() => openDetail(goal.id)} className="mt-3 flex w-full items-center gap-3" title="Ver progresso detalhado">
        <ProgressBar fraction={total ?? 0} color={color} className="flex-1" />
        <span className="text-sm font-semibold tabular-nums" style={{ color }}>
          {total === null ? '—' : `${Math.round(total * 100)}%`}
        </span>
      </button>
      {total === null && (
        <p className="mt-1 text-xs text-muted">
          Fragmente em etapas para enxergar o progresso — é assim que o impossível vira caminho.
        </p>
      )}
      {complete && (
        <p className="mt-1 text-xs text-muted">
          Objetivo batido do começo ao fim. Que tal arquivar e abrir espaço para o próximo?
        </p>
      )}

      <ul className="mt-3 flex flex-col gap-1.5">
        {goal.milestones.map((m) => (
          <li key={m.id} className="group flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={m.done}
              onChange={() => toggleMilestone(goal.id, m.id)}
              className="size-4 accent-current"
              style={{ color }}
            />
            <span className={m.done ? 'text-muted line-through' : ''}>{m.title}</span>
            <button
              onClick={() => removeMilestone(goal.id, m.id)}
              className="ml-auto hidden text-muted group-hover:block hover:text-red-400"
              title="Remover etapa"
            >
              <X size={14} />
            </button>
          </li>
        ))}
      </ul>
      <div className="mt-2 flex gap-2">
        <input
          className="flex-1 rounded-lg bg-ink-3 px-3 py-1.5 text-sm outline-none focus:ring-1 focus:ring-flame"
          placeholder="Nova etapa…"
          value={newMilestone}
          maxLength={80}
          onChange={(e) => setNewMilestone(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && submitMilestone()}
        />
        <button onClick={submitMilestone} className="rounded-lg bg-ink-3 px-3 text-sm text-muted hover:text-paper">
          <Plus size={16} />
        </button>
      </div>
    </motion.div>
  )
}

function ArchiveDialog({ goal, onClose }: { goal: Goal; onClose: () => void }) {
  const blocks = useAppStore((s) => s.blocks)
  const archiveGoal = useAppStore((s) => s.archiveGoal)
  const linked = blocks.filter((b) => b.goalId === goal.id)

  const actions: ConfirmAction[] =
    linked.length === 0
      ? [
          {
            label: 'Arquivar objetivo',
            variant: 'primary',
            onClick: () => {
              archiveGoal(goal.id, 'archive')
              onClose()
            },
          },
        ]
      : [
          {
            label: `Arquivar junto os ${linked.length} bloco(s) da grade`,
            variant: 'primary',
            onClick: () => {
              archiveGoal(goal.id, 'archive')
              onClose()
            },
          },
          {
            label: 'Manter blocos como "Obrigatória"',
            variant: 'neutral',
            onClick: () => {
              archiveGoal(goal.id, 'convert')
              onClose()
            },
          },
        ]

  return (
    <ConfirmDialog
      title={`Arquivar "${goal.title}"?`}
      message={
        linked.length === 0
          ? 'O objetivo sai da lista e do painel. O histórico de check-ins é preservado.'
          : `Este objetivo tem ${linked.length} bloco(s) na grade. O que fazer com eles? O histórico de check-ins é preservado em qualquer opção.`
      }
      actions={actions}
      onClose={onClose}
    />
  )
}
