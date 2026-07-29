import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { AnimatePresence, motion } from 'framer-motion'
import {
  BarChart3,
  CalendarDays,
  Check,
  Home,
  Menu,
  PieChart,
  Target,
  Undo2,
} from 'lucide-react'
import { selectAppState, useAppStore } from '../../store/useAppStore'
import { useNow, useSecondsNow } from '../../store/useClock'
import { useOverlays } from '../../store/useOverlays'
import { useUiPrefs } from '../../store/useUiPrefs'
import {
  formatClock,
  formatCountdown,
  formatDayLong,
  minutesOfDay,
  toISODate,
} from '../../domain/dates'
import { getCurrentAndNext, getDayActivities, type DayActivity } from '../../domain/schedule'
import { dayProgress, goalDayProgress, goalTotalProgress, type Ratio } from '../../domain/progress'
import { computeStreak } from '../../domain/streak'
import { eligibleQueuedGoals } from '../../domain/goals'
import { GOAL_COLORS, OBLIGATORY_COLOR, type Goal, type ISODate, type Reward } from '../../domain/types'
import StreakFlame from '../../components/StreakFlame'
import ProgressBar from '../../components/ProgressBar'
import DonutChart from '../../components/DonutChart'
import ActivateGoalFlow from '../objetivos/ActivateGoalFlow'
import { useWakeLock } from '../../hooks/useWakeLock'

const colorOf = (a: DayActivity) => (a.goal ? GOAL_COLORS[a.goal.color] : OBLIGATORY_COLOR)

