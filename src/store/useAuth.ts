import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AuthState {
  token: string | null
  /** uuid do usuário — o tenant */
  userId: string | null
  email: string | null
  setSession: (s: { token: string; userId: string; email: string }) => void
  logout: () => void
}

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      userId: null,
      email: null,
      setSession: ({ token, userId, email }) => set({ token, userId, email }),
      logout: () => set({ token: null, userId: null, email: null }),
    }),
    { name: 'lume:auth', version: 1 },
  ),
)

export const isAuthed = () => useAuth.getState().token !== null
