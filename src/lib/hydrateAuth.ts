import { useAuthStore } from '@/features/auth/stores/authStore'

// 从 localStorage 恢复用户状态
export function hydrateAuth() {
  useAuthStore.getState().hydrate()
}
