import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { DashboardShell } from '@/components/dashboard/dashboard-shell'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/sign-in')
  }

  if (!user.role || (!user.studentData && !user.teacherData && user.role !== 'admin')) {
    redirect('/onboarding')
  }

  return (
    <DashboardShell role={user.role}>
      {children}
    </DashboardShell>
  )
}
