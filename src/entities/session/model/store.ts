import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

const ADMIN_USERNAME = 'admin'
const ADMIN_PASSWORD = 'admin'

export interface SignInResult {
  ok: boolean
  error?: string
}

export interface SessionState {
  isAuthenticated: boolean
  username: string | null
  signIn: (username: string, password: string) => SignInResult
  signOut: () => void
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      username: null,
      signIn: (username, password) => {
        if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
          set({ isAuthenticated: true, username })
          return { ok: true }
        }
        return { ok: false, error: '아이디 또는 비밀번호가 올바르지 않습니다.' }
      },
      signOut: () => set({ isAuthenticated: false, username: null }),
    }),
    {
      name: 'domain-pack-builder-session',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (s) => ({
        isAuthenticated: s.isAuthenticated,
        username: s.username,
      }),
      version: 1,
    },
  ),
)
