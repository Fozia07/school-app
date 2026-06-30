import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { AttendanceReport } from "./attendance-report"

export default async function AdminAttendancePage() {
  const user = await getCurrentUser()
  if (!user || user.role !== "admin") redirect("/dashboard")

  const classes = await prisma.class.findMany({
    select: { className: true, section: true },
    distinct: ["className", "section"],
    orderBy: [{ className: "asc" }, { section: "asc" }],
  })

  const uniqueClasses = [...new Set(classes.map((c) => c.className))]

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <AttendanceReport classes={uniqueClasses} sectionsByClass={classes} />
    </div>
  )
}
