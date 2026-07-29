import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { AnimatePresence, motion } from 'framer-motion'
import {
  BarChart3,
  CalendarDays,
  Check,
  Home,
  Menu,
  Moon,
  PieChart,
  Play,
  Target,
  Undo2,
} from 'lucide-react'
import { selectAppState, useAppStore } from '../../store/useAppStore'
import { useNow, useSecondsNow } from '../../store/useClock'
import { useOverlays } from '../../store/useOverlays'
import { useUiPrefs } from '../../store/useUiPrefs'
import { useFocusSession } from '../../store/useFocusSession'
import {
  addDaysISO,
  formatClock,
  formatCountdown,
  formatDayLong,
  minutesOfDay,
  toISODate,
} from '../../domain/dates'
import { getDayActivities, type DayActivity } from '../../domain/schedule'
import { manualExpired, resolveFocus } from '../../domain/focusSession'
import { dayProgress, goalDayProgress, goalTotalProgress, type Ratio } from '../../domain/progress'
import { computeStreak } from '../../domain/streak'
import { eligibleQueuedGoals } from '../../domain/goals'
import { splitRoutine } from '../../domain/routine'
import { buildDayCloseSummary, isDayCloseAvailable, type DayCloseSummary } from '../../domain/dayClose'
import { DAY_CLOSE_PHRASES, END_PHRASES, START_PHRASES, pickPhrase } from '../../domain/phrases'
import { notify } from '../../lib/notify'
import { speak } from '../../lib/speech'
import { GOAL_COLORS, OBLIGATORY_COLOR, type Goal, type ISODate, type Reward } from '../../domain/types'
import StreakFlame from '../../components/StreakFlame'
import ProgressBar from '../../components/ProgressBar'
import DonutChart from '../../components/DonutChart'
import ActivateGoalFlow from '../objetivos/ActivateGoalFlow'
import { useWakeLock } from '../../hooks/useWakeLock'

const colorOf = (a: DayActivity) => (a.goal ? GOAL_COLORS[a.goal.color] : OBLIGATORY_COLOR)

/** Anuncia transições de foco por voz/notificação — uma fala combinada, nunca em rajada. */
function useActivityAlerts(current: DayActivity | undefined, today: ISODate) {
  const voiceEnabled = useUiPrefs((s) => s.voiceEnabled)
  const notificationsEnabled = useUiPrefs((s) => s.notificationsEnabled)
  const lastAnnouncedKey = useFocusSession((s) => s.lastAnnouncedKey)
  const setAnnounced = useFocusSession((s) => s.setAnnounced)
  const prevRef = useRef<{ id: string; title: string } | null | undefined>(undefined)

  useEffect(() => {
    const prev = prevRef.current
    const cur = current ? { id: current.block.id, title: current.block.title } : null
    prevRef.current = cur
    if (prev === undefined) return // primeiro render não anuncia (edge 41)
    if ((prev?.id ?? null) === (cur?.id ?? null)) return
    if (!voiceEnabled && !notificationsEnabled) return
    const key = `${today}:${prev?.id ?? '-'}>${cur?.id ?? '-'}`
    if (key === lastAnnouncedKey) return // reload logo após a transição (edge 42)
    setAnnounced(key)
    const parts: string[] = []
    if (prev) parts.push(`${prev.title} terminou. ${pickPhrase(END_PHRASES, key)}`)
    if (cur) parts.push(`Agora: ${cur.title}. ${pickPhrase(START_PHRASES, key).replaceAll('{title}', cur.title)}`)
    const text = parts.join(' ')
    if (notificationsEnabled) notify('Lume 🔥', text)
    if (voiceEnabled) speak(text)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current?.block.id, today])
}

