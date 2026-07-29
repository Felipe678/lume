import { useEffect, useMemo, useState } from 'react'
import { create } from 'zustand'

interface ClockState {
  epoch: number
  /** Time travel de desenvolvimento — só muda em import.meta.env.DEV. */
  devOffsetMs: number
  tick: () => void
  travelMs: (ms: number) => void
  travelTo: (date: Date) => void
  resetTravel: () => void
}

export const useClock = create<ClockState>((set) => ({
  epoch: Date.now(),
  devOffsetMs: 0,
  tick: () => set({ epoch: Date.now() }),
  travelMs: (ms) => {
    if (!import.meta.env.DEV) return
    set((s) => ({ devOffsetMs: s.devOffsetMs + ms, epoch: Date.now() }))
  },
  travelTo: (date) => {
    if (!import.meta.env.DEV) return
    set({ devOffsetMs: date.getTime() - Date.now(), epoch: Date.now() })
  },
  resetTravel: () => set({ devOffsetMs: 0, epoch: Date.now() }),
}))

/** Fonte única de "agora" — componentes nunca chamam new Date() direto no render. */
export function useNow(): Date {
  const epoch = useClock((s) => s.epoch)
  const devOffsetMs = useClock((s) => s.devOffsetMs)
  return useMemo(() => new Date(epoch + devOffsetMs), [epoch, devOffsetMs])
}

/**
 * "Agora" com precisão de segundo — só para o temporizador do modo Foco.
 * O interval de 1s existe apenas enquanto `active`; o resto do app segue no tick de 10s.
 */
export function useSecondsNow(active: boolean): Date {
  const devOffsetMs = useClock((s) => s.devOffsetMs)
  const [now, setNow] = useState(() => new Date(Date.now() + devOffsetMs))
  useEffect(() => {
    setNow(new Date(Date.now() + devOffsetMs))
    if (!active) return
    const update = () => setNow(new Date(Date.now() + devOffsetMs))
    const id = setInterval(update, 1000)
    const onVisibility = () => {
      if (!document.hidden) update()
    }
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      clearInterval(id)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [active, devOffsetMs])
  return now
}

const TICK_MS = 10_000

export function startClock() {
  useClock.getState().tick()
  setInterval(() => useClock.getState().tick(), TICK_MS)
  // tablets suspendem timers em segundo plano — ao voltar, tick imediato
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) useClock.getState().tick()
  })
}
