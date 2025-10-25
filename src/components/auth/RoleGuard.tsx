'use client'

import { useAuth } from '@/hooks/useAuth'
import type { UserRole } from '@/types'

interface RoleGuardProps {
  children: React.ReactNode
  roles: UserRole[]
  fallback?: React.ReactNode
}

/**
 * Client-side component to show/hide UI based on user role
 * NOTE: This is for UX only, NOT for security. Always enforce permissions server-side.
 */
export function RoleGuard({ children, roles, fallback = null }: RoleGuardProps) {
  const { role, isLoading } = useAuth()

  if (isLoading) {
    return null
  }

  if (!role || !roles.includes(role)) {
    return <>{fallback}</>
  }

  return <>{children}</>
}
