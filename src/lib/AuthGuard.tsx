import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/features/auth/stores/authStore'
import type { User } from '@/features/auth/types'

export default function AuthGuard({
  children,
  requiredRole,
}: {
  children: ReactNode
  requiredRole?: User['role']
}) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const user = useAuthStore((s) => s.user)
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // RBAC：指定 requiredRole 且当前用户角色不匹配时拒绝访问
  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/403" replace />
  }

  return <>{children}</>
}
