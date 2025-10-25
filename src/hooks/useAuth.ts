'use client'

import { useEffect } from 'react'
import { useAuthStore } from '@/stores/auth-store'

/**
 * Hook to access auth state and actions
 * Automatically initializes auth on first use
 */
export function useAuth() {
  const { user, profile, role, isLoading, initialize, signOut, refreshProfile } =
    useAuthStore()

  useEffect(() => {
    initialize()
  }, [initialize])

  return {
    user,
    profile,
    role,
    isLoading,
    isAuthenticated: !!user,
    signOut,
    refreshProfile,
  }
}
