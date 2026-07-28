import { useState } from 'react'
import { motion } from 'framer-motion'
import { Check, X } from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'
import { suggestBlocks, PRIORITY_PRESETS } from '../../domain/suggest'
import { PRIORITY_LABELS, type BlockDraft, type Goal } from '../../domain/types'
import FitEditor, { allDraftsValid } from './FitEditor'

/** Ativação de um objetivo da fila: encaixes sugeridos pela prioridade, editáveis. */
export default function ActivateGoalFlow({ goal, onClose }: { goal: Goal; onClose: () => void }) {
  const activateGoal = useAppStore((s) => s.activateGoal)
  const activateGoalWithBlocks = useAppStore((s) => s.activateGoalWithBlocks)
  const [drafts, setDrafts] = useState<BlockDraft[]>(() => suggestBlocks(goal.priority, goal.title))

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex flex-col bg-ink"
    >
      <header className="flex items-center justify-between border-b border-ink-3 px-4 py-3">
        <div>
          <h1 className="text-lg font-bold">
            Ativar {goal.emoji} {goal.title}
          </h1>
          <p className="text-xs text-muted">
            Prioridade {PRIORITY_LABELS[goal.priority]} — sugestão: {PRIORITY_PRESETS[goal.priority].label}
          </p>
        </div>
        <button onClick={onClose} className="p-2 text-muted hover:text-paper" aria-label="Fechar">
          <X size={22} />
        </button>
      </header>

      <main className="mx-auto w-full max-w-lg flex-1 overflow-y-auto p-4">
        <FitEditor drafts={drafts} onChange={setDrafts} />
      </main>

      <footer className="mx-auto flex w-full max-w-lg flex-col items-center gap-2 border-t border-ink-3 p-4">
        <motion.button
          whileTap={{ scale: 0.95 }}
          disabled={!allDraftsValid(drafts)}
          onClick={() => {
            activateGoalWithBlocks(goal.id, drafts)
            onClose()
          }}
          className="flex w-full items-center justify-center gap-1.5 rounded-full bg-flame px-5 py-2.5 text-sm font-bold text-ink disabled:opacity-40"
        >
          <Check size={16} /> Ativar com esses encaixes
        </motion.button>
        <button
          onClick={() => {
            activateGoal(goal.id)
            onClose()
          }}
          className="text-xs text-muted underline hover:text-paper"
        >
          Ativar sem encaixes (adiciono na Grade depois)
        </button>
      </footer>
    </motion.div>
  )
}
