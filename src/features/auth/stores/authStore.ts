import { create } from 'zustand'
import type { User } from '@/features/auth/types'

const STORAGE_KEY = '__mall_user__'

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  login: (username: string) => void
  logout: () => void
  hydrate: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,

  login: (username: string) => {
    const token = `token_${Date.now()}`
    const user: User = { id: '1', username, token }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
    set({ user, isAuthenticated: true })
  },

  logout: () => {
    localStorage.removeItem(STORAGE_KEY)
    set({ user: null, isAuthenticated: false })
  },

  hydrate: () => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      const user = JSON.parse(saved) as User
      set({ user, isAuthenticated: true })
    }
  },
}))
