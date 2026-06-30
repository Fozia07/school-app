import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { OnboardingForm } from '@/components/onboarding-form'

export default async function OnboardingPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/sign-in')
  if (user.role && (user.studentData || user.teacherData || user.role === 'admin')) redirect('/dashboard')

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Welcome to School Management System</h1>
          <p className="text-muted-foreground">Let's set up your account</p>
        </div>
        <OnboardingForm userEmail={user.email} />
      </div>
    </div>
  )
}