export default function FocoPage() {
  useWakeLock()
  const now = useNow()
  const store = useAppStore()
  const checkIn = useAppStore((s) => s.checkIn)
  const undoCheckIn = useAppStore((s) => s.undoCheckIn)
  const openWizard = useOverlays((s) => s.openWizard)

  const state = useMemo(
    () => selectAppState(store),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [store.goals, store.blocks, store.checkIns, store.rewards, store.profile],
  )
  const today = toISODate(now)
  const activities = useMemo(() => getDayActivities(state, today, now), [state, today, now])
  const { current, next } = useMemo(() => getCurrentAndNext(activities, now), [activities, now])
  const prog = dayProgress(activities)
  const streak = useMemo(() => computeStreak(state, today), [state, today])
  const allDone = activities.length > 0 && prog.done === prog.total
  const hasGoals = state.goals.some((g) => !g.archivedAt)

  // ---- check-in com desfazer -------------------------------------------------
  const [undoInfo, setUndoInfo] = useState<{ blockId: string; title: string } | null>(null)
  const undoTimer = useRef<number | undefined>(undefined)
  const doCheckIn = (a: DayActivity) => {
    checkIn(a.block.id, today, now)
    setUndoInfo({ blockId: a.block.id, title: a.block.title })
    window.clearTimeout(undoTimer.current)
    undoTimer.current = window.setTimeout(() => setUndoInfo(null), 6000)
  }

  // ---- transição de atividade (popup ao terminar o temporizador) -------------
  const [pendingId, setPendingId] = useState<string | null>(null)
  const lastCurrentRef = useRef<{ date: ISODate; blockId: string } | null>(null)
  const currentId = current?.block.id ?? null
  useEffect(() => {
    const prev = lastCurrentRef.current
    if (prev && prev.date === today && prev.blockId !== currentId) {
      // só dispara se o bloco realmente terminou (não se foi excluído/editado)
      const prevAct = activities.find((a) => a.block.id === prev.blockId)
      if (prevAct && prevAct.endMin <= minutesOfDay(now)) setPendingId(prev.blockId)
    }
    lastCurrentRef.current = currentId ? { date: today, blockId: currentId } : null
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentId, today])
  const pending = pendingId ? activities.find((a) => a.block.id === pendingId) : undefined

  // ---- celebrações (uma por vez: transição > prêmio > fila) ------------------
  const [seenRewards, setSeenRewards] = useState<ReadonlySet<string>>(new Set())
  const [dismissedQueue, setDismissedQueue] = useState<ReadonlySet<string>>(new Set())
  const [activating, setActivating] = useState<Goal | null>(null)

  const rewardToCelebrate =
    !pending && !activating
      ? state.rewards.find((r) => r.unlockedAt === today && !r.redeemedAt && !seenRewards.has(r.id))
      : undefined
  const queueCandidate =
    !pending && !rewardToCelebrate && !activating
      ? eligibleQueuedGoals(state).find((g) => !dismissedQueue.has(g.id))
      : undefined

  // ---- navegação escondida ---------------------------------------------------
  const [navVisible, setNavVisible] = useState(false)
  const navTimer = useRef<number | undefined>(undefined)
  const revealNav = () => {
    setNavVisible(true)
    window.clearTimeout(navTimer.current)
    navTimer.current = window.setTimeout(() => setNavVisible(false), 6000)
  }

  return (
    <div className="flex h-dvh flex-col gap-[2vmin] overflow-hidden p-[3vmin]">
      <header className="flex items-start justify-between">
        <div>
          <div className="text-[8vmin] leading-none font-bold tabular-nums">{formatClock(now)}</div>
          <div className="mt-[0.8vmin] text-[2.4vmin] text-muted capitalize">{formatDayLong(today)}</div>
        </div>
        <div className="flex items-center gap-[3vmin]">
          <DonutChart fraction={prog.total ? prog.done / prog.total : 0} size={72}>
            <span className="text-sm font-bold tabular-nums">
              {prog.done}/{prog.total}
            </span>
          </DonutChart>
          <div className="flex items-center gap-[1vmin]" title="Sequência de dias">
            <StreakFlame lit={streak > 0} size={56} />
            <span className={`text-[5vmin] font-bold tabular-nums ${streak > 0 ? '' : 'text-muted'}`}>
              {streak}
            </span>
          </div>
          <button onClick={revealNav} className="rounded-full p-[1.2vmin] text-muted/50 hover:text-paper" aria-label="Menu">
            <Menu size={26} />
          </button>
        </div>
      </header>

      <main className="flex min-h-0 flex-1 items-center justify-center">
        {current ? (
          <CurrentCard a={current} next={next} onCheckIn={doCheckIn} />
        ) : (
          <IdleScreen
            activities={activities}
            next={next}
            allDone={allDone}
            prog={prog}
            streak={streak}
            hasGoals={hasGoals}
            onCreateGoal={openWizard}
          />
        )}
      </main>

      <footer className="flex items-end gap-[3vmin]">
        <DayTimeline
          activities={activities}
          onToggle={(a) => (a.status === 'done' ? undoCheckIn(a.block.id, today) : doCheckIn(a))}
        />
        <GoalsRail activities={activities} today={today} />
      </footer>

      {navVisible && (
        <div className="fixed top-0 right-0 left-0 z-40 flex justify-center gap-3 bg-ink-2/95 p-4 shadow-xl">
          <Link to="/" className="flex items-center gap-2 rounded-full bg-ink-3 px-5 py-2.5 text-lg">
            <Home size={20} /> Home
          </Link>
          <Link to="/grade" className="flex items-center gap-2 rounded-full bg-ink-3 px-5 py-2.5 text-lg">
            <CalendarDays size={20} /> Grade
          </Link>
          <Link to="/objetivos" className="flex items-center gap-2 rounded-full bg-ink-3 px-5 py-2.5 text-lg">
            <Target size={20} /> Objetivos
          </Link>
        </div>
      )}

      <AnimatePresence>
        {undoInfo && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-[3vmin] left-1/2 z-40 flex -translate-x-1/2 items-center gap-3 rounded-full bg-ink-2 px-5 py-3 shadow-2xl ring-1 ring-ink-3"
          >
            <Check size={18} className="text-flame" />
            <span className="max-w-[40vw] truncate text-sm">{undoInfo.title} concluído</span>
            <button
              onClick={() => {
                undoCheckIn(undoInfo.blockId, today)
                setUndoInfo(null)
              }}
              className="flex items-center gap-1 text-sm font-semibold text-flame"
            >
              <Undo2 size={16} /> Desfazer
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {pending && (
          <TransitionPopup
            key={pending.block.id}
            activity={pending}
            onCheckInAndContinue={() => {
              doCheckIn(pending)
              setPendingId(null)
            }}
            onContinue={() => setPendingId(null)}
          />
        )}
        {rewardToCelebrate && (
          <RewardCelebration
            key={rewardToCelebrate.id}
            reward={rewardToCelebrate}
            onDismiss={() => setSeenRewards((s) => new Set(s).add(rewardToCelebrate.id))}
          />
        )}
        {queueCandidate && (
          <QueueCelebration
            key={queueCandidate.id}
            goal={queueCandidate}
            blockerTitle={state.goals.find((g) => g.id === queueCandidate.afterGoalId)?.title}
            onActivate={() => setActivating(queueCandidate)}
            onLater={() => setDismissedQueue((s) => new Set(s).add(queueCandidate.id))}
          />
        )}
      </AnimatePresence>

      {activating && <ActivateGoalFlow goal={activating} onClose={() => setActivating(null)} />}
    </div>
  )
}

// ---------------------------------------------------------------------------

function CurrentCard({
  a,
  next,
  onCheckIn,
}: {
  a: DayActivity
  next?: DayActivity
  onCheckIn: (a: DayActivity) => void
}) {
  const color = colorOf(a)
  const timerActive = a.status === 'current'
  const secNow = useSecondsNow(timerActive)
  const remainingSec =
    a.endMin * 60 - (secNow.getHours() * 3600 + secNow.getMinutes() * 60 + secNow.getSeconds())

  return (
    <div className="flex max-w-full flex-col items-center gap-[1.2vmin] text-center">
      <div className="text-[2.4vmin] font-semibold tracking-[0.3em] uppercase" style={{ color }}>
        {a.goal ? `Foco · ${a.goal.title}` : 'Foco · Obrigatória'}
      </div>
      <h1 className="max-w-[86vw] truncate text-[7.5vmin] leading-[1.1] font-extrabold">
        {a.goal ? `${a.goal.emoji} ` : ''}
        {a.block.title}
      </h1>

      {timerActive && (
        <motion.div
          key={a.block.id}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-[10vmin] leading-none font-extrabold tabular-nums"
          style={{ color }}
        >
          {formatCountdown(remainingSec)}
        </motion.div>
      )}

      <div className="text-[2.6vmin] text-muted tabular-nums">
        {a.block.start} – {a.block.end}
      </div>

      {a.status === 'done' ? (
        <div className="mt-[0.5vmin] flex flex-col items-center gap-[1vmin]">
          <div className="flex items-center gap-2 text-[3.2vmin] font-bold" style={{ color }}>
            <Check size={34} strokeWidth={3} /> Concluído
          </div>
          {next && <NextUpStrip next={next} />}
        </div>
      ) : (
        <>
          <motion.button
            whileTap={{ scale: 0.94 }}
            onClick={() => onCheckIn(a)}
            className="mt-[1vmin] rounded-full px-[6vmin] py-[2vmin] text-[3.2vmin] font-bold text-ink shadow-2xl"
            style={{ backgroundColor: color }}
          >
            Concluir ✓
          </motion.button>
          {next && <NextUpStrip next={next} />}
        </>
      )}
    </div>
  )
}

function NextUpStrip({ next }: { next: DayActivity }) {
  return (
    <div className="mt-[0.5vmin] text-[2.4vmin] text-muted">
      A seguir:{' '}
      <span className="font-semibold text-paper">
        {next.block.start} {next.goal ? `${next.goal.emoji} ` : ''}
        {next.block.title}
      </span>
    </div>
  )
}

function IdleScreen({
  activities,
  next,
  allDone,
  prog,
  streak,
  hasGoals,
  onCreateGoal,
}: {
  activities: DayActivity[]
  next?: DayActivity
  allDone: boolean
  prog: Ratio
  streak: number
  hasGoals: boolean
  onCreateGoal: () => void
}) {
  if (activities.length === 0) {
    return (
      <div className="flex flex-col items-center gap-[2vmin] text-center">
        <StreakFlame lit={false} size={100} />
        {hasGoals ? (
          <>
            <h1 className="text-[5vmin] font-bold">Nenhum bloco hoje</h1>
            <p className="max-w-[60vw] text-[2.6vmin] text-muted">
              Dê horários aos seus objetivos — como na escola: cada coisa no seu lugar.
            </p>
            <Link to="/grade" className="rounded-full bg-flame px-[4vmin] py-[1.6vmin] text-[2.6vmin] font-bold text-ink">
              Montar grade
            </Link>
          </>
        ) : (
          <>
            <h1 className="text-[5vmin] font-bold">Comece pelo que importa</h1>
            <p className="max-w-[60vw] text-[2.6vmin] text-muted">
              Defina um objetivo, o porquê dele e a prioridade — o Lume monta a semana com você.
            </p>
            <button
              onClick={onCreateGoal}
              className="rounded-full bg-flame px-[4vmin] py-[1.6vmin] text-[2.6vmin] font-bold text-ink"
            >
              Criar meu primeiro objetivo
            </button>
          </>
        )}
      </div>
    )
  }
  if (allDone) {
    return (
      <div className="flex flex-col items-center gap-[2vmin] text-center">
        <motion.div animate={{ scale: [1, 1.06, 1] }} transition={{ repeat: Infinity, duration: 2 }}>
          <StreakFlame lit size={140} />
        </motion.div>
        <h1 className="text-[7vmin] font-extrabold">Dia completo!</h1>
        <p className="text-[3vmin] text-muted">
          {prog.done} de {prog.total} atividades · sequência de{' '}
          <span className="font-bold text-flame">
            {streak} {streak === 1 ? 'dia' : 'dias'}
          </span>
        </p>
      </div>
    )
  }
  if (next) {
    return (
      <div className="flex flex-col items-center gap-[1.5vmin] text-center">
        <div className="text-[2.4vmin] font-semibold tracking-[0.3em] text-muted uppercase">Intervalo</div>
        <h1 className="max-w-[86vw] truncate text-[7vmin] leading-[1.1] font-extrabold">
          {next.block.start} · {next.goal ? `${next.goal.emoji} ` : ''}
          {next.block.title}
        </h1>
        <div className="text-[2.8vmin] text-muted">é a próxima atividade</div>
      </div>
    )
  }
  return (
    <div className="flex flex-col items-center gap-[2vmin] text-center">
      <h1 className="text-[5vmin] font-bold">Fim das atividades de hoje</h1>
      <p className="text-[3vmin] text-muted">
        {prog.done} de {prog.total} concluídas — ainda dá para recuperar na linha do tempo abaixo.
      </p>
    </div>
  )
}

function DayTimeline({
  activities,
  onToggle,
}: {
  activities: DayActivity[]
  onToggle: (a: DayActivity) => void
}) {
  if (activities.length === 0) return <div className="flex-1" />
  return (
    <div className="flex min-w-0 flex-1 gap-[1.2vmin] overflow-x-auto pb-1">
      {activities.map((a) => {
        const color = colorOf(a)
        const base =
          'flex shrink-0 flex-col items-start gap-[0.4vmin] rounded-xl border px-[1.6vmin] py-[1.2vmin] text-left transition-transform active:scale-95'
        const look = {
          done: 'border-transparent',
          current: 'border-transparent ring-2',
          upcoming: 'border-ink-3 opacity-70',
          missed: 'border-red-900/60 opacity-60',
        }[a.status]
        return (
          <button
            key={a.block.id}
            onClick={() => onToggle(a)}
            className={`${base} ${look}`}
            style={{
              backgroundColor: a.status === 'done' ? `${color}26` : undefined,
              ...(a.status === 'current' ? { ['--tw-ring-color' as string]: color } : {}),
            }}
            title={a.status === 'done' ? 'Toque para desfazer' : 'Toque para concluir'}
          >
            <span className="text-[1.7vmin] text-muted tabular-nums">
              {a.block.start}–{a.block.end}
            </span>
            <span className="flex items-center gap-1 text-[2vmin] font-semibold whitespace-nowrap">
              {a.status === 'done' && <Check size={14} style={{ color }} strokeWidth={3} />}
              {a.status === 'missed' && <span className="text-red-400/80">!</span>}
              {a.goal ? `${a.goal.emoji} ` : ''}
              {a.block.title}
            </span>
          </button>
        )
      })}
    </div>
  )
}

function GoalsRail({ activities, today }: { activities: DayActivity[]; today: ISODate }) {
  const goals = useAppStore((s) => s.goals)
  const openDetail = useOverlays((s) => s.openDetail)
  const chartStyle = useUiPrefs((s) => s.chartStyle)
  const setChartStyle = useUiPrefs((s) => s.setChartStyle)

  const active = goals.filter((g) => !g.archivedAt && !g.afterGoalId)
  if (active.length === 0) return null

  const hasToday = new Set(activities.filter((a) => a.goal).map((a) => a.goal!.id))
  const sorted = [...active].sort((a, b) => Number(hasToday.has(b.id)) - Number(hasToday.has(a.id)))

  return (
    <div className="flex max-h-[28vmin] w-[36vmin] shrink-0 flex-col gap-[1vmin]" key={today}>
      <div className="flex items-center justify-between">
        <span className="text-[1.6vmin] font-semibold tracking-widest text-muted uppercase">Objetivos</span>
        <div className="flex gap-1">
          <button
            onClick={() => setChartStyle('bar')}
            className={`rounded p-1 ${chartStyle === 'bar' ? 'text-flame' : 'text-muted/50'}`}
            title="Barras"
          >
            <BarChart3 size={14} />
          </button>
          <button
            onClick={() => setChartStyle('donut')}
            className={`rounded p-1 ${chartStyle === 'donut' ? 'text-flame' : 'text-muted/50'}`}
            title="Pizza"
          >
            <PieChart size={14} />
          </button>
        </div>
      </div>
      <div className="flex flex-col gap-[1.2vmin] overflow-y-auto">
        {sorted.map((g) => {
          const total = goalTotalProgress(g)
          const day = goalDayProgress(activities, g.id)
          const color = GOAL_COLORS[g.color]
          return (
            <button key={g.id} onClick={() => openDetail(g.id)} className="text-left" title="Ver progresso">
              {chartStyle === 'donut' ? (
                <div className="flex items-center gap-[1.2vmin]">
                  <DonutChart fraction={total ?? 0} color={color} size={40} thickness={5}>
                    <span className="text-[1.4vmin]">{g.emoji}</span>
                  </DonutChart>
                  <div className="min-w-0">
                    <div className="truncate text-[2vmin] font-semibold hover:text-flame">{g.title}</div>
                    <div className="text-[1.7vmin] text-muted tabular-nums">
                      {day.total > 0 ? `hoje ${day.done}/${day.total} · ` : ''}
                      {total === null ? '—' : `${Math.round(total * 100)}%`}
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="truncate text-[2vmin] font-semibold hover:text-flame">
                      {g.emoji} {g.title}
                    </span>
                    <span className="shrink-0 text-[1.7vmin] text-muted tabular-nums">
                      {day.total > 0 ? `hoje ${day.done}/${day.total} · ` : ''}
                      {total === null ? '—' : `${Math.round(total * 100)}%`}
                    </span>
                  </div>
                  <ProgressBar fraction={total ?? 0} color={color} className="mt-[0.6vmin]" />
                </>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// --------------------------- popups / celebrações ---------------------------

const popupBackdrop = 'fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-6'

function TransitionPopup({
  activity,
  onCheckInAndContinue,
  onContinue,
}: {
  activity: DayActivity
  onCheckInAndContinue: () => void
  onContinue: () => void
}) {
  const color = colorOf(activity)
  const done = activity.status === 'done'
  return (
    <motion.div className={popupBackdrop} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.div
        initial={{ scale: 0.7, y: 30 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
        className="flex w-full max-w-md flex-col items-center gap-4 rounded-3xl border border-ink-3 bg-ink-2 p-8 text-center"
      >
        <motion.div
          animate={{ scale: [1, 1.15, 1], rotate: [0, -4, 4, 0] }}
          transition={{ repeat: Infinity, duration: 1.8 }}
        >
          <StreakFlame lit size={80} />
        </motion.div>
        <h2 className="text-2xl font-extrabold">
          {activity.goal ? `${activity.goal.emoji} ` : ''}
          {activity.block.title} terminou!
        </h2>
        <p className="text-sm text-muted tabular-nums">
          {activity.block.start} – {activity.block.end}
          {done ? ' · concluída ✓' : ''}
        </p>
        {done ? (
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onContinue}
            className="w-full rounded-full bg-flame px-6 py-3 text-base font-bold text-ink"
          >
            Continuar →
          </motion.button>
        ) : (
          <>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={onCheckInAndContinue}
              className="w-full rounded-full px-6 py-3 text-base font-bold text-ink"
              style={{ backgroundColor: color }}
            >
              Concluir ✓ e continuar
            </motion.button>
            <button onClick={onContinue} className="text-sm text-muted underline hover:text-paper">
              Continuar sem concluir
            </button>
          </>
        )}
      </motion.div>
    </motion.div>
  )
}

function RewardCelebration({ reward, onDismiss }: { reward: Reward; onDismiss: () => void }) {
  const navigate = useNavigate()
  return (
    <motion.div className={popupBackdrop} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.div
        initial={{ scale: 0.6, rotate: -6 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 220, damping: 15 }}
        className="flex w-full max-w-md flex-col items-center gap-4 rounded-3xl border border-flame/40 bg-ink-2 p-8 text-center"
      >
        <motion.div
          className="text-6xl"
          animate={{ y: [0, -10, 0], scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 1.4 }}
        >
          {reward.emoji}
        </motion.div>
        <h2 className="text-2xl font-extrabold text-flame">Prêmio destravado!</h2>
        <p className="text-lg font-semibold">{reward.title}</p>
        <p className="text-sm text-muted">Você mereceu — resgate na página de Conquistas.</p>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            onDismiss()
            navigate('/conquistas')
          }}
          className="w-full rounded-full bg-flame px-6 py-3 text-base font-bold text-ink"
        >
          Ver conquistas 🏆
        </motion.button>
        <button onClick={onDismiss} className="text-sm text-muted underline hover:text-paper">
          Continuar por aqui
        </button>
      </motion.div>
    </motion.div>
  )
}

function QueueCelebration({
  goal,
  blockerTitle,
  onActivate,
  onLater,
}: {
  goal: Goal
  blockerTitle?: string
  onActivate: () => void
  onLater: () => void
}) {
  return (
    <motion.div className={popupBackdrop} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.div
        initial={{ scale: 0.7, y: 30 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
        className="flex w-full max-w-md flex-col items-center gap-4 rounded-3xl border border-ink-3 bg-ink-2 p-8 text-center"
      >
        <div className="text-5xl">🎉</div>
        <h2 className="text-xl font-extrabold">
          {blockerTitle ? `"${blockerTitle}" chegou ao fim!` : 'Caminho livre!'}
        </h2>
        <p className="text-sm text-muted">Próximo da fila, esperando por você:</p>
        <p className="text-2xl font-bold">
          {goal.emoji} {goal.title}
        </p>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={onActivate}
          className="w-full rounded-full bg-flame px-6 py-3 text-base font-bold text-ink"
        >
          Ativar e encaixar na semana
        </motion.button>
        <button onClick={onLater} className="text-sm text-muted underline hover:text-paper">
          Depois
        </button>
      </motion.div>
    </motion.div>
  )
}
