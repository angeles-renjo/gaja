import { requireRole } from '@/actions/auth'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Server-side role check - only admins can access
  await requireRole(['admin'])

  return <>{children}</>
}
