import { create } from 'zustand'
import type { User } from '@/features/auth/types'
import { logger } from '@/lib/logger'

const STORAGE_KEY = '__mall_user__'

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  login: (username: string, role?: User['role']) => void
  logout: () => void
  hydrate: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,

  login: (username: string, role: User['role'] = 'user') => {
    const token = `token_${Date.now()}`
    const user: User = { id: '1', username, token, role }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
    set({ user, isAuthenticated: true })
  },

  logout: () => {
    localStorage.removeItem(STORAGE_KEY)
    set({ user: null, isAuthenticated: false })
  },

  hydrate: () => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (!saved) return
    try {
      const parsed = JSON.parse(saved) as User
      // 兼容旧数据：历史 localStorage 中没有 role 字段时降级为 user
      const user: User = { ...parsed, role: parsed.role ?? 'user' }
      set({ user, isAuthenticated: true })
    } catch {
      // 数据损坏时清理并登出，避免启动即白屏（S5 review F3）
      logger.warn('[auth] localStorage 中的用户数据已损坏，已清除')
      localStorage.removeItem(STORAGE_KEY)
      set({ user: null, isAuthenticated: false })
    }
  },
}))
