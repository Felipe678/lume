import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type ChartStyle = 'bar' | 'donut'
export type StartScreen = 'home' | 'foco'

interface UiPrefs {
  chartStyle: ChartStyle
  startScreen: StartScreen
  setChartStyle: (style: ChartStyle) => void
  setStartScreen: (screen: StartScreen) => void
}

/**
 * Preferências do APARELHO — chave própria, fora do AppState de propósito:
 * não entram no export/import (o tablet da parede e o desktop podem divergir).
 */
export const useUiPrefs = create<UiPrefs>()(
  persist(
    (set) => ({
      chartStyle: 'bar',
      startScreen: 'home',
      setChartStyle: (chartStyle) => set({ chartStyle }),
      setStartScreen: (startScreen) => set({ startScreen }),
    }),
    { name: 'lume:ui', version: 1 },
  ),
)
