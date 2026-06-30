import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Award } from "lucide-react"

const gradeColors: Record<string, string> = {
  "A+": "text-green-400",
  "A": "text-green-300",
  "B+": "text-blue-400",
  "B": "text-blue-300",
  "C": "text-amber-400",
  "D": "text-orange-400",
  "F": "text-red-400",
}

export default async function StudentResultsPage() {
  const user = await getCurrentUser()
  if (!user || user.role !== "student") redirect("/dashboard")

  const student = await prisma.student.findUnique({
    where: { userId: user.id },
    select: { id: true, fullName: true, class: true, section: true },
  })
  if (!student) redirect("/onboarding")

  const records = await prisma.result.findMany({
    where: { studentId: student.id },
    include: { subject: { select: { name: true, code: true } } },
    orderBy: [{ examDate: "desc" }, { subject: { name: "asc" } }],
  })

  const examTypes = [...new Set(records.map((r) => r.examType))]
  const grouped = examTypes.map((type) => ({
    examType: type,
    results: records.filter((r) => r.examType === type),
  }))

  const avgPct = records.length > 0
    ? Math.round(records.reduce((sum, r) => sum + (r.marksObtained / r.totalMarks) * 100, 0) / records.length)
    : 0

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">My Results</h1>
        <p className="text-muted-foreground mt-1">{student.fullName}</p>
      </div>

      {records.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl font-bold text-center">{records.length}</CardTitle>
            </CardHeader>
            <CardContent className="text-center text-sm text-muted-foreground pb-4">Subjects</CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl font-bold text-center">{examTypes.length}</CardTitle>
            </CardHeader>
            <CardContent className="text-center text-sm text-muted-foreground pb-4">Exam Types</CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className={`text-2xl font-bold text-center ${avgPct >= 60 ? "text-green-400" : avgPct >= 40 ? "text-amber-400" : "text-red-400"}`}>
                {avgPct}%
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center text-sm text-muted-foreground pb-4">Average</CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl font-bold text-center text-purple-400">
                {records.reduce((best, r) => {
                  const pct = (r.marksObtained / r.totalMarks) * 100
                  return pct > best.pct ? { pct, grade: r.grade || "—" } : best
                }, { pct: 0, grade: "—" }).grade}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center text-sm text-muted-foreground pb-4">Best Grade</CardContent>
          </Card>
        </div>
      )}

      {records.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center py-12 text-muted-foreground">
            <FileText className="h-12 w-12 mb-3 opacity-30" />
            <p>No results uploaded yet</p>
          </CardContent>
        </Card>
      ) : (
        grouped.map((group) => (
          <Card key={group.examType}>
            <CardHeader>
              <CardTitle className="capitalize">{group.examType}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 px-3 font-medium text-muted-foreground">Subject</th>
                      <th className="text-right py-2 px-3 font-medium text-muted-foreground">Marks</th>
                      <th className="text-center py-2 px-3 font-medium text-muted-foreground">Grade</th>
                      <th className="text-left py-2 px-3 font-medium text-muted-foreground">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {group.results.map((r) => (
                      <tr key={r.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                        <td className="py-2.5 px-3 font-medium">{r.subject.name}</td>
                        <td className="py-2.5 px-3 text-right">{r.marksObtained}/{r.totalMarks}</td>
                        <td className="py-2.5 px-3 text-center">
                          <span className={`font-bold ${r.grade ? gradeColors[r.grade] || "" : ""}`}>{r.grade || "—"}</span>
                        </td>
                        <td className="py-2.5 px-3 text-muted-foreground">
                          {r.examDate ? new Date(r.examDate).toLocaleDateString() : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  )
}
