import { useState } from 'react'
import Modal from '../../components/Modal'
import { useAppStore } from '../../store/useAppStore'
import { PRIORITY_PRESETS } from '../../domain/suggest'
import {
  GOAL_COLORS,
  PRIORITY_LABELS,
  type Goal,
  type GoalColor,
  type GoalPriority,
} from '../../domain/types'

const inputClass = 'w-full rounded-lg bg-ink-3 px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-flame'

export default function GoalFormModal({ goal, onClose }: { goal?: Goal; onClose: () => void }) {
  const addGoal = useAppStore((s) => s.addGoal)
  const updateGoal = useAppStore((s) => s.updateGoal)

  const [title, setTitle] = useState(goal?.title ?? '')
  const [emoji, setEmoji] = useState(goal?.emoji ?? '🎯')
  const [color, setColor] = useState<GoalColor>(goal?.color ?? 'amber')
  const [description, setDescription] = useState(goal?.description ?? '')
  const [priority, setPriority] = useState<GoalPriority>(goal?.priority ?? 'media')
  const [estimatedHours, setEstimatedHours] = useState(goal?.estimatedHours ? String(goal.estimatedHours) : '')
  const [tried, setTried] = useState(false)

  const save = () => {
    setTried(true)
    if (!title.trim()) return
    const hours = Number(estimatedHours)
    const input = {
      title: title.trim(),
      emoji: emoji.trim() || '🎯',
      color,
      description: description.trim() || undefined,
      priority,
      estimatedHours: hours > 0 ? hours : undefined,
    }
    if (goal) updateGoal(goal.id, input)
    else addGoal(input)
    onClose()
  }

  return (
    <Modal title={goal ? 'Editar objetivo' : 'Novo objetivo'} onClose={onClose}>
      <div className="flex flex-col gap-3">
        <div className="flex gap-3">
          <label className="flex w-20 flex-col gap-1 text-sm">
            <span className="text-muted">Emoji</span>
            <input
              className={`${inputClass} text-center text-lg`}
              value={emoji}
              onChange={(e) => setEmoji(e.target.value)}
              maxLength={8}
            />
          </label>
          <label className="flex flex-1 flex-col gap-1 text-sm">
            <span className="text-muted">Título</span>
            <input
              className={inputClass}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={60}
              placeholder="Aprender inglês"
              autoFocus
            />
          </label>
        </div>
        {tried && !title.trim() && <p className="text-xs text-red-300">Dê um título ao objetivo.</p>}

        <div className="flex flex-col gap-1 text-sm">
          <span className="text-muted">Cor</span>
          <div className="flex gap-2">
            {(Object.keys(GOAL_COLORS) as GoalColor[]).map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={`size-8 rounded-full transition-transform ${color === c ? 'scale-110 ring-2 ring-paper' : ''}`}
                style={{ backgroundColor: GOAL_COLORS[c] }}
                aria-label={c}
              />
            ))}
          </div>
        </div>

        <label className="flex flex-col gap-1 text-sm">
          <span className="text-muted">Por que esse objetivo importa? (opcional)</span>
          <textarea
            className={`${inputClass} resize-none`}
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={200}
          />
        </label>

        <div className="flex flex-col gap-1 text-sm">
          <span className="text-muted">Prioridade</span>
          <div className="flex gap-2">
            {(['alta', 'media', 'baixa'] as const).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPriority(p)}
                className={`flex-1 rounded-lg border p-2 text-left text-xs ${
                  priority === p ? 'border-flame bg-flame/10 text-flame' : 'border-ink-3 text-muted'
                }`}
                title={PRIORITY_PRESETS[p].label}
              >
                <span className="font-bold">{PRIORITY_LABELS[p]}</span>
              </button>
            ))}
          </div>
        </div>

        <label className="flex flex-col gap-1 text-sm">
          <span className="text-muted">Estimativa de horas para concluir (opcional)</span>
          <input
            type="number"
            min={1}
            className={inputClass}
            value={estimatedHours}
            onChange={(e) => setEstimatedHours(e.target.value)}
            placeholder="ex.: 120"
          />
        </label>

        <button onClick={save} className="mt-1 self-end rounded-xl bg-flame px-5 py-2 text-sm font-bold text-ink">
          Salvar
        </button>
      </div>
    </Modal>
  )
}
