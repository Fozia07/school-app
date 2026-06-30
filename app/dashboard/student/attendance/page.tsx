import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, Clock, AlertTriangle } from "lucide-react"

const statusConfig = {
  present: { icon: CheckCircle, label: "Present", className: "text-green-400 bg-green-500/10" },
  absent: { icon: XCircle, label: "Absent", className: "text-red-400 bg-red-500/10" },
  late: { icon: Clock, label: "Late", className: "text-amber-400 bg-amber-500/10" },
  excused: { icon: AlertTriangle, label: "Excused", className: "text-blue-400 bg-blue-500/10" },
} as const

export default async function StudentAttendancePage() {
  const user = await getCurrentUser()
  if (!user || user.role !== "student") redirect("/dashboard")

  const student = await prisma.student.findUnique({
    where: { userId: user.id },
    select: { id: true, studentId: true, fullName: true, class: true, section: true },
  })
  if (!student) redirect("/onboarding")

  const records = await prisma.attendance.findMany({
    where: { studentId: student.id },
    orderBy: { date: "desc" },
    take: 100,
  })

  const total = records.length
  const present = records.filter((r) => r.status === "present").length
  const absent = records.filter((r) => r.status === "absent").length
  const late = records.filter((r) => r.status === "late").length
  const excused = records.filter((r) => r.status === "excused").length
  const percentage = total > 0 ? Math.round((present / total) * 100) : 0

  const stats = [
    { label: "Present", value: present, percentage, color: "text-green-400" },
    { label: "Absent", value: absent, percentage, color: "text-red-400" },
    { label: "Late", value: late, percentage, color: "text-amber-400" },
    { label: "Excused", value: excused, percentage, color: "text-blue-400" },
  ]

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">My Attendance</h1>
        <p className="text-muted-foreground mt-1">
          {student.fullName} &middot; {student.class}{student.section ? ` - ${student.section}` : ""}
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-3xl font-bold text-center">{percentage}%</CardTitle>
          </CardHeader>
          <CardContent className="text-center text-sm text-muted-foreground pb-4">Attendance Rate</CardContent>
        </Card>
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="pb-2">
              <CardTitle className={`text-3xl font-bold text-center ${stat.color}`}>{stat.value}</CardTitle>
            </CardHeader>
            <CardContent className="text-center text-sm text-muted-foreground pb-4">{stat.label}</CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Records</CardTitle>
        </CardHeader>
        <CardContent>
          {records.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">No attendance records yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 px-3 font-medium text-muted-foreground">Date</th>
                    <th className="text-left py-2 px-3 font-medium text-muted-foreground">Status</th>
                    <th className="text-left py-2 px-3 font-medium text-muted-foreground">Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((record) => {
                    const config = statusConfig[record.status as keyof typeof statusConfig]
                    const Icon = config.icon
                    return (
                      <tr key={record.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                        <td className="py-2.5 px-3">
                          {new Date(record.date).toLocaleDateString("en-US", {
                            weekday: "short",
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </td>
                        <td className="py-2.5 px-3">
                          <Badge variant="outline" className={config.className}>
                            <Icon className="h-3 w-3 mr-1" />
                            {config.label}
                          </Badge>
                        </td>
                        <td className="py-2.5 px-3 text-muted-foreground">{record.remarks || "—"}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
