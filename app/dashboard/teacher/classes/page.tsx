import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, Users } from "lucide-react"

export default async function TeacherClassesPage() {
  const user = await getCurrentUser()
  if (!user || user.role !== "teacher") redirect("/dashboard")

  const teacher = await prisma.teacher.findUnique({
    where: { userId: user.id },
    select: { id: true, fullName: true, subject: true },
  })
  if (!teacher) redirect("/onboarding")

  const classes = await prisma.class.findMany({
    where: { teacherId: teacher.id },
    orderBy: [{ className: "asc" }, { section: "asc" }],
  })

  const studentCounts = await Promise.all(
    classes.map((c) =>
      prisma.student.count({ where: { class: c.className, section: c.section } })
    )
  )

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">My Classes</h1>
        <p className="text-muted-foreground mt-1">{teacher.fullName} &middot; {teacher.subject}</p>
      </div>

      {classes.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center py-12 text-muted-foreground">
            <BookOpen className="h-12 w-12 mb-3 opacity-30" />
            <p>No classes assigned yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {classes.map((c, idx) => (
            <Card key={c.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-lg">{c.className}</h3>
                    <p className="text-sm text-muted-foreground">Section {c.section}</p>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    {studentCounts[idx]}
                  </div>
                </div>
                {c.roomNumber && (
                  <p className="text-xs text-muted-foreground">Room: {c.roomNumber}</p>
                )}
                <div className="flex gap-2 mt-4">
                  <a href={`/dashboard/teacher/attendance?class=${c.className}&section=${c.section}`}
                    className="inline-flex items-center justify-center rounded-md text-xs font-medium h-8 px-3 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
                    Mark Attendance
                  </a>
                  <a href={`/dashboard/teacher/results?class=${c.className}&section=${c.section}`}
                    className="inline-flex items-center justify-center rounded-md text-xs font-medium h-8 px-3 border border-input bg-background hover:bg-accent transition-colors">
                    Upload Results
                  </a>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
