import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, GraduationCap, DollarSign, Calendar, AlertCircle, BarChart } from 'lucide-react'
import Link from 'next/link'

export default async function AdminDashboard() {
  const user = await getCurrentUser()

  if (!user || user.role !== 'admin') redirect('/dashboard')

  const [studentCount, teacherCount] = await Promise.all([
    prisma.student.count(),
    prisma.teacher.count(),
  ])

  const pendingFees = await prisma.fee.aggregate({
    _sum: { amount: true },
    where: { paymentStatus: { in: ['pending', 'partial'] } },
  })

  const openComplaints = await prisma.complaint.count({
    where: { status: { in: ['pending', 'in_progress'] } },
  })

  const stats = [
    { title: 'Total Students', value: studentCount, icon: Users, color: 'text-blue-400', desc: 'Active students' },
    { title: 'Total Teachers', value: teacherCount, icon: GraduationCap, color: 'text-green-400', desc: 'Active teachers' },
    { title: 'Pending Fees', value: `$${pendingFees._sum.amount?.toFixed(0) || '0'}`, icon: DollarSign, color: 'text-purple-400', desc: 'Outstanding payments' },
    { title: 'Open Complaints', value: openComplaints, icon: AlertCircle, color: 'text-red-400', desc: 'Pending resolution' },
  ]

  const quickActions = [
    { title: 'Manage Students', href: '/dashboard/admin/students', icon: Users, color: 'text-blue-400', desc: 'Add, edit, or remove students' },
    { title: 'Manage Teachers', href: '/dashboard/admin/teachers', icon: GraduationCap, color: 'text-green-400', desc: 'Add, edit, or remove teachers' },
    { title: 'Fee Management', href: '/dashboard/admin/fees', icon: DollarSign, color: 'text-purple-400', desc: 'Track and manage fees' },
    { title: 'Events', href: '/dashboard/admin/events', icon: Calendar, color: 'text-orange-400', desc: 'Schedule school events' },
    { title: 'Complaints', href: '/dashboard/admin/complaints', icon: AlertCircle, color: 'text-red-400', desc: 'Review and resolve complaints' },
    { title: 'Reports', href: '/dashboard/admin/reports', icon: BarChart, color: 'text-indigo-400', desc: 'Generate school reports' },
  ]

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                <p className="text-xs text-muted-foreground">{stat.desc}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

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
          <CardDescription>Latest system updates and notifications</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center py-8 text-muted-foreground">No recent activity to display</p>
        </CardContent>
      </Card>
    </div>
  )
}
