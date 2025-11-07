'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { requireRole, getCurrentUser } from '@/actions/auth'
import { revalidatePath } from 'next/cache'
import type { UserRole } from '@/types'

interface UserWithProfile {
  id: string
  email: string
  role: UserRole
  created_at: string
}

/**
 * Get all staff and admin users
 * Only admins can access this
 */
export async function getUsersAction(): Promise<{
  users?: UserWithProfile[]
  error?: string
}> {
  try {
    // Ensure only admins can access
    await requireRole(['admin'])

    // Use admin client to bypass RLS and fetch all profiles
    const adminClient = createAdminClient()

    // Fetch all profiles with staff or admin role
    const { data: profiles, error } = await adminClient
      .from('profiles')
      .select('id, role, created_at')
      .in('role', ['admin', 'staff'])
      .order('created_at', { ascending: false })

    if (error) {
      return { error: error.message }
    }

    // Get auth users to get emails
    const { data: authData, error: authError } =
      await adminClient.auth.admin.listUsers()

    if (authError) {
      return { error: authError.message }
    }

    // Combine profiles with auth user emails
    const users: UserWithProfile[] = profiles
      .map((profile) => {
        const authUser = authData.users.find((u) => u.id === profile.id)
        if (!authUser) return null

        return {
          id: profile.id,
          email: authUser.email || '',
          role: profile.role,
          created_at: profile.created_at,
        }
      })
      .filter((u): u is UserWithProfile => u !== null)

    return { users }
  } catch (err) {
    console.error('Failed to fetch users:', err)
    return { error: 'Failed to fetch users' }
  }
}

/**
 * Create a new staff or admin user
 * Only admins can access this
 */
export async function createUserAction(
  _prevState: { error?: string; success?: boolean } | null,
  formData: FormData
) {
  try {
    // Ensure only admins can access
    await requireRole(['admin'])

    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const role = formData.get('role') as UserRole

    // Validation
    if (!email || !password || !role) {
      return { error: 'Email, password, and role are required' }
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return { error: 'Invalid email format' }
    }

    if (!['admin', 'staff'].includes(role)) {
      return { error: 'Invalid role. Must be admin or staff' }
    }

    if (password.length < 6) {
      return { error: 'Password must be at least 6 characters' }
    }

    // Create user using admin client
    const adminClient = createAdminClient()

    const { data, error } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email
    })

    if (error) {
      return { error: error.message }
    }

    if (!data.user) {
      return { error: 'Failed to create user' }
    }

    // Update the user's role in profiles table using admin client
    const { error: profileError } = await adminClient
      .from('profiles')
      .update({ role })
      .eq('id', data.user.id)

    if (profileError) {
      // If profile update fails, delete the auth user to maintain consistency
      await adminClient.auth.admin.deleteUser(data.user.id)
      return { error: 'Failed to set user role' }
    }

    // Revalidate the users page
    revalidatePath('/admin/users')

    return { success: true }
  } catch (err) {
    console.error('Failed to create user:', err)
    return { error: 'Failed to create user' }
  }
}

/**
 * Delete a user
 * Only admins can access this
 */
export async function deleteUserAction(userId: string): Promise<{
  error?: string
  success?: boolean
}> {
  try {
    // Ensure only admins can access
    await requireRole(['admin'])

    if (!userId) {
      return { error: 'User ID is required' }
    }

    // Prevent admin from deleting their own account
    const currentUser = await getCurrentUser()
    if (currentUser?.id === userId) {
      return { error: 'Cannot delete your own account' }
    }

    // Delete user using admin client
    const adminClient = createAdminClient()
    const { error } = await adminClient.auth.admin.deleteUser(userId)

    if (error) {
      return { error: error.message }
    }

    // Revalidate the users page
    revalidatePath('/admin/users')

    return { success: true }
  } catch (err) {
    console.error('Failed to delete user:', err)
    return { error: 'Failed to delete user' }
  }
}
