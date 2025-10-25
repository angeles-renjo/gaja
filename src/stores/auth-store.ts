import { create } from 'zustand'
import { createClient } from '@/lib/supabase/client'
import { jwtDecode } from 'jwt-decode'
import type { User, AuthChangeEvent, Session } from '@supabase/supabase-js'
import type { Profile, UserRole } from '@/types'

interface AuthState {
  user: User | null
  profile: Profile | null
  role: UserRole | null
  isLoading: boolean
  initialize: () => Promise<void>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  role: null,
  isLoading: true,

  initialize: async () => {
    const supabase = createClient()

    // Get initial session
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (session?.user) {
      const role = extractRoleFromJWT(session.access_token)
      const profile = await fetchProfile(session.user.id)
      set({
        user: session.user,
        profile,
        role,
        isLoading: false,
      })
    } else {
      set({ user: null, profile: null, role: null, isLoading: false })
    }

    // Listen for auth changes
    supabase.auth.onAuthStateChange(
      async (_event: AuthChangeEvent, session: Session | null) => {
        if (session?.user) {
          const role = extractRoleFromJWT(session.access_token)
          const profile = await fetchProfile(session.user.id)
          set({
            user: session.user,
            profile,
            role,
            isLoading: false,
          })
        } else {
          set({ user: null, profile: null, role: null, isLoading: false })
        }
      }
    )
  },

  signOut: async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    set({ user: null, profile: null, role: null })
  },

  refreshProfile: async () => {
    const { user } = get()
    if (user) {
      const profile = await fetchProfile(user.id)
      const supabase = createClient()
      const {
        data: { session },
      } = await supabase.auth.getSession()
      const role = session ? extractRoleFromJWT(session.access_token) : null
      set({ profile, role })
    }
  },
}))

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

// Helper function to fetch profile from database
async function fetchProfile(userId: string): Promise<Profile | null> {
  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      console.error('Failed to fetch profile:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Failed to fetch profile:', error)
    return null
  }
}
