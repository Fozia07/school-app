import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, ClipboardCheck, BookOpen, FileText, MessageSquare, BarChart } from 'lucide-react'
import Link from 'next/link'

export default async function TeacherDashboard() {
  const user = await getCurrentUser()

  if (!user || user.role !== 'teacher') redirect('/dashboard')

  const teacherData = user.teacherData
  if (!teacherData) redirect('/onboarding')

  const quickActions = [
    { title: 'My Classes', href: '/dashboard/teacher/classes', icon: Users, color: 'text-blue-400', desc: 'View assigned classes' },
    { title: 'Mark Attendance', href: '/dashboard/teacher/attendance', icon: ClipboardCheck, color: 'text-green-400', desc: 'Take student attendance' },
    { title: 'Homework', href: '/dashboard/teacher/homework', icon: BookOpen, color: 'text-purple-400', desc: 'Create and manage homework' },
    { title: 'Upload Results', href: '/dashboard/teacher/results', icon: FileText, color: 'text-orange-400', desc: 'Enter exam results' },
    { title: 'Complaints', href: '/dashboard/teacher/complaints', icon: MessageSquare, color: 'text-red-400', desc: 'View and respond to complaints' },
    { title: 'Analytics', href: '/dashboard/teacher/analytics', icon: BarChart, color: 'text-indigo-400', desc: 'View class performance' },
  ]

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Your Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Teacher ID</p>
              <p className="font-semibold text-foreground">{teacherData.teacherId}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Subject</p>
              <p className="font-semibold text-foreground">{teacherData.subject}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Qualification</p>
              <p className="font-semibold text-foreground">{teacherData.qualification || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-semibold text-sm text-foreground">{user.email}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {quickActions.map((action) => {
          const Icon = action.icon
          return (
            <Link key={action.title} href={action.href}>
              <Card className="hover:shadow-lg hover:shadow-black/20 transition-shadow cursor-pointer h-full">
                <CardHeader>
                  <Icon className={`h-10 w-10 ${action.color} mb-2`} />
                  <CardTitle>{action.title}</CardTitle>
                  <CardDescription>{action.desc}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          )
        })}
      </div>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Your latest updates and notifications</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center py-8 text-muted-foreground">No recent activity to display</p>
        </CardContent>
      </Card>
    </div>
  )
}
