import { createClient } from '@supabase/supabase-js'

/**
 * Supabase Admin Client
 * Uses service role key for admin operations (bypasses RLS)
 * ONLY use this in Server Actions - NEVER expose to client
 */
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceRole) {
    throw new Error(
      'Missing Supabase environment variables. Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set.'
    )
  }

  return createClient(supabaseUrl, supabaseServiceRole, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
