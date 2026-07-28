import { useMemo, useRef, useState } from 'react'
import { Link } from 'react-router'
import { CalendarDays, Check, Menu, Target, Undo2 } from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'
import { useNow } from '../../store/useClock'
import {
  formatClock,
  formatDayLong,
  formatRemaining,
  minutesOfDay,
  toISODate,
} from '../../domain/dates'
import { getCurrentAndNext, getDayActivities, type DayActivity } from '../../domain/schedule'
import { dayProgress, goalDayProgress, goalTotalProgress, type Ratio } from '../../domain/progress'
import { computeStreak } from '../../domain/streak'
import { GOAL_COLORS, OBLIGATORY_COLOR, type ISODate } from '../../domain/types'
import StreakFlame from '../../components/StreakFlame'
import ProgressBar from '../../components/ProgressBar'
import { useWakeLock } from '../../hooks/useWakeLock'

const colorOf = (a: DayActivity) => (a.goal ? GOAL_COLORS[a.goal.color] : OBLIGATORY_COLOR)

export default function PainelPage() {
  useWakeLock()
  const now = useNow()
  const goals = useAppStore((s) => s.goals)
  const blocks = useAppStore((s) => s.blocks)
  const checkIns = useAppStore((s) => s.checkIns)
  const checkIn = useAppStore((s) => s.checkIn)
  const undoCheckIn = useAppStore((s) => s.undoCheckIn)

  const state = useMemo(
    () => ({ schemaVersion: 1 as const, goals, blocks, checkIns }),
    [goals, blocks, checkIns],
  )
  const today = toISODate(now)
  const activities = useMemo(() => getDayActivities(state, today, now), [state, today, now])
  const { current, next } = useMemo(() => getCurrentAndNext(activities, now), [activities, now])
  const prog = dayProgress(activities)
  const streak = useMemo(() => computeStreak(state, today), [state, today])
  const allDone = activities.length > 0 && prog.done === prog.total

  const [undoInfo, setUndoInfo] = useState<{ blockId: string; title: string } | null>(null)
  const undoTimer = useRef<number | undefined>(undefined)
  const doCheckIn = (a: DayActivity) => {
    checkIn(a.block.id, today, now)
    setUndoInfo({ blockId: a.block.id, title: a.block.title })
    window.clearTimeout(undoTimer.current)
    undoTimer.current = window.setTimeout(() => setUndoInfo(null), 6000)
  }
  const doUndo = () => {
    if (undoInfo) undoCheckIn(undoInfo.blockId, today)
    setUndoInfo(null)
  }

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
          <div className="mt-[0.8vmin] text-[2.4vmin] text-muted capitalize">
            {formatDayLong(today)}
          </div>
        </div>
        <div className="flex items-center gap-[3vmin]">
          <DayRing prog={prog} />
          <div className="flex items-center gap-[1vmin]" title="Sequência de dias">
            <StreakFlame lit={streak > 0} size={56} />
            <span className={`text-[5vmin] font-bold tabular-nums ${streak > 0 ? '' : 'text-muted'}`}>
              {streak}
            </span>
          </div>
          <button
            onClick={revealNav}
            className="rounded-full p-[1.2vmin] text-muted/50 hover:text-paper"
            aria-label="Menu"
          >
            <Menu size={26} />
          </button>
        </div>
      </header>

      <main className="flex min-h-0 flex-1 items-center justify-center">
        {current ? (
          <CurrentCard a={current} now={now} next={next} onCheckIn={doCheckIn} />
        ) : (
          <IdleScreen activities={activities} next={next} allDone={allDone} prog={prog} streak={streak} />
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
          <Link to="/grade" className="flex items-center gap-2 rounded-full bg-ink-3 px-5 py-2.5 text-lg">
            <CalendarDays size={20} /> Grade
          </Link>
          <Link to="/objetivos" className="flex items-center gap-2 rounded-full bg-ink-3 px-5 py-2.5 text-lg">
            <Target size={20} /> Objetivos
          </Link>
        </div>
      )}

      {undoInfo && (
        <div className="fixed bottom-[3vmin] left-1/2 z-40 flex -translate-x-1/2 items-center gap-3 rounded-full bg-ink-2 px-5 py-3 shadow-2xl ring-1 ring-ink-3">
          <Check size={18} className="text-flame" />
          <span className="max-w-[40vw] truncate text-sm">{undoInfo.title} concluído</span>
          <button onClick={doUndo} className="flex items-center gap-1 text-sm font-semibold text-flame">
            <Undo2 size={16} /> Desfazer
          </button>
        </div>
      )}
    </div>
  )
}

