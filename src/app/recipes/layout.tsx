import { requireRole } from '@/actions/auth'

export default async function RecipesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Server-side role check - admins and staff can access
  await requireRole(['admin', 'staff'])

  return <>{children}</>
}
