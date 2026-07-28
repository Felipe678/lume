import { useMemo, useRef, useState } from 'react'
import { BarChart3, Download, Gift, Pencil, PieChart, Plus, Sparkles, Trash2, Upload } from 'lucide-react'
import NavBar from '../../components/NavBar'
import Modal from '../../components/Modal'
import ConfirmDialog from '../../components/ConfirmDialog'
import { selectAppState, storageAvailable, useAppStore, type RewardInput } from '../../store/useAppStore'
import { useUiPrefs } from '../../store/useUiPrefs'
import { REWARD_CATEGORIES } from '../../domain/achievements'
import { validateAppState } from '../../domain/validate'
import { toISODate } from '../../domain/dates'
import { goalStatus } from '../../domain/goals'
import type { Reward, RewardTrigger } from '../../domain/types'
import { describeTrigger } from '../conquistas/ConquistasPage'

const inputClass = 'w-full rounded-lg bg-ink-3 px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-flame'

export default function ConfigPage() {
  const store = useAppStore()
  const deleteReward = useAppStore((s) => s.deleteReward)
  const chartStyle = useUiPrefs((s) => s.chartStyle)
  const setChartStyle = useUiPrefs((s) => s.setChartStyle)
  const startScreen = useUiPrefs((s) => s.startScreen)
  const setStartScreen = useUiPrefs((s) => s.setStartScreen)

  const state = useMemo(
    () => selectAppState(store),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [store.goals, store.blocks, store.checkIns, store.rewards, store.profile],
  )
  const [editingReward, setEditingReward] = useState<Reward | 'new' | null>(null)
  const [deletingReward, setDeletingReward] = useState<Reward | null>(null)

  return (
    <div className="min-h-dvh">
      <NavBar />
      <main className="mx-auto max-w-3xl p-4">
        <h1 className="mb-4 text-xl font-bold">Configurações</h1>

        {/* Premiações */}
        <section className="mb-6 rounded-2xl border border-ink-3 bg-ink-2/40 p-4">
          <div className="mb-1 flex items-center justify-between">
            <h2 className="flex items-center gap-1.5 text-sm font-semibold tracking-widest text-muted uppercase">
              <Gift size={14} /> Premiações
            </h2>
            <button
              onClick={() => setEditingReward('new')}
              className="flex items-center gap-1 rounded-full bg-flame px-3 py-1.5 text-xs font-bold text-ink"
            >
              <Plus size={14} /> Nova
            </button>
          </div>
          <p className="mb-3 text-xs text-muted">
            Prometa a si algo bom por concluir o que importa: um perfume, uma viagem, X horas de jogo. O
            prêmio destrava sozinho quando o gatilho for atingido.
          </p>
          {state.rewards.length === 0 ? (
            <p className="rounded-lg bg-ink-2/60 p-4 text-center text-sm text-muted">
              Nenhuma premiação definida ainda.
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {state.rewards.map((r) => (
                <div key={r.id} className="flex items-center gap-3 rounded-xl bg-ink-2/60 p-3">
                  <span className="text-xl">{r.emoji}</span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold">
                      {r.title}
                      {r.redeemedAt && <span className="ml-2 text-xs text-muted">(resgatado)</span>}
                      {r.unlockedAt && !r.redeemedAt && (
                        <span className="ml-2 text-xs font-bold text-flame">destravado!</span>
                      )}
                    </div>
                    <div className="text-xs text-muted">
                      {r.category} · {describeTrigger(r.trigger, state)}
                    </div>
                  </div>
                  <button onClick={() => setEditingReward(r)} className="p-1.5 text-muted hover:text-paper" title="Editar">
                    <Pencil size={14} />
                  </button>
                  <button onClick={() => setDeletingReward(r)} className="p-1.5 text-muted hover:text-red-400" title="Excluir">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Aparência */}
        <section className="mb-6 rounded-2xl border border-ink-3 bg-ink-2/40 p-4">
          <h2 className="mb-3 text-sm font-semibold tracking-widest text-muted uppercase">Aparência</h2>
          <div className="flex items-center justify-between text-sm">
            <span>Gráficos de progresso</span>
            <div className="flex gap-1 rounded-full bg-ink-3 p-1">
              <button
                onClick={() => setChartStyle('bar')}
                className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${
                  chartStyle === 'bar' ? 'bg-flame text-ink' : 'text-muted'
                }`}
              >
                <BarChart3 size={12} /> Barras
              </button>
              <button
                onClick={() => setChartStyle('donut')}
                className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${
                  chartStyle === 'donut' ? 'bg-flame text-ink' : 'text-muted'
                }`}
              >
                <PieChart size={12} /> Pizza
              </button>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-sm">
            <span>Tela inicial deste aparelho</span>
            <div className="flex gap-1 rounded-full bg-ink-3 p-1">
              <button
                onClick={() => setStartScreen('home')}
                className={`rounded-full px-3 py-1 text-xs font-semibold ${startScreen === 'home' ? 'bg-flame text-ink' : 'text-muted'}`}
              >
                Home
              </button>
              <button
                onClick={() => setStartScreen('foco')}
                className={`rounded-full px-3 py-1 text-xs font-semibold ${startScreen === 'foco' ? 'bg-flame text-ink' : 'text-muted'}`}
              >
                Foco (tablet na parede)
              </button>
            </div>
          </div>
        </section>

        <DataSection />
      </main>

      {editingReward && (
        <RewardFormModal
          reward={editingReward === 'new' ? undefined : editingReward}
          onClose={() => setEditingReward(null)}
        />
      )}
      {deletingReward && (
        <ConfirmDialog
          title={`Excluir premiação "${deletingReward.title}"?`}
          message={
            deletingReward.unlockedAt
              ? 'Este prêmio já foi destravado — excluir apaga também esse registro.'
              : 'A premiação some da lista e das Conquistas.'
          }
          actions={[
            {
              label: 'Excluir',
              variant: 'danger',
              onClick: () => {
                deleteReward(deletingReward.id)
                setDeletingReward(null)
              },
            },
          ]}
          onClose={() => setDeletingReward(null)}
        />
      )}
    </div>
  )
}

function RewardFormModal({ reward, onClose }: { reward?: Reward; onClose: () => void }) {
  const goals = useAppStore((s) => s.goals)
  const addReward = useAppStore((s) => s.addReward)
  const updateReward = useAppStore((s) => s.updateReward)

  const [title, setTitle] = useState(reward?.title ?? '')
  const [emoji, setEmoji] = useState(reward?.emoji ?? '🎁')
  const [category, setCategory] = useState(reward?.category ?? 'Material')
  const [kind, setKind] = useState<RewardTrigger['kind']>(reward?.trigger.kind ?? 'goal')
  const [goalId, setGoalId] = useState(
    reward?.trigger.kind === 'goal' || (reward?.trigger.kind === 'hours' && reward.trigger.goalId)
      ? ((reward.trigger as { goalId?: string }).goalId ?? '')
      : '',
  )
  const [days, setDays] = useState(reward?.trigger.kind === 'streak' ? String(reward.trigger.days) : '7')
  const [hours, setHours] = useState(reward?.trigger.kind === 'hours' ? String(reward.trigger.hours) : '10')
  const [tried, setTried] = useState(false)

  const selectableGoals = goals.filter((g) => goalStatus(g) !== 'archived')

  const buildTrigger = (): RewardTrigger | null => {
    if (kind === 'goal') return goalId ? { kind: 'goal', goalId } : null
    if (kind === 'streak') return Number(days) > 0 ? { kind: 'streak', days: Number(days) } : null
    if (kind === 'hours')
      return Number(hours) > 0 ? { kind: 'hours', hours: Number(hours), goalId: goalId || undefined } : null
    return { kind: 'perfectWeek' }
  }

  const save = () => {
    setTried(true)
    const trigger = buildTrigger()
    if (!title.trim() || !trigger) return
    const input: RewardInput = { title: title.trim(), emoji: emoji.trim() || '🎁', category, trigger }
    if (reward) updateReward(reward.id, input)
    else addReward(input)
    onClose()
  }

  return (
    <Modal title={reward ? 'Editar premiação' : 'Nova premiação'} onClose={onClose}>
      <div className="flex flex-col gap-3">
        <div className="flex gap-3">
          <label className="flex w-20 flex-col gap-1 text-sm">
            <span className="text-muted">Emoji</span>
            <input className={`${inputClass} text-center text-lg`} value={emoji} onChange={(e) => setEmoji(e.target.value)} maxLength={8} />
          </label>
          <label className="flex flex-1 flex-col gap-1 text-sm">
            <span className="text-muted">O prêmio</span>
            <input
              className={inputClass}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={80}
              placeholder="Comprar o perfume X"
              autoFocus
            />
          </label>
        </div>
        {tried && !title.trim() && <p className="text-xs text-red-300">Descreva o prêmio.</p>}

        <div className="flex flex-col gap-1 text-sm">
          <span className="text-muted">Categoria</span>
          <div className="flex flex-wrap gap-1.5">
            {REWARD_CATEGORIES.map((c) => (
              <button
                key={c.label}
                onClick={() => setCategory(c.label)}
                className={`rounded-full px-3 py-1 text-xs ${
                  category === c.label ? 'bg-flame text-ink font-bold' : 'bg-ink-3 text-muted'
                }`}
                title={c.hint}
              >
                {c.emoji} {c.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-1 text-sm">
          <span className="text-muted">Destrava quando…</span>
          <select className={inputClass} value={kind} onChange={(e) => setKind(e.target.value as RewardTrigger['kind'])}>
            <option value="goal">…concluir um objetivo</option>
            <option value="streak">…atingir uma sequência de dias</option>
            <option value="hours">…acumular horas investidas</option>
            <option value="perfectWeek">…fechar uma semana perfeita (100%)</option>
          </select>
        </div>

        {kind === 'goal' && (
          <select className={inputClass} value={goalId} onChange={(e) => setGoalId(e.target.value)}>
            <option value="">Escolha o objetivo…</option>
            {selectableGoals.map((g) => (
              <option key={g.id} value={g.id}>
                {g.emoji} {g.title}
              </option>
            ))}
          </select>
        )}
        {kind === 'streak' && (
          <label className="flex items-center gap-2 text-sm">
            <input type="number" min={1} className={`${inputClass} w-24`} value={days} onChange={(e) => setDays(e.target.value)} />
            <span className="text-muted">dias de sequência (marcos bons: 7, 21, 66, 100)</span>
          </label>
        )}
        {kind === 'hours' && (
          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-2 text-sm">
              <input type="number" min={1} className={`${inputClass} w-24`} value={hours} onChange={(e) => setHours(e.target.value)} />
              <span className="text-muted">horas acumuladas</span>
            </label>
            <select className={inputClass} value={goalId} onChange={(e) => setGoalId(e.target.value)}>
              <option value="">Em qualquer objetivo (total)</option>
              {selectableGoals.map((g) => (
                <option key={g.id} value={g.id}>
                  só em {g.emoji} {g.title}
                </option>
              ))}
            </select>
          </div>
        )}
        {tried && !buildTrigger() && <p className="text-xs text-red-300">Complete o gatilho.</p>}

        <button onClick={save} className="mt-1 self-end rounded-xl bg-flame px-5 py-2 text-sm font-bold text-ink">
          Salvar
        </button>
      </div>
    </Modal>
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
    <section className="rounded-2xl border border-ink-3 bg-ink-2/40 p-4">
      <h2 className="text-sm font-semibold tracking-widest text-muted uppercase">Dados</h2>
      {!storageAvailable && (
        <p className="mt-2 rounded-lg bg-red-950/60 p-3 text-xs text-red-300">
          Seus dados não estão sendo salvos — armazenamento do navegador indisponível (modo privado?).
          Exporte um backup antes de fechar.
        </p>
      )}
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
          message="Objetivos, grade, check-ins, premiações e perfil serão apagados deste navegador. Exporte um backup antes se tiver dúvida."
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
