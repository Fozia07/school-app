import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, Calendar, Clock, User } from "lucide-react"

export default async function StudentHomeworkPage() {
  const user = await getCurrentUser()
  if (!user || user.role !== "student") redirect("/dashboard")

  const student = await prisma.student.findUnique({
    where: { userId: user.id },
    select: { id: true, fullName: true, class: true, section: true },
  })
  if (!student) redirect("/onboarding")

  const records = await prisma.homework.findMany({
    where: { class: student.class, section: student.section },
    include: { teacher: { select: { fullName: true } } },
    orderBy: [{ dueDate: "asc" }, { createdAt: "desc" }],
  })

  const now = new Date()
  const overdue = records.filter((r) => r.dueDate && new Date(r.dueDate) < now)
  const upcoming = records.filter((r) => !r.dueDate || new Date(r.dueDate) >= now)

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Homework</h1>
        <p className="text-muted-foreground mt-1">{student.class}{student.section ? ` - ${student.section}` : ""}</p>
      </div>

      {overdue.length > 0 && (
        <div>
          <h2 className="text-sm font-medium text-red-400 mb-3">Overdue ({overdue.length})</h2>
          <div className="grid gap-3">
            {overdue.map((hw) => (
              <Card key={hw.id} className="border-red-500/20">
                <CardContent className="p-4">
                  <h3 className="font-semibold">{hw.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {hw.subject} &middot; {hw.teacher.fullName}
                  </p>
                  {hw.description && (
                    <p className="text-sm text-muted-foreground/80 mt-1 line-clamp-2">{hw.description}</p>
                  )}
                  <div className="flex items-center gap-3 mt-2 text-xs text-red-400">
                    <Clock className="h-3 w-3" />
                    Due {new Date(hw.dueDate!).toLocaleDateString()}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      <div>
        <h2 className="text-sm font-medium text-muted-foreground mb-3">
          {upcoming.length > 0 ? `Upcoming (${upcoming.length})` : ""}
        </h2>
        {records.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center py-12 text-muted-foreground">
              <BookOpen className="h-12 w-12 mb-3 opacity-30" />
              <p>No homework assigned yet</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3">
            {upcoming.map((hw) => (
              <Card key={hw.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1 min-w-0">
                      <h3 className="font-semibold">{hw.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {hw.subject} &middot; {hw.teacher.fullName}
                      </p>
                      {hw.description && (
                        <p className="text-sm text-muted-foreground/80 mt-1 line-clamp-2">{hw.description}</p>
                      )}
                      <div className="flex flex-wrap gap-3 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Posted {new Date(hw.createdAt).toLocaleDateString()}
                        </span>
                        {hw.dueDate && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Due {new Date(hw.dueDate).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
