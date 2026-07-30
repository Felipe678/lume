import { useState } from 'react'
import { BriefcaseBusiness, Check } from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'
import { useNow } from '../../store/useClock'
import { toISODate } from '../../domain/dates'
import { validateWorkSchedule } from '../../domain/validate'
import type { WorkSchedule } from '../../domain/work'
import type { Weekday } from '../../domain/types'
import { DAY_LABELS, DAY_ORDER } from '../grade/GradePage'

const inputClass = 'rounded-lg bg-ink-3 px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-flame'

/** Rotina de trabalho — o app respeita essa disponibilidade nas sugestões de encaixe. */
export default function WorkScheduleEditor() {
  const workSchedule = useAppStore((s) => s.workSchedule)
  const setWorkSchedule = useAppStore((s) => s.setWorkSchedule)
  const now = useNow()

  const [mode, setMode] = useState<WorkSchedule['mode']>(workSchedule.mode)
  const [weekdays, setWeekdays] = useState<Weekday[]>(
    workSchedule.mode === 'weekly' ? workSchedule.weekdays : [1, 2, 3, 4, 5],
  )
  const [daysOn, setDaysOn] = useState(workSchedule.mode === 'rotation' ? String(workSchedule.daysOn) : '1')
  const [daysOff, setDaysOff] = useState(workSchedule.mode === 'rotation' ? String(workSchedule.daysOff) : '1')
  const [anchorDate, setAnchorDate] = useState(
    workSchedule.mode === 'rotation' ? workSchedule.anchorDate : toISODate(now),
  )
  const [start, setStart] = useState(workSchedule.mode !== 'none' ? workSchedule.start : '08:00')
  const [end, setEnd] = useState(workSchedule.mode !== 'none' ? workSchedule.end : '18:00')
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  const build = (): WorkSchedule => {
    if (mode === 'none') return { mode: 'none' }
    if (mode === 'weekly') return { mode: 'weekly', weekdays, start, end }
    return {
      mode: 'rotation',
      daysOn: Number(daysOn),
      daysOff: Number(daysOff),
      anchorDate,
      start,
      end,
    }
  }

  const save = () => {
    const ws = build()
    const err = validateWorkSchedule(ws)
    setError(err)
    if (err) return
    setWorkSchedule(ws)
    setSaved(true)
    window.setTimeout(() => setSaved(false), 2500)
  }

  const toggleDay = (d: Weekday) =>
    setWeekdays((ws) => (ws.includes(d) ? ws.filter((w) => w !== d) : [...ws, d].sort()))

  const pill = (active: boolean) =>
    `rounded-full px-3 py-1.5 text-xs font-semibold ${active ? 'bg-flame text-ink' : 'bg-ink-3 text-muted hover:text-paper'}`

  return (
    <section className="mt-6 rounded-2xl border border-ink-3 bg-ink-2/60 p-5">
      <h2 className="mb-1 flex items-center gap-1.5 text-sm font-semibold tracking-widest text-muted uppercase">
        <BriefcaseBusiness size={14} /> Minha rotina de trabalho
      </h2>
      <p className="mb-3 text-xs text-muted">
        O Lume encaixa seus objetivos em volta do trabalho — plantão, 12x36, seg–sex, o que for.
      </p>

      <div className="flex gap-2">
        <button className={pill(mode === 'none')} onClick={() => setMode('none')}>
          Sem escala
        </button>
        <button className={pill(mode === 'weekly')} onClick={() => setMode('weekly')}>
          Semanal fixa
        </button>
        <button className={pill(mode === 'rotation')} onClick={() => setMode('rotation')}>
          Escala cíclica
        </button>
      </div>

      {mode === 'weekly' && (
        <div className="mt-3 flex flex-col gap-2">
          <div className="flex gap-1">
            {DAY_ORDER.map((d) => (
              <button
                key={d}
                onClick={() => toggleDay(d)}
                className={`flex-1 rounded-lg py-1.5 text-xs font-semibold ${
                  weekdays.includes(d) ? 'bg-flame text-ink' : 'bg-ink-3 text-muted hover:text-paper'
                }`}
              >
                {DAY_LABELS[d]}
              </button>
            ))}
          </div>
        </div>
      )}

      {mode === 'rotation' && (
        <div className="mt-3 flex flex-col gap-2 text-sm">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-muted">Preset:</span>
            <button
              className={pill(daysOn === '1' && daysOff === '1')}
              onClick={() => {
                setDaysOn('1')
                setDaysOff('1')
              }}
            >
              12x36 (1 trabalha / 1 folga)
            </button>
            <button
              className={pill(daysOn === '1' && daysOff === '3')}
              onClick={() => {
                setDaysOn('1')
                setDaysOff('3')
              }}
            >
              24x72
            </button>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <label className="flex items-center gap-1.5">
              trabalha
              <input type="number" min={1} className={`${inputClass} w-16`} value={daysOn} onChange={(e) => setDaysOn(e.target.value)} />
              dia(s)
            </label>
            <label className="flex items-center gap-1.5">
              folga
              <input type="number" min={1} className={`${inputClass} w-16`} value={daysOff} onChange={(e) => setDaysOff(e.target.value)} />
              dia(s)
            </label>
            <label className="flex items-center gap-1.5">
              próximo plantão:
              <input type="date" className={inputClass} value={anchorDate} onChange={(e) => setAnchorDate(e.target.value)} />
            </label>
          </div>
        </div>
      )}

      {mode !== 'none' && (
        <div className="mt-3 flex items-center gap-2 text-sm">
          <span className="text-muted">Horário:</span>
          <input type="time" step={300} className={inputClass} value={start} onChange={(e) => setStart(e.target.value)} />
          <span className="text-muted">até</span>
          <input type="time" step={300} className={inputClass} value={end} onChange={(e) => setEnd(e.target.value)} />
          <span className="text-xs text-muted">(fim antes do início = turno vira a noite)</span>
        </div>
      )}

      {error && <p className="mt-2 rounded-lg bg-red-950/50 p-2 text-xs text-red-300">{error}</p>}

      <button
        onClick={save}
        className="mt-3 flex items-center gap-1.5 rounded-full bg-flame px-4 py-2 text-sm font-bold text-ink"
      >
        {saved ? (
          <>
            <Check size={16} /> Salvo!
          </>
        ) : (
          'Salvar rotina de trabalho'
        )}
      </button>
    </section>
  )
}
