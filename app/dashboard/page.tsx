import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'

export default async function DashboardPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/sign-in')
  }

  // Redirect to role-specific dashboard
  if (user.role === 'student') {
    redirect('/dashboard/student')
  } else if (user.role === 'teacher') {
    redirect('/dashboard/teacher')
  } else if (user.role === 'admin') {
    redirect('/dashboard/admin')
  }

  // Fallback
  redirect('/onboarding')
}
