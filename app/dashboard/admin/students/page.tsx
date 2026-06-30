import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { StudentManager } from "./student-manager"

export default async function AdminStudentsPage() {
  const user = await getCurrentUser()
  if (!user || user.role !== "admin") redirect("/dashboard")

  const students = await prisma.student.findMany({
    include: { user: { select: { email: true, createdAt: true } }, attendance: { select: { status: true } }, fees: { select: { paymentStatus: true } } },
    orderBy: { fullName: "asc" },
  })

  return <div className="p-4 sm:p-6 lg:p-8"><StudentManager students={students} /></div>
}
