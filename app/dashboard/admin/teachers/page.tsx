import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { TeacherManager } from "./teacher-manager"

export default async function AdminTeachersPage() {
  const user = await getCurrentUser()
  if (!user || user.role !== "admin") redirect("/dashboard")

  const teachers = await prisma.teacher.findMany({
    include: { user: { select: { email: true } }, classes: { select: { className: true, section: true } } },
    orderBy: { fullName: "asc" },
  })

  return <div className="p-4 sm:p-6 lg:p-8"><TeacherManager teachers={teachers} /></div>
}
