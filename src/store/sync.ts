import { create } from 'zustand'
import { apiFetch } from '../lib/api'
import { validateAppState } from '../domain/validate'
import type { AppState } from '../domain/types'
import { selectAppState, storageAvailable, useAppStore } from './useAppStore'
import { useAuth } from './useAuth'

export type SyncStatus = 'guest' | 'saving' | 'saved' | 'offline' | 'conflict' | 'error'

interface SyncState {
  status: SyncStatus
  lastSyncAt: string | null
  setStatus: (status: SyncStatus, lastSyncAt?: string) => void
}

export const useSyncStatus = create<SyncState>((set) => ({
  status: useAuth.getState().token ? 'saved' : 'guest',
  lastSyncAt: null,
  setStatus: (status, lastSyncAt) =>
    set((s) => ({ status, lastSyncAt: lastSyncAt ?? s.lastSyncAt })),
}))

// baseUpdatedAt compartilhado entre abas via localStorage (edge 59)
const BASE_KEY = 'lume:sync'
export const getBaseUpdatedAt = (): string | null =>
  storageAvailable ? localStorage.getItem(BASE_KEY) : null
export const setBaseUpdatedAt = (v: string | null) => {
  if (!storageAvailable) return
  if (v === null) localStorage.removeItem(BASE_KEY)
  else localStorage.setItem(BASE_KEY, v)
}

interface StatePayload {
  data: unknown
  updatedAt: string
}

let debounceTimer: number | undefined
let suppressNext = false

/** Adota um estado vindo do servidor sem re-disparar upload. */
function adoptServerState(state: AppState, updatedAt: string) {
  suppressNext = true
  useAppStore.getState().replaceState(state)
  setBaseUpdatedAt(updatedAt)
}

async function upload() {
  const { token } = useAuth.getState()
  const set = useSyncStatus.getState().setStatus
  if (!token) {
    set('guest')
    return
  }
  set('saving')
  try {
    const res = await apiFetch<StatePayload | { error?: string }>('/state', {
      method: 'PUT',
      token,
      body: { data: selectAppState(useAppStore.getState()), baseUpdatedAt: getBaseUpdatedAt() },
    })
    if (res.status === 200) {
      const updatedAt = (res.body as { updatedAt: string }).updatedAt
      setBaseUpdatedAt(updatedAt)
      set('saved', updatedAt)
      return
    }
    if (res.status === 409) {
      // outro aparelho salvou depois: backup local + adota a versão do servidor (edge 52)
      const payload = res.body as StatePayload
      try {
        localStorage.setItem('lume:backup:conflict', JSON.stringify(selectAppState(useAppStore.getState())))
      } catch {
        // sem storage — segue
      }
      const check = validateAppState(payload.data)
      if (!check.ok) {
        set('error') // nunca aplicar estado inválido (edge 57)
        return
      }
      adoptServerState(check.state, payload.updatedAt)
      set('conflict', payload.updatedAt)
      return
    }
    if (res.status === 401) {
      useAuth.getState().logout() // sessão expirada (edge 50) — dados locais intactos
      set('guest')
      return
    }
    set('error')
  } catch {
    set('offline') // sem internet: nada se perde, tenta no próximo change (edge 51)
  }
}

function scheduleUpload() {
  window.clearTimeout(debounceTimer)
  debounceTimer = window.setTimeout(() => void upload(), 2000)
}

/** Envia AGORA com uma base específica (fluxo de primeira sincronização). */
export async function forcePush(baseUpdatedAt: string | null): Promise<boolean> {
  setBaseUpdatedAt(baseUpdatedAt)
  await upload()
  return useSyncStatus.getState().status === 'saved'
}

/** Baixa e adota o estado do servidor (fluxo de login/primeira sincronização). */
export function adoptFromServer(payload: StatePayload): boolean {
  const check = validateAppState(payload.data)
  if (!check.ok) return false
  adoptServerState(check.state, payload.updatedAt)
  useSyncStatus.getState().setStatus('saved', payload.updatedAt)
  return true
}

/** Liga o sync local-first: toda mudança de dados agenda um PUT debounced. */
export function startSync() {
  useAppStore.subscribe((state, prev) => {
    if (
      state.goals === prev.goals &&
      state.blocks === prev.blocks &&
      state.checkIns === prev.checkIns &&
      state.rewards === prev.rewards &&
      state.profile === prev.profile &&
      state.workSchedule === prev.workSchedule
    ) {
      return
    }
    if (suppressNext) {
      suppressNext = false
      return
    }
    scheduleUpload()
  })
  // sessão existente: reconcilia com o servidor já na abertura
  if (useAuth.getState().token) void upload()
}
