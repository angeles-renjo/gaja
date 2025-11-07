'use client'

import { useEffect, useState, useActionState } from 'react'
import { getUsersAction, createUserAction, deleteUserAction } from '@/actions/users'
import type { UserRole } from '@/types'

interface User {
  id: string
  email: string
  role: UserRole
  created_at: string
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null)

  const [formState, formAction, formPending] = useActionState(
    createUserAction,
    null
  )

  // Fetch users on mount
  useEffect(() => {
    loadUsers()
  }, [])

  // Reload users when form succeeds
  useEffect(() => {
    if (formState?.success) {
      loadUsers()
      setShowForm(false)
    }
  }, [formState])

  async function loadUsers() {
    setLoading(true)
    setError(null)
    const result = await getUsersAction()
    if (result.error) {
      setError(result.error)
    } else {
      setUsers(result.users || [])
    }
    setLoading(false)
  }

  async function handleDelete(userId: string) {
    if (!confirm('Are you sure you want to delete this user?')) return

    setDeleteLoading(userId)
    const result = await deleteUserAction(userId)
    setDeleteLoading(null)

    if (result.error) {
      alert(result.error)
    } else {
      loadUsers()
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="mt-2 text-gray-600">
            Manage staff and admin accounts
          </p>
        </div>

        {/* Add User Button */}
        <div className="mb-6">
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          >
            {showForm ? 'Cancel' : '+ Add User'}
          </button>
        </div>

        {/* Add User Form */}
        {showForm && (
          <div className="mb-8 bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Create New User
            </h2>

            <form action={formAction} className="space-y-4">
              {formState?.error && (
                <div className="rounded-md bg-red-50 p-4">
                  <p className="text-sm text-red-800">{formState.error}</p>
                </div>
              )}

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  disabled={formPending}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-100"
                  placeholder="user@example.com"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700"
                >
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  disabled={formPending}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-100"
                  placeholder="Minimum 6 characters"
                />
              </div>

              <div>
                <label
                  htmlFor="role"
                  className="block text-sm font-medium text-gray-700"
                >
                  Role
                </label>
                <select
                  id="role"
                  name="role"
                  required
                  disabled={formPending}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-100"
                >
                  <option value="">Select a role</option>
                  <option value="staff">Staff</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={formPending}
                className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {formPending ? 'Creating...' : 'Create User'}
              </button>
            </form>
          </div>
        )}

        {/* Users Table */}
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-500">
              Loading users...
            </div>
          ) : error ? (
            <div className="p-8 text-center text-red-600">{error}</div>
          ) : users.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No users found. Create your first user above.
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          user.role === 'admin'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleDelete(user.id)}
                        disabled={deleteLoading === user.id}
                        className="text-red-600 hover:text-red-900 disabled:text-gray-400 disabled:cursor-not-allowed"
                      >
                        {deleteLoading === user.id ? 'Deleting...' : 'Delete'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
