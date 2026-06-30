import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, BookOpen, FileText, MessageSquare, ClipboardList } from 'lucide-react'
import Link from 'next/link'

export default async function StudentDashboard() {
  const user = await getCurrentUser()

  if (!user || user.role !== 'student') redirect('/dashboard')

  const studentData = user.studentData
  if (!studentData) redirect('/onboarding')

  const quickActions = [
    { title: 'Attendance', href: '/dashboard/student/attendance', icon: Calendar, color: 'text-blue-400', desc: 'View your attendance records' },
    { title: 'Homework', href: '/dashboard/student/homework', icon: BookOpen, color: 'text-green-400', desc: 'Check pending assignments' },
    { title: 'Results', href: '/dashboard/student/results', icon: FileText, color: 'text-purple-400', desc: 'View your exam results' },
    { title: 'Messages', href: '/dashboard/student/messages', icon: MessageSquare, color: 'text-orange-400', desc: 'Chat with teachers' },
    { title: 'Complaints', href: '/dashboard/student/complaints', icon: ClipboardList, color: 'text-red-400', desc: 'Submit or view complaints' },
    { title: 'Events', href: '/dashboard/student/events', icon: Calendar, color: 'text-indigo-400', desc: 'Upcoming school events' },
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
              <p className="text-sm text-muted-foreground">Student ID</p>
              <p className="font-semibold text-foreground">{studentData.studentId}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Class</p>
              <p className="font-semibold text-foreground">{studentData.class}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Section</p>
              <p className="font-semibold text-foreground">{studentData.section}</p>
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
