import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type ChartStyle = 'bar' | 'donut'
export type StartScreen = 'home' | 'foco'

interface UiPrefs {
  chartStyle: ChartStyle
  startScreen: StartScreen
  /** anunciar início/fim de atividade por voz (SpeechSynthesis) */
  voiceEnabled: boolean
  /** notificações do navegador no início/fim de atividade */
  notificationsEnabled: boolean
  setChartStyle: (style: ChartStyle) => void
  setStartScreen: (screen: StartScreen) => void
  setVoiceEnabled: (on: boolean) => void
  setNotificationsEnabled: (on: boolean) => void
}

/**
 * Preferências do APARELHO — chave própria, fora do AppState de propósito:
 * não entram no export/import (o tablet fala, o celular não; cada um decide).
 */
export const useUiPrefs = create<UiPrefs>()(
  persist(
    (set) => ({
      chartStyle: 'bar',
      startScreen: 'home',
      voiceEnabled: false,
      notificationsEnabled: false,
      setChartStyle: (chartStyle) => set({ chartStyle }),
      setStartScreen: (startScreen) => set({ startScreen }),
      setVoiceEnabled: (voiceEnabled) => set({ voiceEnabled }),
      setNotificationsEnabled: (notificationsEnabled) => set({ notificationsEnabled }),
    }),
    { name: 'lume:ui', version: 2, migrate: (persisted) => persisted as UiPrefs },
  ),
)
