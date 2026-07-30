import type { ReactNode } from 'react'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import { motion } from 'framer-motion'
import {
  CalendarDays,
  CalendarRange,
  ChevronDown,
  Flame,
  ListChecks,
  Settings,
  Target,
  TrendingUp,
  Trophy,
  User,
} from 'lucide-react'
import { Cloud, CloudOff, RefreshCw } from 'lucide-react'
import FocoView from '../foco/FocoView'
import { splitRoutine } from '../../domain/routine'
import { useSyncStatus } from '../../store/sync'
import NavBar from '../../components/NavBar'
import DonutChart from '../../components/DonutChart'
import ProgressBar from '../../components/ProgressBar'
import StreakFlame from '../../components/StreakFlame'
import { selectAppState, useAppStore } from '../../store/useAppStore'
import { useNow } from '../../store/useClock'
import { useOverlays } from '../../store/useOverlays'
import { formatDayLong, formatRemaining, minutesOfDay, toISODate } from '../../domain/dates'
import { getCurrentAndNext, getDayActivities } from '../../domain/schedule'
import { dayProgress } from '../../domain/progress'
import { computeStreak } from '../../domain/streak'
import { monthHeatmap, overallProgress } from '../../domain/stats'
import { goalStatus } from '../../domain/goals'
import { goalTotalProgress } from '../../domain/progress'
import { unlockedBadges } from '../../domain/achievements'
import { GOAL_COLORS } from '../../domain/types'

const gridVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
}
const cardVariants = {
  hidden: { opacity: 0, y: 16, scale: 0.97 },
  show: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } },
}

/** Pontinho de status da nuvem — discreto, leva à Config. */
function SyncBadge({ onClick }: { onClick: () => void }) {
  const status = useSyncStatus((s) => s.status)
  if (status === 'guest') return null
  const map = {
    saved: { Icon: Cloud, cls: 'text-emerald-500/70', title: 'Sincronizado' },
    saving: { Icon: RefreshCw, cls: 'animate-spin text-muted', title: 'Sincronizando…' },
    offline: { Icon: CloudOff, cls: 'text-muted/60', title: 'Offline — dados seguros neste aparelho' },
    conflict: { Icon: Cloud, cls: 'text-amber-400', title: 'Outro aparelho salvou depois — versão mais recente carregada' },
    error: { Icon: CloudOff, cls: 'text-red-400/80', title: 'Erro de sincronização' },
  }[status]
  if (!map) return null
  const { Icon, cls, title } = map
  return (
    <button onClick={onClick} title={title} className="p-1">
      <Icon size={18} className={cls} />
    </button>
  )
}

function AppCard({
  title,
  Icon,
  onClick,
  hero = false,
  children,
}: {
  title: string
  Icon: typeof Flame
  onClick: () => void
  hero?: boolean
  children: ReactNode
}) {
  return (
    <motion.button
      variants={cardVariants}
      whileTap={{ scale: 0.96 }}
      whileHover={{ scale: 1.02 }}
      onClick={onClick}
      className={`flex flex-col gap-2 rounded-2xl border border-ink-3 bg-ink-2/60 p-4 text-left ${
        hero ? 'col-span-2' : ''
      }`}
    >
      <span className="flex items-center gap-1.5 text-xs font-semibold tracking-widest text-muted uppercase">
        <Icon size={14} /> {title}
      </span>
      {children}
    </motion.button>
  )
}

