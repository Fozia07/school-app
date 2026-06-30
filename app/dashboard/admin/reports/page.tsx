import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Users, GraduationCap, DollarSign, Calendar, ClipboardCheck } from "lucide-react"

export default async function AdminReportsPage() {
  const user = await getCurrentUser()
  if (!user || user.role !== "admin") redirect("/dashboard")

  const [studentCount, teacherCount, classCount, attendanceCount, feeStats] = await Promise.all([
    prisma.student.count(),
    prisma.teacher.count(),
    prisma.class.count(),
    prisma.attendance.count(),
    prisma.fee.aggregate({ _sum: { amount: true, paidAmount: true } }),
  ])

  const presentCount = await prisma.attendance.count({ where: { status: "present" } })
  const absentCount = await prisma.attendance.count({ where: { status: "absent" } })

  const recentAttendance = await prisma.attendance.findMany({
    include: { student: { select: { fullName: true, class: true, section: true } } },
    orderBy: { date: "desc" },
    take: 10,
  })

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Reports</h1>
        <p className="text-muted-foreground mt-1">School-wide overview and statistics</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card><CardHeader className="pb-2"><CardTitle className="text-3xl font-bold text-center">{studentCount}</CardTitle></CardHeader><CardContent className="text-center text-sm pb-4"><Users className="h-3.5 w-3.5 inline mr-1" />Students</CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-3xl font-bold text-center">{teacherCount}</CardTitle></CardHeader><CardContent className="text-center text-sm pb-4"><GraduationCap className="h-3.5 w-3.5 inline mr-1" />Teachers</CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-3xl font-bold text-center">{classCount}</CardTitle></CardHeader><CardContent className="text-center text-sm pb-4"><BarChart className="h-3.5 w-3.5 inline mr-1" />Classes</CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-3xl font-bold text-center">{attendanceCount}</CardTitle></CardHeader><CardContent className="text-center text-sm pb-4"><ClipboardCheck className="h-3.5 w-3.5 inline mr-1" />Attendance Records</CardContent></Card>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader><CardTitle>Attendance Overview</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Present</span>
                <span className="text-sm font-medium text-green-400">{presentCount}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Absent</span>
                <span className="text-sm font-medium text-red-400">{absentCount}</span>
              </div>
              <div className="flex justify-between items-center border-t border-border pt-2">
                <span className="text-sm font-medium">Total</span>
                <span className="text-sm font-medium">{attendanceCount}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Fee Summary</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total Fees</span>
                <span className="text-sm font-medium">${(feeStats._sum.amount || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Collected</span>
                <span className="text-sm font-medium text-green-400">${(feeStats._sum.paidAmount || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center border-t border-border pt-2">
                <span className="text-sm font-medium">Outstanding</span>
                <span className="text-sm font-medium text-red-400">${((feeStats._sum.amount || 0) - (feeStats._sum.paidAmount || 0)).toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Quick Actions</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <a href="/dashboard/admin/attendance" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors p-2 rounded-lg hover:bg-muted/30">
              <ClipboardCheck className="h-4 w-4" /> View Attendance Report
            </a>
            <a href="/dashboard/admin/fees" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors p-2 rounded-lg hover:bg-muted/30">
              <DollarSign className="h-4 w-4" /> Manage Fee Records
            </a>
            <a href="/dashboard/admin/events" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors p-2 rounded-lg hover:bg-muted/30">
              <Calendar className="h-4 w-4" /> Schedule Event
            </a>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Recent Attendance</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 px-3 font-medium text-muted-foreground">Student</th>
                  <th className="text-left py-2 px-3 font-medium text-muted-foreground">Class</th>
                  <th className="text-center py-2 px-3 font-medium text-muted-foreground">Date</th>
                  <th className="text-center py-2 px-3 font-medium text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentAttendance.map((a) => (
                  <tr key={a.id} className="border-b border-border/50 hover:bg-muted/30">
                    <td className="py-2 px-3">{a.student.fullName}</td>
                    <td className="py-2 px-3 text-muted-foreground">{a.student.class}{a.student.section ? `-${a.student.section}` : ""}</td>
                    <td className="py-2 px-3 text-center">{new Date(a.date).toLocaleDateString()}</td>
                    <td className="py-2 px-3 text-center">
                      <span className={`text-xs font-medium uppercase ${
                        a.status === "present" ? "text-green-400" : a.status === "absent" ? "text-red-400" : a.status === "late" ? "text-amber-400" : "text-blue-400"
                      }`}>{a.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
