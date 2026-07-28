import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Gift, Lock, Medal, Trophy } from 'lucide-react'
import NavBar from '../../components/NavBar'
import { selectAppState, useAppStore } from '../../store/useAppStore'
import { useNow } from '../../store/useClock'
import { BADGES } from '../../domain/achievements'
import { investedMinutes } from '../../domain/stats'
import { formatHours, parseISODate } from '../../domain/dates'
import { GOAL_COLORS, type AppState, type Reward, type RewardTrigger } from '../../domain/types'

const fmtDate = (iso: string) => parseISODate(iso).toLocaleDateString('pt-BR')

export function describeTrigger(trigger: RewardTrigger, state: Pick<AppState, 'goals'>): string {
  switch (trigger.kind) {
    case 'goal': {
      const g = state.goals.find((x) => x.id === trigger.goalId)
      return g ? `ao concluir ${g.emoji} ${g.title}` : 'objetivo removido — edite nas Configurações'
    }
    case 'streak':
      return `ao atingir ${trigger.days} dias de sequência`
    case 'hours': {
      const g = trigger.goalId ? state.goals.find((x) => x.id === trigger.goalId) : null
      return `ao acumular ${trigger.hours}h${g ? ` em ${g.emoji} ${g.title}` : ' no total'}`
    }
    case 'perfectWeek':
      return 'ao fechar uma semana perfeita (100%)'
  }
}

const grid = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } }
const item = {
  hidden: { opacity: 0, scale: 0.8 },
  show: { opacity: 1, scale: 1, transition: { type: 'spring' as const, stiffness: 260, damping: 20 } },
}

