import { useMemo, useState } from 'react'
import { Trash2 } from 'lucide-react'
import Modal from '../../components/Modal'
import ConfirmDialog from '../../components/ConfirmDialog'
import { useAppStore } from '../../store/useAppStore'
import { findOverlaps, validateBlockInput } from '../../domain/validate'
import { visibleBlocks } from '../../domain/schedule'
import type { TimeBlock, Weekday } from '../../domain/types'
import { DAY_LABELS, DAY_ORDER } from './GradePage'

const inputClass = 'w-full rounded-lg bg-ink-3 px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-flame'

export interface BlockPreset {
  title: string
  weekdays: Weekday[]
  start: string
  end: string
  goalId?: string | null
}

export default function BlockFormModal({
  block,
  preset,
  onClose,
}: {
  block?: TimeBlock
  /** valores iniciais para criação (quick-add de rotina) */
  preset?: BlockPreset
  onClose: () => void
}) {
  const goals = useAppStore((s) => s.goals)
  const blocks = useAppStore((s) => s.blocks)
  const checkIns = useAppStore((s) => s.checkIns)
  const addBlock = useAppStore((s) => s.addBlock)
  const updateBlock = useAppStore((s) => s.updateBlock)
  const deleteBlock = useAppStore((s) => s.deleteBlock)

  const [title, setTitle] = useState(block?.title ?? preset?.title ?? '')
  const [goalId, setGoalId] = useState<string>(block?.goalId ?? preset?.goalId ?? '')
  const [weekdays, setWeekdays] = useState<Weekday[]>(block?.weekdays ?? preset?.weekdays ?? [])
  const [start, setStart] = useState(block?.start ?? preset?.start ?? '08:00')
  const [end, setEnd] = useState(block?.end ?? preset?.end ?? '09:00')
  const [tried, setTried] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const activeGoals = goals.filter((g) => !g.archivedAt)
  const input = { id: block?.id, title, weekdays, start, end }
  const errors = validateBlockInput(input)
  const overlaps = useMemo(
    () => findOverlaps(input, visibleBlocks({ goals, blocks })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [title, weekdays, start, end, goals, blocks],
  )
  const historyCount = block
    ? Object.values(checkIns).filter((c) => c.blockId === block.id).length
    : 0

  const toggleDay = (d: Weekday) =>
    setWeekdays((ws) => (ws.includes(d) ? ws.filter((w) => w !== d) : [...ws, d].sort()))

  const save = () => {
    setTried(true)
    if (errors.length > 0) return
    const draft = { title: title.trim(), goalId: goalId || null, weekdays, start, end }
    if (block) updateBlock(block.id, draft)
    else addBlock(draft)
    onClose()
  }

  return (
    <>
      <Modal title={block ? 'Editar bloco' : 'Novo bloco'} onClose={onClose}>
        <div className="flex flex-col gap-3">
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-muted">Título</span>
            <input
              className={inputClass}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={60}
              placeholder="Aula de inglês"
              autoFocus
            />
          </label>

          <label className="flex flex-col gap-1 text-sm">
            <span className="text-muted">Vínculo</span>
            <select className={inputClass} value={goalId} onChange={(e) => setGoalId(e.target.value)}>
              <option value="">Rotina (dia a dia, sem objetivo)</option>
              {activeGoals.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.emoji} {g.title}
                </option>
              ))}
            </select>
          </label>

          <div className="flex flex-col gap-1 text-sm">
            <span className="text-muted">Dias da semana</span>
            <div className="flex gap-1">
              {DAY_ORDER.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => toggleDay(d)}
                  className={`flex-1 rounded-lg py-1.5 text-xs font-semibold transition-colors ${
                    weekdays.includes(d) ? 'bg-flame text-ink' : 'bg-ink-3 text-muted hover:text-paper'
                  }`}
                >
                  {DAY_LABELS[d]}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <label className="flex flex-1 flex-col gap-1 text-sm">
              <span className="text-muted">Início</span>
              <input type="time" step={300} className={inputClass} value={start} onChange={(e) => setStart(e.target.value)} />
            </label>
            <label className="flex flex-1 flex-col gap-1 text-sm">
              <span className="text-muted">Fim</span>
              <input type="time" step={300} className={inputClass} value={end} onChange={(e) => setEnd(e.target.value)} />
            </label>
          </div>

          {tried && errors.length > 0 && (
            <ul className="rounded-lg bg-red-950/50 p-3 text-xs text-red-300">
              {errors.map((e) => (
                <li key={e}>{e}</li>
              ))}
            </ul>
          )}

          {overlaps.length > 0 && (
            <div className="rounded-lg bg-amber-950/40 p-3 text-xs text-amber-300">
              Atenção: sobrepõe {overlaps.map((o) => `"${o.title}"`).join(', ')}. O Painel mostra uma
              atividade por vez — pode salvar mesmo assim.
            </div>
          )}

          <div className="mt-1 flex items-center justify-between">
            {block ? (
              <button
                onClick={() => setConfirmDelete(true)}
                className="flex items-center gap-1.5 text-sm text-red-400 hover:text-red-300"
              >
                <Trash2 size={16} /> Excluir
              </button>
            ) : (
              <span />
            )}
            <button onClick={save} className="rounded-xl bg-flame px-5 py-2 text-sm font-bold text-ink">
              Salvar
            </button>
          </div>
        </div>
      </Modal>

      {confirmDelete && block && (
        <ConfirmDialog
          title="Excluir bloco?"
          message={
            historyCount > 0
              ? `"${block.title}" tem ${historyCount} check-in(s) no histórico. Eles serão mantidos (sua sequência não muda), mas perdem o contexto deste bloco.`
              : `"${block.title}" sai da grade. Essa ação não tem desfazer.`
          }
          actions={[
            {
              label: 'Excluir bloco',
              variant: 'danger',
              onClick: () => {
                deleteBlock(block.id)
                setConfirmDelete(false)
                onClose()
              },
            },
          ]}
          onClose={() => setConfirmDelete(false)}
        />
      )}
    </>
  )
}