function CurrentCard({
  a,
  now,
  next,
  onCheckIn,
}: {
  a: DayActivity
  now: Date
  next?: DayActivity
  onCheckIn: (a: DayActivity) => void
}) {
  const color = colorOf(a)
  const remaining = a.endMin - minutesOfDay(now)
  return (
    <div className="flex max-w-full flex-col items-center gap-[1.5vmin] text-center">
      <div className="text-[2.4vmin] font-semibold tracking-[0.3em] uppercase" style={{ color }}>
        {a.goal ? `Agora · ${a.goal.title}` : 'Agora · Obrigatória'}
      </div>
      <h1 className="max-w-[86vw] truncate text-[9vmin] leading-[1.1] font-extrabold">
        {a.goal ? `${a.goal.emoji} ` : ''}
        {a.block.title}
      </h1>
      <div className="text-[3.2vmin] text-muted tabular-nums">
        {a.block.start} – {a.block.end} ·{' '}
        <span className="font-semibold text-paper">{formatRemaining(remaining)}</span>
      </div>
      {a.status === 'done' ? (
        <div className="mt-[1vmin] flex flex-col items-center gap-[1vmin]">
          <div className="flex items-center gap-2 text-[3.5vmin] font-bold" style={{ color }}>
            <Check size={36} strokeWidth={3} /> Concluído
          </div>
          {next && <NextUpStrip next={next} />}
        </div>
      ) : (
        <>
          <button
            onClick={() => onCheckIn(a)}
            className="mt-[1.5vmin] rounded-full px-[6vmin] py-[2.2vmin] text-[3.5vmin] font-bold text-ink shadow-2xl transition-transform active:scale-95"
            style={{ backgroundColor: color }}
          >
            Concluir ✓
          </button>
          {next && <NextUpStrip next={next} />}
        </>
      )}
    </div>
  )
}

function NextUpStrip({ next }: { next: DayActivity }) {
  return (
    <div className="mt-[1vmin] text-[2.4vmin] text-muted">
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
}: {
  activities: DayActivity[]
  next?: DayActivity
  allDone: boolean
  prog: Ratio
  streak: number
}) {
  if (activities.length === 0) {
    return (
      <div className="flex flex-col items-center gap-[2vmin] text-center">
        <StreakFlame lit={false} size={100} />
        <h1 className="text-[5vmin] font-bold">Nenhum bloco hoje</h1>
        <p className="max-w-[60vw] text-[2.6vmin] text-muted">
          Monte sua grade semanal — como na escola: cada coisa no seu horário.
        </p>
        <Link
          to="/grade"
          className="rounded-full bg-flame px-[4vmin] py-[1.6vmin] text-[2.6vmin] font-bold text-ink"
        >
          Montar grade
        </Link>
      </div>
    )
  }
  if (allDone) {
    return (
      <div className="flex flex-col items-center gap-[2vmin] text-center">
        <StreakFlame lit size={140} />
        <h1 className="text-[7vmin] font-extrabold">Dia completo!</h1>
        <p className="text-[3vmin] text-muted">
          {prog.done} de {prog.total} atividades · sequência de{' '}
          <span className="font-bold text-flame">{streak} {streak === 1 ? 'dia' : 'dias'}</span>
        </p>
      </div>
    )
  }
  if (next) {
    return (
      <div className="flex flex-col items-center gap-[1.5vmin] text-center">
        <div className="text-[2.4vmin] font-semibold tracking-[0.3em] text-muted uppercase">
          Intervalo
        </div>
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
  const active = goals.filter((g) => !g.archivedAt)
  if (active.length === 0) return null

  const hasToday = new Set(activities.filter((a) => a.goal).map((a) => a.goal!.id))
  const sorted = [...active].sort((a, b) => Number(hasToday.has(b.id)) - Number(hasToday.has(a.id)))

  return (
    <div className="flex max-h-[26vmin] w-[34vmin] shrink-0 flex-col gap-[1.4vmin] overflow-y-auto" key={today}>
      {sorted.map((g) => {
        const total = goalTotalProgress(g)
        const day = goalDayProgress(activities, g.id)
        return (
          <div key={g.id}>
            <div className="flex items-baseline justify-between gap-2">
              <span className="truncate text-[2vmin] font-semibold">
                {g.emoji} {g.title}
              </span>
              <span className="shrink-0 text-[1.7vmin] text-muted tabular-nums">
                {day.total > 0 ? `hoje ${day.done}/${day.total} · ` : ''}
                {total === null ? '—' : `${Math.round(total * 100)}%`}
              </span>
            </div>
            <ProgressBar
              fraction={total ?? 0}
              color={GOAL_COLORS[g.color]}
              className="mt-[0.6vmin]"
            />
          </div>
        )
      })}
    </div>
  )
}

function DayRing({ prog }: { prog: Ratio }) {
  const size = 72
  const r = 30
  const c = 2 * Math.PI * r
  const fraction = prog.total === 0 ? 0 : prog.done / prog.total
  return (
    <div className="relative" title="Progresso do dia">
      <svg width={size} height={size} viewBox="0 0 72 72" className="-rotate-90">
        <circle cx="36" cy="36" r={r} fill="none" stroke="#292524" strokeWidth="7" />
        <circle
          cx="36"
          cy="36"
          r={r}
          fill="none"
          stroke="#f59e0b"
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - fraction)}
          className="transition-[stroke-dashoffset] duration-700"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center text-sm font-bold tabular-nums">
        {prog.done}/{prog.total}
      </div>
    </div>
  )
}
