import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, Check, Plus, X } from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'
import { useOverlays } from '../../store/useOverlays'
import { toISODate } from '../../domain/dates'
import { goalStatus } from '../../domain/goals'
import { PRIORITY_PRESETS, suggestBlocks } from '../../domain/suggest'
import {
  GOAL_COLORS,
  PRIORITY_LABELS,
  type BlockDraft,
  type GoalColor,
  type GoalPriority,
} from '../../domain/types'
import FitEditor, { allDraftsValid } from './FitEditor'

const inputClass = 'w-full rounded-lg bg-ink-3 px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-flame'

const STEP_TITLES = ['O quê', 'Por quê', 'Etapas', 'Quando', 'Encaixes', 'Revisão']

/** Assistente de criação de objetivo — a funcionalidade central do Lume. */
export default function GoalWizard() {
  const closeWizard = useOverlays((s) => s.closeWizard)
  const goals = useAppStore((s) => s.goals)
  const workSchedule = useAppStore((s) => s.workSchedule)
  const createGoalWithBlocks = useAppStore((s) => s.createGoalWithBlocks)

  const [step, setStep] = useState(0)
  const [emoji, setEmoji] = useState('🎯')
  const [title, setTitle] = useState('')
  const [color, setColor] = useState<GoalColor>('amber')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<GoalPriority>('media')
  const [estimatedHours, setEstimatedHours] = useState('')
  const [milestones, setMilestones] = useState<string[]>([])
  const [newMilestone, setNewMilestone] = useState('')
  const [whenMode, setWhenMode] = useState<'now' | 'after'>('now')
  const [afterGoalId, setAfterGoalId] = useState('')
  const [drafts, setDrafts] = useState<BlockDraft[]>([])
  const [fitsTouched, setFitsTouched] = useState(false)

  const blockables = goals.filter((g) => ['active', 'queued'].includes(goalStatus(g)))
  const skipFits = whenMode === 'after'
  const lastStep = 5

  const canAdvance = () => {
    if (step === 0) return title.trim().length > 0
    if (step === 3) return whenMode === 'now' || afterGoalId !== ''
    if (step === 4) return allDraftsValid(drafts)
    return true
  }

  const next = () => {
    let target = step + 1
    if (target === 4 && skipFits) target = 5
    if (target === 4 && !fitsTouched) {
      setDrafts(
        suggestBlocks(priority, title.trim() || 'Novo objetivo', {
          workSchedule,
          refDate: toISODate(new Date()),
        }),
      )
    }
    setStep(target)
  }
  const back = () => {
    let target = step - 1
    if (target === 4 && skipFits) target = 3
    setStep(Math.max(0, target))
  }

  const addMilestoneTitle = () => {
    const t = newMilestone.trim()
    if (!t) return
    setMilestones((m) => [...m, t])
    setNewMilestone('')
  }

  const finish = () => {
    const hours = Number(estimatedHours)
    createGoalWithBlocks(
      {
        title: title.trim(),
        emoji: emoji.trim() || '🎯',
        color,
        description: description.trim() || undefined,
        priority,
        estimatedHours: hours > 0 ? hours : undefined,
        afterGoalId: whenMode === 'after' ? afterGoalId : undefined,
        milestoneTitles: milestones,
      },
      whenMode === 'now' ? drafts : [],
    )
    closeWizard()
  }

  const priorityCard = (p: GoalPriority) => (
    <button
      key={p}
      onClick={() => {
        setPriority(p)
        if (!fitsTouched) setDrafts([])
      }}
      className={`flex-1 rounded-xl border p-3 text-left transition-colors ${
        priority === p ? 'border-flame bg-flame/10' : 'border-ink-3 bg-ink-2/60 hover:border-muted'
      }`}
    >
      <div className={`text-sm font-bold ${priority === p ? 'text-flame' : ''}`}>{PRIORITY_LABELS[p]}</div>
      <div className="mt-1 text-xs text-muted">{PRIORITY_PRESETS[p].label}</div>
    </button>
  )

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-ink">
      <header className="flex items-center justify-between border-b border-ink-3 px-4 py-3">
        <div>
          <h1 className="text-lg font-bold">Novo objetivo</h1>
          <div className="mt-1 flex gap-1.5">
            {STEP_TITLES.map((t, i) => (
              <span
                key={t}
                className={`h-1.5 w-8 rounded-full ${
                  i < step ? 'bg-flame/60' : i === step ? 'bg-flame' : 'bg-ink-3'
                } ${i === 4 && skipFits ? 'opacity-30' : ''}`}
                title={t}
              />
            ))}
          </div>
        </div>
        <button onClick={closeWizard} className="p-2 text-muted hover:text-paper" aria-label="Fechar">
          <X size={22} />
        </button>
      </header>

      <main className="mx-auto w-full max-w-lg flex-1 overflow-y-auto p-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.2 }}
          >
            {step === 0 && (
              <div className="flex flex-col gap-4">
                <h2 className="text-xl font-bold">Qual é o objetivo?</h2>
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
                <div className="flex flex-col gap-1 text-sm">
                  <span className="text-muted">Cor</span>
                  <div className="flex gap-2">
                    {(Object.keys(GOAL_COLORS) as GoalColor[]).map((c) => (
                      <button
                        key={c}
                        onClick={() => setColor(c)}
                        className={`size-8 rounded-full transition-transform ${color === c ? 'scale-110 ring-2 ring-paper' : ''}`}
                        style={{ backgroundColor: GOAL_COLORS[c] }}
                        aria-label={c}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="flex flex-col gap-4">
                <h2 className="text-xl font-bold">Por quê — e com que força?</h2>
                <label className="flex flex-col gap-1 text-sm">
                  <span className="text-muted">Por que esse objetivo importa? É o que te segura nos dias difíceis.</span>
                  <textarea
                    className={`${inputClass} resize-none`}
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    maxLength={200}
                    placeholder="Quero viajar sem depender de tradutor..."
                  />
                </label>
                <div className="flex flex-col gap-1 text-sm">
                  <span className="text-muted">Prioridade — define quantos encaixes semanais serão sugeridos</span>
                  <div className="flex gap-2">{(['alta', 'media', 'baixa'] as const).map(priorityCard)}</div>
                </div>
                <label className="flex flex-col gap-1 text-sm">
                  <span className="text-muted">Estimativa de horas para concluir (opcional — habilita a projeção)</span>
                  <input
                    type="number"
                    min={1}
                    className={inputClass}
                    value={estimatedHours}
                    onChange={(e) => setEstimatedHours(e.target.value)}
                    placeholder="ex.: 120"
                  />
                </label>
              </div>
            )}

            {step === 2 && (
              <div className="flex flex-col gap-3">
                <h2 className="text-xl font-bold">Fragmente em etapas</h2>
                <p className="text-sm text-muted">
                  É assim que o "grande demais" vira caminho. O objetivo só é concluído quando todas as
                  etapas forem feitas.
                </p>
                <ul className="flex flex-col gap-1.5">
                  {milestones.map((m, i) => (
                    <li key={`${m}-${i}`} className="flex items-center gap-2 rounded-lg bg-ink-2/60 px-3 py-2 text-sm">
                      <span className="text-muted">{i + 1}.</span>
                      <span className="flex-1">{m}</span>
                      <button
                        onClick={() => setMilestones((ms) => ms.filter((_, j) => j !== i))}
                        className="text-muted hover:text-red-400"
                      >
                        <X size={14} />
                      </button>
                    </li>
                  ))}
                </ul>
                <div className="flex gap-2">
                  <input
                    className={`${inputClass} flex-1`}
                    placeholder="Nova etapa…"
                    value={newMilestone}
                    maxLength={80}
                    onChange={(e) => setNewMilestone(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addMilestoneTitle()}
                  />
                  <button onClick={addMilestoneTitle} className="rounded-lg bg-ink-3 px-3 text-muted hover:text-paper">
                    <Plus size={16} />
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="flex flex-col gap-3">
                <h2 className="text-xl font-bold">Quando começar?</h2>
                <button
                  onClick={() => setWhenMode('now')}
                  className={`rounded-xl border p-3 text-left ${whenMode === 'now' ? 'border-flame bg-flame/10' : 'border-ink-3 bg-ink-2/60'}`}
                >
                  <div className="font-bold">Agora</div>
                  <div className="text-xs text-muted">Entra na grade e no painel imediatamente.</div>
                </button>
                <button
                  onClick={() => setWhenMode('after')}
                  disabled={blockables.length === 0}
                  className={`rounded-xl border p-3 text-left disabled:opacity-40 ${whenMode === 'after' ? 'border-flame bg-flame/10' : 'border-ink-3 bg-ink-2/60'}`}
                >
                  <div className="font-bold">Depois de concluir outro objetivo</div>
                  <div className="text-xs text-muted">
                    Entra na fila — um objetivo de cada vez, do começo ao fim.
                  </div>
                </button>
                {whenMode === 'after' && (
                  <select className={inputClass} value={afterGoalId} onChange={(e) => setAfterGoalId(e.target.value)}>
                    <option value="">Escolha o objetivo bloqueador…</option>
                    {blockables.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.emoji} {g.title}
                        {goalStatus(g) === 'queued' ? ' (na fila)' : ''}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            )}

            {step === 4 && (
              <div className="flex flex-col gap-3">
                <h2 className="text-xl font-bold">Encaixes na semana</h2>
                <p className="text-sm text-muted">
                  Sugestão para prioridade <b className="text-flame">{PRIORITY_LABELS[priority]}</b>:{' '}
                  {PRIORITY_PRESETS[priority].label}. Ajuste como quiser.
                </p>
                <FitEditor
                  drafts={drafts}
                  onChange={(d) => {
                    setDrafts(d)
                    setFitsTouched(true)
                  }}
                />
              </div>
            )}

            {step === 5 && (
              <div className="flex flex-col gap-3">
                <h2 className="text-xl font-bold">Revisão</h2>
                <div className="rounded-xl border-l-4 bg-ink-2/60 p-4" style={{ borderLeftColor: GOAL_COLORS[color] }}>
                  <div className="text-lg font-bold">
                    {emoji} {title}
                  </div>
                  {description && <p className="mt-1 text-sm text-muted">{description}</p>}
                  <p className="mt-2 text-sm">
                    Prioridade <b>{PRIORITY_LABELS[priority]}</b>
                    {Number(estimatedHours) > 0 && <> · estimativa de <b>{estimatedHours}h</b></>}
                    {milestones.length > 0 && <> · {milestones.length} etapa(s)</>}
                  </p>
                  <p className="mt-1 text-sm text-muted">
                    {whenMode === 'after'
                      ? `Na fila — começa após "${blockables.find((g) => g.id === afterGoalId)?.title ?? '?'}".`
                      : drafts.length > 0
                        ? `${drafts.length} encaixe(s) semanais entram na grade agora.`
                        : 'Sem encaixes — adicione depois na Grade.'}
                  </p>
                </div>
                {milestones.length === 0 && (
                  <p className="rounded-lg bg-amber-950/40 p-3 text-xs text-amber-300">
                    Sem etapas o objetivo nunca chega a 100% — dá para adicionar depois, mas fragmentar
                    agora é o que transforma o impossível em caminho.
                  </p>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      <footer className="mx-auto flex w-full max-w-lg items-center justify-between border-t border-ink-3 p-4">
        {step > 0 ? (
          <button onClick={back} className="flex items-center gap-1.5 rounded-full px-4 py-2 text-sm text-muted hover:text-paper">
            <ArrowLeft size={16} /> Voltar
          </button>
        ) : (
          <span />
        )}
        {step < lastStep ? (
          <button
            onClick={next}
            disabled={!canAdvance()}
            className="flex items-center gap-1.5 rounded-full bg-flame px-5 py-2 text-sm font-bold text-ink disabled:opacity-40"
          >
            Avançar <ArrowRight size={16} />
          </button>
        ) : (
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={finish}
            className="flex items-center gap-1.5 rounded-full bg-flame px-5 py-2 text-sm font-bold text-ink"
          >
            <Check size={16} /> Criar objetivo
          </motion.button>
        )}
      </footer>
    </div>
  )
}
