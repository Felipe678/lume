import { create } from 'zustand'

/** Overlays globais (wizard e detalhe) — abertos de qualquer tela, nunca persistidos. */
interface Overlays {
  wizardOpen: boolean
  detailGoalId: string | null
  openWizard: () => void
  closeWizard: () => void
  openDetail: (goalId: string) => void
  closeDetail: () => void
}

export const useOverlays = create<Overlays>((set) => ({
  wizardOpen: false,
  detailGoalId: null,
  openWizard: () => set({ wizardOpen: true }),
  closeWizard: () => set({ wizardOpen: false }),
  openDetail: (detailGoalId) => set({ detailGoalId }),
  closeDetail: () => set({ detailGoalId: null }),
}))
