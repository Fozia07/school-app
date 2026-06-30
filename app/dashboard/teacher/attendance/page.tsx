import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { AttendanceMarker } from "./attendance-marker"

export default async function TeacherAttendancePage() {
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
    orderBy: [{ className: "asc" }, { section: "asc" }],
  })

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <AttendanceMarker classes={classes} teacherId={teacher.id} />
    </div>
  )
}
