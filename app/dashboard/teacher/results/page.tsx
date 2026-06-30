import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { ResultUploader } from "./result-uploader"

export default async function TeacherResultsPage() {
  const user = await getCurrentUser()
  if (!user || user.role !== "teacher") redirect("/dashboard")

  const teacher = await prisma.teacher.findUnique({
    where: { userId: user.id },
    select: { id: true },
  })
  if (!teacher) redirect("/onboarding")

  const classes = await prisma.class.findMany({
    where: { teacherId: teacher.id },
    select: { className: true, section: true },
    orderBy: [{ className: "asc" }, { section: "asc" }],
  })

  const subjects = await prisma.subject.findMany({ orderBy: { name: "asc" } })

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <ResultUploader classes={classes} subjects={subjects} />
    </div>
  )
}
