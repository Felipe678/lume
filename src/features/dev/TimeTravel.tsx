import { useState } from 'react'
import { Clock } from 'lucide-react'
import { useClock, useNow } from '../../store/useClock'

function toDatetimeLocal(d: Date): string {
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`
}

const MIN = 60_000
const HOUR = 60 * MIN
const DAY = 24 * HOUR

/** Controle de relógio para simular o dia — só existe em desenvolvimento. */
export default function TimeTravel() {
  const [open, setOpen] = useState(false)
  const devOffsetMs = useClock((s) => s.devOffsetMs)
  const travelMs = useClock((s) => s.travelMs)
  const travelTo = useClock((s) => s.travelTo)
  const resetTravel = useClock((s) => s.resetTravel)
  const now = useNow()

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className={`fixed bottom-3 left-3 z-50 rounded-full p-2.5 shadow-lg ${
          devOffsetMs !== 0 ? 'bg-flame text-ink' : 'bg-ink-3 text-muted'
        }`}
        title="Time travel (dev)"
      >
        <Clock size={18} />
      </button>
    )
  }

  const btn = 'rounded-lg bg-ink-3 px-2.5 py-1.5 text-xs hover:bg-ink-3/70'
  return (
    <div className="fixed bottom-3 left-3 z-50 w-64 rounded-2xl border border-ink-3 bg-ink-2 p-3 text-sm shadow-2xl">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-semibold text-muted">TIME TRAVEL (DEV)</span>
        <button onClick={() => setOpen(false)} className="text-muted hover:text-paper">
          ×
        </button>
      </div>
      <div className={`mb-2 font-mono text-sm ${devOffsetMs !== 0 ? 'text-flame' : ''}`}>
        {now.toLocaleString('pt-BR')}
      </div>
      <div className="mb-2 flex flex-wrap gap-1.5">
        <button className={btn} onClick={() => travelMs(15 * MIN)}>+15min</button>
        <button className={btn} onClick={() => travelMs(HOUR)}>+1h</button>
        <button className={btn} onClick={() => travelMs(DAY)}>+1 dia</button>
        <button className={btn} onClick={() => travelMs(-HOUR)}>−1h</button>
      </div>
      <input
        type="datetime-local"
        value={toDatetimeLocal(now)}
        onChange={(e) => {
          if (e.target.value) travelTo(new Date(e.target.value))
        }}
        className="mb-2 w-full rounded-lg bg-ink-3 px-2 py-1.5 text-xs"
      />
      <button
        onClick={resetTravel}
        className="w-full rounded-lg bg-flame/15 px-2 py-1.5 text-xs text-flame hover:bg-flame/25"
      >
        Voltar ao tempo real
      </button>
    </div>
  )
}