export default function HomePage() {
  const navigate = useNavigate()
  const openDetail = useOverlays((s) => s.openDetail)
  const [scrolled, setScrolled] = useState(false)
  const now = useNow()
  const store = useAppStore()
  const state = useMemo(
    () => selectAppState(store),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [store.goals, store.blocks, store.checkIns, store.rewards, store.profile],
  )

  const today = toISODate(now)
  const activities = useMemo(() => getDayActivities(state, today, now), [state, today, now])
  const { current, next } = getCurrentAndNext(activities, now)
  const prog = dayProgress(activities)
  const streak = useMemo(() => computeStreak(state, today), [state, today])
  const overall = overallProgress(state)

  const active = state.goals.filter((g) => goalStatus(g) === 'active')
  const queued = state.goals.filter((g) => goalStatus(g) === 'queued')
  const completed = state.goals.filter((g) => goalStatus(g) === 'completed')

  const month = today.slice(0, 7)
  const heat = useMemo(() => monthHeatmap(state, month), [state, month])
  const monthDone = heat.reduce((s, d) => s + d.done, 0)
  const monthTotal = heat.filter((d) => d.date <= today).reduce((s, d) => s + d.total, 0)

  const badges = unlockedBadges(state, now)
  const toRedeem = state.rewards.filter((r) => r.unlockedAt && !r.redeemedAt)

  const topGoals = active
    .map((g) => ({ g, f: goalTotalProgress(g) }))
    .sort((a, b) => (b.f ?? -1) - (a.f ?? -1))
    .slice(0, 3)

  const { routine } = splitRoutine(activities)
  const routineDone = routine.filter((a) => a.status === 'done').length

  return (
    <div
      className="h-dvh snap-y snap-mandatory overflow-y-auto"
      onScroll={(e) => {
        if (!scrolled && e.currentTarget.scrollTop > 40) setScrolled(true)
      }}
    >
      {/* Seção 1 — dashboard */}
      <section className="relative flex min-h-dvh snap-start flex-col">
      <NavBar />
      <main className="mx-auto w-full max-w-5xl p-4">
        <div className="mb-4 flex items-end justify-between">
          <div>
            <h1 className="text-xl font-bold">
              {state.profile.name ? `Olá, ${state.profile.name}` : 'Lume'} {state.profile.avatarEmoji}
            </h1>
            <p className="text-sm text-muted capitalize">{formatDayLong(today)}</p>
          </div>
          <div className="flex items-center gap-3">
            <SyncBadge onClick={() => navigate('/config')} />
            <div className="flex items-center gap-1" title="Sequência">
              <StreakFlame lit={streak > 0} size={30} />
              <span className={`text-lg font-bold ${streak > 0 ? '' : 'text-muted'}`}>{streak}</span>
            </div>
          </div>
        </div>

        <motion.div variants={gridVariants} initial="hidden" animate="show" className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {/* Foco atual — hero */}
          <AppCard title="Foco atual" Icon={Flame} onClick={() => navigate('/foco')} hero>
            {current ? (
              <div>
                <div className="truncate text-2xl font-extrabold">
                  {current.goal ? `${current.goal.emoji} ` : ''}
                  {current.block.title}
                </div>
                <div className="mt-0.5 text-sm text-muted tabular-nums">
                  {current.block.start}–{current.block.end} ·{' '}
                  <span className="font-semibold text-flame">
                    {current.status === 'done' ? 'concluída ✓' : formatRemaining(current.endMin - minutesOfDay(now))}
                  </span>
                </div>
              </div>
            ) : next ? (
              <div>
                <div className="text-sm text-muted">A seguir</div>
                <div className="truncate text-xl font-bold">
                  {next.block.start} · {next.goal ? `${next.goal.emoji} ` : ''}
                  {next.block.title}
                </div>
              </div>
            ) : (
              <div className="text-lg font-semibold text-muted">
                {activities.length > 0 ? 'Dia encerrado' : 'Nada agendado hoje'}
              </div>
            )}
          </AppCard>

          <AppCard title="Prog. diário" Icon={TrendingUp} onClick={() => navigate('/foco')}>
            <div className="flex items-center justify-center py-1">
              <DonutChart fraction={prog.total ? prog.done / prog.total : 0} size={64}>
                <span className="text-xs font-bold tabular-nums">
                  {prog.done}/{prog.total}
                </span>
              </DonutChart>
            </div>
          </AppCard>

          <AppCard title="Prog. total" Icon={Target} onClick={() => navigate('/objetivos')}>
            <div className="flex items-center gap-2 py-1">
              <DonutChart fraction={overall ?? 0} size={64}>
                <span className="text-xs font-bold tabular-nums">
                  {overall === null ? '—' : `${Math.round(overall * 100)}%`}
                </span>
              </DonutChart>
            </div>
          </AppCard>

          {/* Objetivos com mini progresso clicável */}
          <AppCard title="Objetivos" Icon={Target} onClick={() => navigate('/objetivos')} hero>
            {topGoals.length === 0 ? (
              <div className="text-sm text-muted">Crie seu primeiro objetivo — o coração do Lume.</div>
            ) : (
              <div className="flex w-full flex-col gap-1.5">
                {topGoals.map(({ g, f }) => (
                  <span
                    key={g.id}
                    role="button"
                    tabIndex={0}
                    onClick={(e) => {
                      e.stopPropagation()
                      openDetail(g.id)
                    }}
                    onKeyDown={(e) => e.key === 'Enter' && openDetail(g.id)}
                    className="group flex items-center gap-2"
                  >
                    <span className="w-28 truncate text-sm group-hover:text-flame">
                      {g.emoji} {g.title}
                    </span>
                    <ProgressBar fraction={f ?? 0} color={GOAL_COLORS[g.color]} className="flex-1" />
                    <span className="w-9 text-right text-xs text-muted tabular-nums">
                      {f === null ? '—' : `${Math.round(f * 100)}%`}
                    </span>
                  </span>
                ))}
                <span className="text-xs text-muted">
                  {active.length} ativo(s) · {queued.length} na fila · {completed.length} concluído(s)
                </span>
              </div>
            )}
          </AppCard>

          <AppCard title="Rotina" Icon={ListChecks} onClick={() => navigate('/grade')}>
            {routine.length === 0 ? (
              <>
                <div className="text-2xl">🧺</div>
                <div className="text-xs text-muted">crie suas rotinas diárias</div>
              </>
            ) : (
              <>
                <div className="text-2xl font-bold tabular-nums">
                  {routineDone}/{routine.length}
                </div>
                <div className="text-xs text-muted">tarefas do dia a dia</div>
              </>
            )}
          </AppCard>

          <AppCard title="Plano semanal" Icon={CalendarDays} onClick={() => navigate('/grade')}>
            <div className="text-2xl font-bold tabular-nums">{activities.length}</div>
            <div className="text-xs text-muted">blocos hoje</div>
          </AppCard>

          <AppCard title="Plano mensal" Icon={CalendarRange} onClick={() => navigate('/mes')}>
            <div className="text-2xl font-bold tabular-nums">
              {monthTotal === 0 ? '—' : `${Math.round((monthDone / monthTotal) * 100)}%`}
            </div>
            <div className="text-xs text-muted">do mês até hoje</div>
          </AppCard>

          <AppCard title="Conquistas" Icon={Trophy} onClick={() => navigate('/conquistas')}>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold tabular-nums">{badges.length}</span>
              {toRedeem.length > 0 && (
                <motion.span
                  animate={{ scale: [1, 1.15, 1] }}
                  transition={{ repeat: Infinity, duration: 1.6 }}
                  className="rounded-full bg-flame px-2 py-0.5 text-xs font-bold text-ink"
                >
                  {toRedeem.length} 🎁
                </motion.span>
              )}
            </div>
            <div className="text-xs text-muted">medalhas</div>
          </AppCard>

          <AppCard title="Perfil" Icon={User} onClick={() => navigate('/perfil')}>
            <div className="text-2xl">{state.profile.avatarEmoji}</div>
            <div className="truncate text-xs text-muted">
              {state.profile.name || 'Defina seu perfil'}
            </div>
          </AppCard>

          <AppCard title="Config." Icon={Settings} onClick={() => navigate('/config')}>
            <div className="text-2xl">⚙️</div>
            <div className="text-xs text-muted">premiações e dados</div>
          </AppCard>
        </motion.div>
      </main>

      {!scrolled && (
        <motion.div
          animate={{ y: [0, 6, 0], opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 1.8 }}
          className="pointer-events-none absolute bottom-3 left-1/2 flex -translate-x-1/2 flex-col items-center text-xs text-muted"
        >
          <span>deslize para o Foco</span>
          <ChevronDown size={18} />
        </motion.div>
      )}
      </section>

      {/* Seção 2 — Foco embutido (rolar para baixo revela) */}
      <section className="h-dvh snap-start">
        <FocoView embedded />
      </section>
    </div>
  )
}