export default function ConquistasPage() {
  const now = useNow()
  const store = useAppStore()
  const redeemReward = useAppStore((s) => s.redeemReward)
  const state = useMemo(
    () => selectAppState(store),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [store.goals, store.blocks, store.checkIns, store.rewards, store.profile],
  )

  const completed = state.goals
    .filter((g) => g.completedAt)
    .sort((a, b) => b.completedAt!.localeCompare(a.completedAt!))
  const toRedeem = state.rewards.filter((r) => r.unlockedAt && !r.redeemedAt)
  const redeemed = state.rewards
    .filter((r) => r.redeemedAt)
    .sort((a, b) => b.redeemedAt!.localeCompare(a.redeemedAt!))
  const lockedRewards = state.rewards.filter((r) => !r.unlockedAt)

  return (
    <div className="min-h-dvh">
      <NavBar />
      <main className="mx-auto max-w-3xl p-4">
        <h1 className="mb-1 text-xl font-bold">Conquistas</h1>
        <p className="mb-5 text-sm text-muted">
          Cada objetivo terminado do começo ao fim vira um troféu — e destrava o que você prometeu a si.
        </p>

        {/* Prêmios para resgatar — o mais importante vem primeiro */}
        {toRedeem.length > 0 && (
          <section className="mb-6">
            <h2 className="mb-2 flex items-center gap-1.5 text-sm font-semibold tracking-widest text-flame uppercase">
              <Gift size={14} /> Prêmios para resgatar
            </h2>
            <motion.div variants={grid} initial="hidden" animate="show" className="flex flex-col gap-2">
              {toRedeem.map((r) => (
                <RewardRow key={r.id} reward={r} state={state} onRedeem={() => redeemReward(r.id)} />
              ))}
            </motion.div>
          </section>
        )}

        {/* Objetivos concluídos */}
        <section className="mb-6">
          <h2 className="mb-2 flex items-center gap-1.5 text-sm font-semibold tracking-widest text-muted uppercase">
            <Trophy size={14} /> Objetivos concluídos
          </h2>
          {completed.length === 0 ? (
            <p className="rounded-xl bg-ink-2/40 p-5 text-center text-sm text-muted">
              Nenhum ainda — o primeiro troféu desta galeria vai marcar a virada.
            </p>
          ) : (
            <motion.div variants={grid} initial="hidden" animate="show" className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {completed.map((g) => (
                <motion.div
                  key={g.id}
                  variants={item}
                  className="flex flex-col items-center gap-1 rounded-2xl border border-flame/30 bg-ink-2/60 p-4 text-center"
                  style={{ boxShadow: `0 0 24px ${GOAL_COLORS[g.color]}22` }}
                >
                  <span className="text-4xl">{g.emoji}</span>
                  <span className="font-bold">{g.title}</span>
                  <span className="text-xs text-muted">concluído em {fmtDate(g.completedAt!)}</span>
                  <span className="text-xs text-muted tabular-nums">
                    {formatHours(investedMinutes(state, g.id))} investidas
                  </span>
                </motion.div>
              ))}
            </motion.div>
          )}
        </section>

        {/* Medalhas */}
        <section className="mb-6">
          <h2 className="mb-2 flex items-center gap-1.5 text-sm font-semibold tracking-widest text-muted uppercase">
            <Medal size={14} /> Medalhas
          </h2>
          <motion.div variants={grid} initial="hidden" animate="show" className="grid grid-cols-3 gap-3 sm:grid-cols-4">
            {BADGES.map((b) => {
              const unlocked = b.isUnlocked(state, now)
              return (
                <motion.div
                  key={b.id}
                  variants={item}
                  className={`flex flex-col items-center gap-1 rounded-2xl border p-3 text-center ${
                    unlocked ? 'border-flame/40 bg-ink-2/60' : 'border-ink-3 bg-ink-2/30 opacity-50'
                  }`}
                  title={b.description}
                >
                  <span className={`text-3xl ${unlocked ? '' : 'grayscale'}`}>{b.emoji}</span>
                  <span className="text-xs font-semibold">{b.title}</span>
                  {!unlocked && <span className="text-[10px] text-muted">{b.description}</span>}
                </motion.div>
              )
            })}
          </motion.div>
        </section>

        {/* Prêmios futuros e histórico */}
        {lockedRewards.length > 0 && (
          <section className="mb-6">
            <h2 className="mb-2 flex items-center gap-1.5 text-sm font-semibold tracking-widest text-muted uppercase">
              <Lock size={14} /> Prêmios no horizonte
            </h2>
            <div className="flex flex-col gap-2">
              {lockedRewards.map((r) => (
                <div key={r.id} className="flex items-center gap-3 rounded-xl bg-ink-2/40 p-3 opacity-70">
                  <span className="text-xl grayscale">{r.emoji}</span>
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold">{r.title}</div>
                    <div className="text-xs text-muted">{describeTrigger(r.trigger, state)}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {redeemed.length > 0 && (
          <section>
            <h2 className="mb-2 text-sm font-semibold tracking-widest text-muted uppercase">
              Já resgatados
            </h2>
            <div className="flex flex-col gap-1.5">
              {redeemed.map((r) => (
                <div key={r.id} className="flex items-center gap-2 text-sm text-muted">
                  <span>{r.emoji}</span>
                  <span className="line-through">{r.title}</span>
                  <span className="ml-auto text-xs tabular-nums">{fmtDate(r.redeemedAt!)}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {state.rewards.length === 0 && (
          <p className="rounded-xl bg-ink-2/40 p-5 text-center text-sm text-muted">
            Você ainda não definiu premiações. Vá em <b>Configurações → Premiações</b> e prometa a si
            algo bom por concluir o que importa. 🎁
          </p>
        )}
      </main>
    </div>
  )
}

function RewardRow({
  reward,
  state,
  onRedeem,
}: {
  reward: Reward
  state: AppState
  onRedeem: () => void
}) {
  return (
    <motion.div
      variants={item}
      className="flex items-center gap-3 rounded-xl border border-flame/40 bg-ink-2/80 p-3"
    >
      <motion.span
        className="text-2xl"
        animate={{ rotate: [0, -8, 8, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
      >
        {reward.emoji}
      </motion.span>
      <div className="min-w-0 flex-1">
        <div className="truncate font-semibold">{reward.title}</div>
        <div className="text-xs text-muted">
          {describeTrigger(reward.trigger, state)} · destravado em {fmtDate(reward.unlockedAt!)}
        </div>
      </div>
      <motion.button
        whileTap={{ scale: 0.92 }}
        onClick={onRedeem}
        className="shrink-0 rounded-full bg-flame px-4 py-2 text-sm font-bold text-ink"
      >
        Resgatar 🎉
      </motion.button>
    </motion.div>
  )
}
