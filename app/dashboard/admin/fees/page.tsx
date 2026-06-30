import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { FeeManager } from "./fee-manager"

export default async function AdminFeesPage() {
  const user = await getCurrentUser()
  if (!user || user.role !== "admin") redirect("/dashboard")

  const students = await prisma.student.findMany({
    select: { id: true, studentId: true, fullName: true, class: true, section: true },
    orderBy: { fullName: "asc" },
  })

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <FeeManager students={students} />
    </div>
  )
}