export default function FocoView({ embedded = false }: { embedded?: boolean }) {
  useWakeLock(!embedded)
  const navigate = useNavigate()
  const now = useNow()
  const store = useAppStore()
  const checkIn = useAppStore((s) => s.checkIn)
  const undoCheckIn = useAppStore((s) => s.undoCheckIn)
  const openWizard = useOverlays((s) => s.openWizard)

  const manualFocus = useFocusSession((s) => s.manualFocus)
  const startManual = useFocusSession((s) => s.startManual)
  const clearManual = useFocusSession((s) => s.clearManual)
  const closedDay = useFocusSession((s) => s.closedDay)
  const closeDay = useFocusSession((s) => s.closeDay)

  const state = useMemo(
    () => selectAppState(store),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [store.goals, store.blocks, store.checkIns, store.rewards, store.profile, store.workSchedule],
  )
  const today = toISODate(now)
  const activities = useMemo(() => getDayActivities(state, today, now), [state, today, now])
  const resolution = useMemo(
    () => resolveFocus(activities, now, manualFocus),
    [activities, now, manualFocus],
  )
  const { current, source, next } = resolution
  const prog = dayProgress(activities)
  const streak = useMemo(() => computeStreak(state, today), [state, today])
  const allDone = activities.length > 0 && prog.done === prog.total
  const hasGoals = state.goals.some((g) => !g.archivedAt)

  useActivityAlerts(current, today)

  // sessão manual de outro dia → descarta em silêncio (edge 8/9)
  useEffect(() => {
    if (manualFocus && manualFocus.date !== today) clearManual()
  }, [manualFocus, today, clearManual])

  // ---- check-in com desfazer -------------------------------------------------
  const [undoInfo, setUndoInfo] = useState<{ blockId: string; title: string } | null>(null)
  const undoTimer = useRef<number | undefined>(undefined)
  const doCheckIn = (a: DayActivity) => {
    checkIn(a.block.id, today, now)
    if (manualFocus?.blockId === a.block.id) clearManual() // concluiu o foco manual (edge 6)
    setUndoInfo({ blockId: a.block.id, title: a.block.title })
    window.clearTimeout(undoTimer.current)
    undoTimer.current = window.setTimeout(() => setUndoInfo(null), 6000)
  }

  // ---- transição (popup ao terminar) — relógio E sessão manual ---------------
  const [pendingId, setPendingId] = useState<string | null>(null)
  const lastCurrentRef = useRef<{ date: ISODate; blockId: string } | null>(null)
  const currentId = current?.block.id ?? null
  useEffect(() => {
    const prev = lastCurrentRef.current
    if (prev && prev.date === today && prev.blockId !== currentId) {
      const prevAct = activities.find((a) => a.block.id === prev.blockId)
      if (prevAct && prevAct.endMin <= minutesOfDay(now)) setPendingId(prev.blockId)
    }
    lastCurrentRef.current = currentId ? { date: today, blockId: currentId } : null
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentId, today])
  useEffect(() => {
    if (manualExpired(manualFocus, now, today)) {
      setPendingId(manualFocus!.blockId)
      clearManual()
    }
  }, [now, manualFocus, today, clearManual])
  const pending = pendingId ? activities.find((a) => a.block.id === pendingId) : undefined

  // ---- iniciar atividade (modal) ---------------------------------------------
  const [startCandidate, setStartCandidate] = useState<DayActivity | null>(null)
  const onChipClick = (a: DayActivity) => {
    if (a.status === 'done') {
      undoCheckIn(a.block.id, today)
      return
    }
    setStartCandidate(a)
  }
  const confirmStart = (a: DayActivity) => {
    startManual({
      date: today,
      blockId: a.block.id,
      startedAtMs: now.getTime(),
      durationMin: a.endMin - a.startMin,
    })
    setStartCandidate(null)
  }

  // ---- fechamento do dia -----------------------------------------------------
  const isClosed = closedDay === today
  const closeAvailable = !isClosed && isDayCloseAvailable(activities, now)
  const [closeSummary, setCloseSummary] = useState<DayCloseSummary | null>(null)
  const tomorrowFirst = useMemo(
    () => getDayActivities(state, addDaysISO(today, 1), now)[0]?.block.start,
    [state, today, now],
  )

  // ---- celebrações (uma por vez) ---------------------------------------------
  const [seenRewards, setSeenRewards] = useState<ReadonlySet<string>>(new Set())
  const [dismissedQueue, setDismissedQueue] = useState<ReadonlySet<string>>(new Set())
  const [activating, setActivating] = useState<Goal | null>(null)
  const busy = Boolean(pending || startCandidate || closeSummary || activating)
  const rewardToCelebrate = !busy
    ? state.rewards.find((r) => r.unlockedAt === today && !r.redeemedAt && !seenRewards.has(r.id))
    : undefined
  const queueCandidate =
    !busy && !rewardToCelebrate
      ? eligibleQueuedGoals(state).find((g) => !dismissedQueue.has(g.id))
      : undefined

  // ---- navegação escondida (kiosk) -------------------------------------------
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
          {!embedded && (
            <button onClick={revealNav} className="rounded-full p-[1.2vmin] text-muted/50 hover:text-paper" aria-label="Menu">
              <Menu size={26} />
            </button>
          )}
        </div>
      </header>

      <main className="flex min-h-0 flex-1 items-center justify-center">
        {current ? (
          <CurrentCard
            a={current}
            source={source}
            manualEndsAtMs={resolution.manualEndsAtMs}
            next={next}
            onCheckIn={doCheckIn}
          />
        ) : (
          <IdleScreen
            activities={activities}
            next={next}
            allDone={allDone}
            prog={prog}
            streak={streak}
            hasGoals={hasGoals}
            isClosed={isClosed}
            closeAvailable={closeAvailable}
            tomorrowFirst={tomorrowFirst}
            onCreateGoal={openWizard}
            onOpenClose={() => setCloseSummary(buildDayCloseSummary(state, today, now))}
          />
        )}
      </main>

      <footer className="flex items-end gap-[3vmin]">
        <DayTimeline activities={activities} onChipClick={onChipClick} />
        <GoalsRail activities={activities} today={today} />
      </footer>

      {!embedded && navVisible && (
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
        {startCandidate && (
          <StartActivityModal
            key={startCandidate.block.id}
            activity={startCandidate}
            currentFocus={current}
            onStart={() => confirmStart(startCandidate)}
            onConclude={() => {
              doCheckIn(startCandidate)
              setStartCandidate(null)
            }}
            onClose={() => setStartCandidate(null)}
          />
        )}
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
        {closeSummary && (
          <DayCloseOverlay
            summary={closeSummary}
            onConfirm={() => {
              closeDay(today)
              setCloseSummary(null)
            }}
            onClose={() => setCloseSummary(null)}
          />
        )}
        {rewardToCelebrate && (
          <RewardCelebration
            key={rewardToCelebrate.id}
            reward={rewardToCelebrate}
            onDismiss={() => setSeenRewards((s) => new Set(s).add(rewardToCelebrate.id))}
            onGo={() => navigate('/conquistas')}
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
  source,
  manualEndsAtMs,
  next,
  onCheckIn,
}: {
  a: DayActivity
  source: 'schedule' | 'manual' | null
  manualEndsAtMs?: number
  next?: DayActivity
  onCheckIn: (a: DayActivity) => void
}) {
  const color = colorOf(a)
  const durationSec = (a.endMin - a.startMin) * 60
  const timerActive = a.status !== 'done' && (source === 'manual' || a.status === 'current')
  const secNow = useSecondsNow(timerActive)

  let remainingSec: number
  if (source === 'manual' && manualEndsAtMs) {
    remainingSec = Math.max(0, (manualEndsAtMs - secNow.getTime()) / 1000)
  } else {
    const daySec = secNow.getHours() * 3600 + secNow.getMinutes() * 60 + secNow.getSeconds()
    remainingSec = Math.max(0, a.endMin * 60 - daySec)
  }
  const fraction = Math.min(1, Math.max(0, 1 - remainingSec / durationSec))

  return (
    <div className="flex max-w-full flex-col items-center gap-[1.2vmin] text-center">
      <div className="text-[2.4vmin] font-semibold tracking-[0.3em] uppercase" style={{ color }}>
        {a.goal ? `Foco · ${a.goal.title}` : 'Foco · Rotina'}
        {source === 'manual' && <span className="text-muted"> · iniciada por você</span>}
      </div>
      <h1 className="max-w-[86vw] truncate text-[7vmin] leading-[1.1] font-extrabold">
        {a.goal ? `${a.goal.emoji} ` : ''}
        {a.block.title}
      </h1>

      {timerActive && (
        <>
          <motion.div
            key={a.block.id}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-[9vmin] leading-none font-extrabold tabular-nums"
            style={{ color }}
          >
            {formatCountdown(remainingSec)}
          </motion.div>
          <div className="h-[1vmin] w-[56vmin] max-w-[80vw] overflow-hidden rounded-full bg-ink-3">
            <div
              className="h-full rounded-full transition-[width] duration-1000 ease-linear"
              style={{ width: `${fraction * 100}%`, backgroundColor: color }}
            />
          </div>
        </>
      )}

      <div className="text-[2.4vmin] text-muted tabular-nums">
        {a.block.start} – {a.block.end}
      </div>

      {a.goal && a.goal.milestones.length > 0 && <MilestoneChecklist goal={a.goal} color={color} />}

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
            className="mt-[0.5vmin] rounded-full px-[6vmin] py-[1.8vmin] text-[3vmin] font-bold text-ink shadow-2xl"
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

/** Etapas do objetivo em foco — marcar aqui reflete em Objetivos (mesmo store). */
function MilestoneChecklist({ goal, color }: { goal: Goal; color: string }) {
  const toggleMilestone = useAppStore((s) => s.toggleMilestone)
  return (
    <div className="mt-[0.5vmin] flex max-h-[13vmin] w-[56vmin] max-w-[80vw] flex-col gap-[0.5vmin] overflow-y-auto rounded-xl bg-ink-2/50 p-[1.4vmin] text-left">
      {goal.milestones.map((m) => (
        <label key={m.id} className="flex cursor-pointer items-center gap-[1vmin] text-[2vmin]">
          <input
            type="checkbox"
            checked={m.done}
            onChange={() => toggleMilestone(goal.id, m.id)}
            className="size-[2.2vmin] accent-current"
            style={{ color }}
          />
          <span className={m.done ? 'text-muted line-through' : ''}>{m.title}</span>
        </label>
      ))}
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
  isClosed,
  closeAvailable,
  tomorrowFirst,
  onCreateGoal,
  onOpenClose,
}: {
  activities: DayActivity[]
  next?: DayActivity
  allDone: boolean
  prog: Ratio
  streak: number
  hasGoals: boolean
  isClosed: boolean
  closeAvailable: boolean
  tomorrowFirst?: string
  onCreateGoal: () => void
  onOpenClose: () => void
}) {
  const closeButton = closeAvailable && (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={onOpenClose}
      className="mt-[1vmin] flex items-center gap-2 rounded-full bg-flame px-[4vmin] py-[1.6vmin] text-[2.6vmin] font-bold text-ink"
    >
      <Moon size={22} /> Encerrar o dia
    </motion.button>
  )

  if (isClosed) {
    return (
      <div className="flex flex-col items-center gap-[2vmin] text-center">
        <StreakFlame lit={streak > 0} size={120} />
        <h1 className="text-[6vmin] font-extrabold">Dia encerrado 🌙</h1>
        <p className="text-[2.8vmin] text-muted">
          {tomorrowFirst
            ? `Amanhã a chama volta às ${tomorrowFirst}. Descanse.`
            : 'Amanhã a gente continua. Descanse.'}
        </p>
      </div>
    )
  }

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
        {closeButton}
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
        {prog.done} de {prog.total} concluídas — dá para recuperar na linha do tempo abaixo.
      </p>
      {closeButton}
    </div>
  )
}

function TimelineChip({ a, onClick }: { a: DayActivity; onClick: (a: DayActivity) => void }) {
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
      onClick={() => onClick(a)}
      className={`${base} ${look}`}
      style={{
        backgroundColor: a.status === 'done' ? `${color}26` : undefined,
        ...(a.status === 'current' ? { ['--tw-ring-color' as string]: color } : {}),
      }}
      title={a.status === 'done' ? 'Toque para desfazer' : 'Toque para iniciar'}
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
}

function DayTimeline({
  activities,
  onChipClick,
}: {
  activities: DayActivity[]
  onChipClick: (a: DayActivity) => void
}) {
  if (activities.length === 0) return <div className="flex-1" />
  const { goalActs, routine } = splitRoutine(activities)
  return (
    <div className="flex min-w-0 flex-1 items-stretch gap-[1.2vmin] overflow-x-auto pb-1">
      {goalActs.map((a) => (
        <TimelineChip key={a.block.id} a={a} onClick={onChipClick} />
      ))}
      {goalActs.length > 0 && routine.length > 0 && (
        <div className="flex shrink-0 flex-col items-center justify-center gap-[0.5vmin] px-[0.6vmin]">
          <div className="w-px flex-1 bg-ink-3" />
          <span className="text-[1.3vmin] tracking-widest text-muted/60 uppercase">Rotina</span>
          <div className="w-px flex-1 bg-ink-3" />
        </div>
      )}
      {routine.map((a) => (
        <TimelineChip key={a.block.id} a={a} onClick={onChipClick} />
      ))}
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

// --------------------------- popups / overlays -------------------------------

const popupBackdrop = 'fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-6'

/** Modal de iniciar atividade (edge 1–5, 11): nada de check-in silencioso. */
function StartActivityModal({
  activity,
  currentFocus,
  onStart,
  onConclude,
  onClose,
}: {
  activity: DayActivity
  currentFocus?: DayActivity
  onStart: () => void
  onConclude: () => void
  onClose: () => void
}) {
  const color = colorOf(activity)
  const durationMin = activity.endMin - activity.startMin
  const isTheCurrent = currentFocus?.block.id === activity.block.id
  const switching = currentFocus && !isTheCurrent

  return (
    <motion.div className={popupBackdrop} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <motion.div
        initial={{ scale: 0.8, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.85, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 280, damping: 22 }}
        className="flex w-full max-w-md flex-col items-center gap-4 rounded-3xl border border-ink-3 bg-ink-2 p-7 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-4xl">{activity.goal?.emoji ?? '⏱️'}</div>
        <h2 className="text-2xl font-extrabold">{activity.block.title}</h2>

        {isTheCurrent ? (
          <>
            <p className="text-sm text-muted">Esta já é o seu foco atual.</p>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={onConclude}
              className="w-full rounded-full px-6 py-3 text-base font-bold text-ink"
              style={{ backgroundColor: color }}
            >
              Concluir ✓
            </motion.button>
          </>
        ) : (
          <>
            <p className="text-sm text-muted">
              Iniciar agora? Vai levar{' '}
              <b className="text-paper">{durationMin} min</b>
              {activity.status === 'missed' && ' — melhor atrasada do que nunca 🔥'}
            </p>
            {switching && (
              <p className="w-full rounded-xl bg-amber-950/40 p-3 text-xs text-amber-300">
                Você está no meio de <b>{currentFocus!.block.title}</b>. Iniciar esta troca o foco atual.
              </p>
            )}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={onStart}
              className="flex w-full items-center justify-center gap-2 rounded-full px-6 py-3 text-base font-bold text-ink"
              style={{ backgroundColor: color }}
            >
              <Play size={18} /> {switching ? 'Trocar o foco e iniciar' : 'Iniciar agora'}
            </motion.button>
            <button onClick={onClose} className="text-sm text-muted underline hover:text-paper">
              Agora não
            </button>
          </>
        )}
      </motion.div>
    </motion.div>
  )
}

function DayCloseOverlay({
  summary,
  onConfirm,
  onClose,
}: {
  summary: DayCloseSummary
  onConfirm: () => void
  onClose: () => void
}) {
  return (
    <motion.div className={popupBackdrop} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.div
        initial={{ scale: 0.8, y: 30 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 240, damping: 20 }}
        className="flex w-full max-w-md flex-col items-center gap-4 rounded-3xl border border-ink-3 bg-ink-2 p-8 text-center"
      >
        <StreakFlame lit={summary.streak > 0} size={80} />
        <h2 className="text-2xl font-extrabold">Fechar o dia</h2>
        <p className="text-sm text-muted tabular-nums">
          {summary.done} de {summary.total} atividades concluídas
          {summary.missed > 0 && ` · ${summary.missed} ficaram para trás`} · sequência de{' '}
          <b className="text-flame">{summary.streak}</b>
        </p>
        <p className="text-base font-semibold text-paper">
          “{pickPhrase(DAY_CLOSE_PHRASES, summary.phraseSeed)}”
        </p>
        {summary.tomorrow.length > 0 && (
          <div className="w-full rounded-xl bg-ink-3/60 p-3 text-left text-xs text-muted">
            <div className="mb-1 font-semibold tracking-widest uppercase">Amanhã</div>
            {summary.tomorrow.slice(0, 4).map((a) => (
              <div key={a.block.id} className="tabular-nums">
                {a.block.start} · {a.goal ? `${a.goal.emoji} ` : ''}
                {a.block.title}
              </div>
            ))}
            {summary.tomorrow.length > 4 && <div>+{summary.tomorrow.length - 4} atividades</div>}
          </div>
        )}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={onConfirm}
          className="w-full rounded-full bg-flame px-6 py-3 text-base font-bold text-ink"
        >
          Encerrar o dia 🔥
        </motion.button>
        <button onClick={onClose} className="text-sm text-muted underline hover:text-paper">
          Ainda não
        </button>
      </motion.div>
    </motion.div>
  )
}

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
        <motion.div animate={{ scale: [1, 1.15, 1], rotate: [0, -4, 4, 0] }} transition={{ repeat: Infinity, duration: 1.8 }}>
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

function RewardCelebration({
  reward,
  onDismiss,
  onGo,
}: {
  reward: Reward
  onDismiss: () => void
  onGo: () => void
}) {
  return (
    <motion.div className={popupBackdrop} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.div
        initial={{ scale: 0.6, rotate: -6 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 220, damping: 15 }}
        className="flex w-full max-w-md flex-col items-center gap-4 rounded-3xl border border-flame/40 bg-ink-2 p-8 text-center"
      >
        <motion.div className="text-6xl" animate={{ y: [0, -10, 0], scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 1.4 }}>
          {reward.emoji}
        </motion.div>
        <h2 className="text-2xl font-extrabold text-flame">Prêmio destravado!</h2>
        <p className="text-lg font-semibold">{reward.title}</p>
        <p className="text-sm text-muted">Você mereceu — resgate na página de Conquistas.</p>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            onDismiss()
            onGo()
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
