'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { jwtDecode } from 'jwt-decode'
import type { Profile, UserRole } from '@/types'

interface UserWithProfile {
  id: string
  email: string
  profile: Profile | null
  role: UserRole | null
}

/**
 * Sign in with email and password
 * IMPORTANT: Call cookies() before any Supabase calls to opt out of Next.js caching
 */
export async function signInAction(
  prevState: { error: string } | null,
  formData: FormData
) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { error: 'Email and password are required' }
  }

  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  // Redirect to home page on success
  redirect('/')
}

/**
 * Sign out the current user
 */
export async function signOutAction() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

/**
 * Get current user with profile (use this in Server Components)
 * IMPORTANT: Always use getUser() not getSession() for security
 */
export async function getCurrentUser(): Promise<UserWithProfile | null> {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    return null
  }

  // Fetch profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Get role from JWT
  const {
    data: { session },
  } = await supabase.auth.getSession()
  const role = session ? extractRoleFromJWT(session.access_token) : null

  return {
    id: user.id,
    email: user.email || '',
    profile,
    role,
  }
}

/**
 * Require authentication - throws redirect if not authenticated
 */
export async function requireAuth(): Promise<UserWithProfile> {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  return user
}

/**
 * Require specific role - throws redirect if user doesn't have the role
 */
export async function requireRole(
  allowedRoles: UserRole[]
): Promise<UserWithProfile> {
  const user = await requireAuth()

  if (!user.role || !allowedRoles.includes(user.role)) {
    redirect('/')
  }

  return user
}

/**
 * Check if user has a specific role
 */
export async function hasRole(role: UserRole): Promise<boolean> {
  const user = await getCurrentUser()
  return user?.role === role
}

// Helper function to extract role from JWT
function extractRoleFromJWT(token: string): UserRole | null {
  try {
    const decoded = jwtDecode<{ user_role?: UserRole }>(token)
    return decoded.user_role || null
  } catch (error) {
    console.error('Failed to decode JWT:', error)
    return null
  }
}
