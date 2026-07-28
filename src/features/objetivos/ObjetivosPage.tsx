import { useRef, useState } from 'react'
import { Archive, Download, Pencil, Plus, Sparkles, Trash2, Upload, X } from 'lucide-react'
import NavBar from '../../components/NavBar'
import ProgressBar from '../../components/ProgressBar'
import ConfirmDialog, { type ConfirmAction } from '../../components/ConfirmDialog'
import GoalFormModal from './GoalFormModal'
import { selectAppState, storageAvailable, useAppStore } from '../../store/useAppStore'
import { goalTotalProgress } from '../../domain/progress'
import { validateAppState } from '../../domain/validate'
import { toISODate } from '../../domain/dates'
import { GOAL_COLORS, type Goal } from '../../domain/types'

export default function ObjetivosPage() {
  const goals = useAppStore((s) => s.goals)
  const [editing, setEditing] = useState<Goal | 'new' | null>(null)
  const [archiving, setArchiving] = useState<Goal | null>(null)

  const active = goals.filter((g) => !g.archivedAt)
  const archivedCount = goals.length - active.length

  return (
    <div className="min-h-dvh">
      <NavBar />
      <main className="mx-auto max-w-3xl p-4">
        {!storageAvailable && (
          <div className="mb-4 rounded-xl bg-red-950/60 p-3 text-sm text-red-300">
            Seus dados não estão sendo salvos — o armazenamento do navegador está indisponível
            (modo privado?). Exporte um backup antes de fechar.
          </div>
        )}

        <div className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Objetivos</h1>
            <p className="text-sm text-muted">
              Fragmente o "grande demais" em etapas — e dilua nas suas semanas.
            </p>
          </div>
          <button
            onClick={() => setEditing('new')}
            className="flex items-center gap-1.5 rounded-full bg-flame px-4 py-2 text-sm font-semibold text-ink"
          >
            <Plus size={16} /> Novo objetivo
          </button>
        </div>

        <div className="flex flex-col gap-3">
          {active.map((g) => (
            <GoalCard key={g.id} goal={g} onEdit={() => setEditing(g)} onArchive={() => setArchiving(g)} />
          ))}
          {active.length === 0 && (
            <div className="rounded-xl bg-ink-2/60 p-8 text-center text-sm text-muted">
              Nenhum objetivo ainda. Crie o primeiro — e depois dê a ele horários na Grade.
            </div>
          )}
        </div>

        {archivedCount > 0 && (
          <p className="mt-3 text-xs text-muted">
            {archivedCount} objetivo(s) arquivado(s) — fora da grade e do painel.
          </p>
        )}

        <DataSection />
      </main>

      {editing && (
        <GoalFormModal goal={editing === 'new' ? undefined : editing} onClose={() => setEditing(null)} />
      )}
      {archiving && <ArchiveDialog goal={archiving} onClose={() => setArchiving(null)} />}
    </div>
  )
}

function GoalCard({ goal, onEdit, onArchive }: { goal: Goal; onEdit: () => void; onArchive: () => void }) {
  const toggleMilestone = useAppStore((s) => s.toggleMilestone)
  const removeMilestone = useAppStore((s) => s.removeMilestone)
  const addMilestone = useAppStore((s) => s.addMilestone)
  const [newMilestone, setNewMilestone] = useState('')

  const color = GOAL_COLORS[goal.color]
  const total = goalTotalProgress(goal)
  const complete = total === 1

  const submitMilestone = () => {
    const t = newMilestone.trim()
    if (!t) return
    addMilestone(goal.id, t)
    setNewMilestone('')
  }

  return (
    <div className="rounded-2xl border-l-4 bg-ink-2/60 p-4" style={{ borderLeftColor: color }}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h2 className="truncate text-lg font-bold">
            {goal.emoji} {goal.title}
            {complete && (
              <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-flame/15 px-2 py-0.5 text-xs font-semibold text-flame">
                <Sparkles size={12} /> Concluído!
              </span>
            )}
          </h2>
          {goal.description && <p className="mt-0.5 text-sm text-muted">{goal.description}</p>}
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

      <div className="mt-3 flex items-center gap-3">
        <ProgressBar fraction={total ?? 0} color={color} className="flex-1" />
        <span className="text-sm font-semibold tabular-nums" style={{ color }}>
          {total === null ? '—' : `${Math.round(total * 100)}%`}
        </span>
      </div>
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
    </div>
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

function DataSection() {
  const goals = useAppStore((s) => s.goals)
  const blocks = useAppStore((s) => s.blocks)
  const replaceState = useAppStore((s) => s.replaceState)
  const clearAll = useAppStore((s) => s.clearAll)
  const seedDemo = useAppStore((s) => s.seedDemo)
  const fileRef = useRef<HTMLInputElement>(null)
  const [importError, setImportError] = useState<string | null>(null)
  const [confirmClear, setConfirmClear] = useState(false)
  const isEmpty = goals.length === 0 && blocks.length === 0

  const exportJson = () => {
    const data = JSON.stringify(selectAppState(useAppStore.getState()), null, 2)
    const url = URL.createObjectURL(new Blob([data], { type: 'application/json' }))
    const a = document.createElement('a')
    a.href = url
    a.download = `lume-backup-${toISODate(new Date())}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const importJson = async (file: File) => {
    setImportError(null)
    try {
      const result = validateAppState(JSON.parse(await file.text()))
      if (!result.ok) {
        setImportError(result.error)
        return
      }
      replaceState(result.state)
    } catch {
      setImportError('Não consegui ler o arquivo — não parece um JSON válido.')
    }
  }

  const btn = 'flex items-center gap-1.5 rounded-lg bg-ink-3 px-3 py-2 text-xs text-muted hover:text-paper'
  return (
    <section className="mt-8 rounded-2xl bg-ink-2/40 p-4">
      <h2 className="text-sm font-semibold text-muted">Dados</h2>
      <p className="mt-1 text-xs text-muted/70">
        Tudo fica salvo neste navegador. Exporte um backup de vez em quando — seus check-ins são sagrados.
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button onClick={exportJson} className={btn}>
          <Download size={14} /> Exportar backup
        </button>
        <button onClick={() => fileRef.current?.click()} className={btn}>
          <Upload size={14} /> Importar backup
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0]
            if (f) void importJson(f)
            e.target.value = ''
          }}
        />
        {isEmpty && (
          <button onClick={seedDemo} className={btn}>
            <Sparkles size={14} /> Carregar exemplo
          </button>
        )}
        {!isEmpty && (
          <button onClick={() => setConfirmClear(true)} className={`${btn} hover:text-red-400`}>
            <Trash2 size={14} /> Limpar tudo
          </button>
        )}
      </div>
      {importError && (
        <p className="mt-2 rounded-lg bg-red-950/50 p-2 text-xs text-red-300">
          Import recusado: {importError} Nada foi alterado.
        </p>
      )}

      {confirmClear && (
        <ConfirmDialog
          title="Limpar tudo?"
          message="Objetivos, grade e TODOS os check-ins serão apagados deste navegador. Exporte um backup antes se tiver dúvida."
          actions={[
            {
              label: 'Apagar tudo',
              variant: 'danger',
              onClick: () => {
                clearAll()
                setConfirmClear(false)
              },
            },
          ]}
          onClose={() => setConfirmClear(false)}
        />
      )}
    </section>
  )
}
