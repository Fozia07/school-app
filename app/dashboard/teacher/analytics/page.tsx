import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Users, ClipboardCheck, BookOpen } from "lucide-react"

export default async function TeacherAnalyticsPage() {
  const user = await getCurrentUser()
  if (!user || user.role !== "teacher") redirect("/dashboard")

  const teacher = await prisma.teacher.findUnique({
    where: { userId: user.id },
    select: { id: true, fullName: true },
  })
  if (!teacher) redirect("/onboarding")

  const classes = await prisma.class.findMany({
    where: { teacherId: teacher.id },
    select: { className: true, section: true },
  })

  const classNames = classes.map((c) => ({ class: c.className, section: c.section }))

  const [studentCount, homeworkCount, attendanceCount] = await Promise.all([
    Promise.all(classNames.map((c) => prisma.student.count({ where: { class: c.class, section: c.section } }))),
    prisma.homework.count({ where: { teacherId: teacher.id } }),
    prisma.attendance.count({ where: { markedById: teacher.id } }),
  ])

  const totalStudents = studentCount.reduce((a, b) => a + b, 0)
  const avgClassSize = classes.length > 0 ? Math.round(totalStudents / classes.length) : 0

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground mt-1">Your teaching statistics at a glance</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-3xl font-bold text-center">{classes.length}</CardTitle>
          </CardHeader>
          <CardContent className="text-center text-sm pb-4">
            <BarChart className="h-3.5 w-3.5 inline mr-1" />Classes
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-3xl font-bold text-center">{totalStudents}</CardTitle>
          </CardHeader>
          <CardContent className="text-center text-sm pb-4">
            <Users className="h-3.5 w-3.5 inline mr-1" />Students
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-3xl font-bold text-center">{avgClassSize}</CardTitle>
          </CardHeader>
          <CardContent className="text-center text-sm pb-4">
            <Users className="h-3.5 w-3.5 inline mr-1" />Avg Class Size
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-3xl font-bold text-center">{homeworkCount}</CardTitle>
          </CardHeader>
          <CardContent className="text-center text-sm pb-4">
            <BookOpen className="h-3.5 w-3.5 inline mr-1" />Homework Assigned
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle>Class Breakdown</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {classes.map((c, idx) => (
                <div key={`${c.className}-${c.section}`} className="flex justify-between items-center">
                  <span className="text-sm">{c.className} - {c.section}</span>
                  <span className="text-sm font-medium">{studentCount[idx]} students</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Attendance Activity</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Records marked by you</span>
                <span className="text-sm font-medium">{attendanceCount}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Homework assigned</span>
                <span className="text-sm font-medium">{homeworkCount}</span>
              </div>
              <div className="flex justify-between items-center border-t border-border pt-2">
                <span className="text-sm font-medium">Total Classes</span>
                <span className="text-sm font-medium">{classes.length}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
