import { useMemo } from 'react'
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

const TICK_MS = 10_000

export function startClock() {
  useClock.getState().tick()
  setInterval(() => useClock.getState().tick(), TICK_MS)
  // tablets suspendem timers em segundo plano — ao voltar, tick imediato
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) useClock.getState().tick()
  })
}
