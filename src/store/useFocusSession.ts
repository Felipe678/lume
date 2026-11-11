import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ISODate } from '../domain/types'
import type { ManualFocus } from '../domain/focusSession'

/**
 * Estado de sessão do APARELHO (foco manual, fechamento do dia, último anúncio de voz).
 * Chave própria, fora do AppState/export — sobrevive a reload do tablet sem poluir o sync.
 */
interface FocusSessionState {
  manualFocus: ManualFocus | null
  closedDay: ISODate | null
  /** âncora do último alerta anunciado — evita repetir voz/notificação após reload */
  lastAnnouncedKey: string | null
  /** dia em que o usuário acendeu a chama na abertura */
  startedDay: ISODate | null
  /** instante do primeiro clique na tela de abertura naquele dia */
  dayStartedAt: string | null
  /** último instante em que o app foi fechado/ocultado */
  lastClosedAt: string | null
  startManual: (mf: ManualFocus) => void
  clearManual: () => void
  closeDay: (date: ISODate) => void
  setAnnounced: (key: string) => void
  startDay: (date: ISODate, at: string) => void
  recordAppClosed: (at: string) => void
}

export const useFocusSession = create<FocusSessionState>()(
  persist(
    (set, get) => ({
      manualFocus: null,
      closedDay: null,
      lastAnnouncedKey: null,
      startedDay: null,
      dayStartedAt: null,
      lastClosedAt: null,
      startManual: (manualFocus) => set({ manualFocus }),
      clearManual: () => set({ manualFocus: null }),
      closeDay: (closedDay) => set({ closedDay }),
      setAnnounced: (lastAnnouncedKey) => set({ lastAnnouncedKey }),
      startDay: (date, at) => {
        // só o primeiro clique do dia conta — reaberturas não sobrescrevem
        if (get().startedDay === date) return
        set({ startedDay: date, dayStartedAt: at })
      },
      recordAppClosed: (lastClosedAt) => set({ lastClosedAt }),
    }),
    { name: 'lume:session', version: 2, migrate: (persisted) => persisted as FocusSessionState },
  ),
)
