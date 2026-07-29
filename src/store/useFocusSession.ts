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
  startManual: (mf: ManualFocus) => void
  clearManual: () => void
  closeDay: (date: ISODate) => void
  setAnnounced: (key: string) => void
}

export const useFocusSession = create<FocusSessionState>()(
  persist(
    (set) => ({
      manualFocus: null,
      closedDay: null,
      lastAnnouncedKey: null,
      startManual: (manualFocus) => set({ manualFocus }),
      clearManual: () => set({ manualFocus: null }),
      closeDay: (closedDay) => set({ closedDay }),
      setAnnounced: (lastAnnouncedKey) => set({ lastAnnouncedKey }),
    }),
    { name: 'lume:session', version: 1 },
  ),
)
