import { NextRequest, NextResponse } from "next/server"
import { requireRole } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  try {
    await requireRole("admin")
    const { searchParams } = new URL(req.url)
    const className = searchParams.get("class")
    const section = searchParams.get("section")
    const from = searchParams.get("from")
    const to = searchParams.get("to")

    const studentWhere: Record<string, unknown> = {}
    if (className) studentWhere.class = className
    if (section) studentWhere.section = section

    const dateWhere: Record<string, unknown> = {}
    if (from) dateWhere.gte = new Date(from)
    if (to) dateWhere.lte = new Date(to + "T23:59:59.999Z")

    const students = await prisma.student.findMany({
      where: studentWhere,
      select: {
        id: true,
        studentId: true,
        fullName: true,
        class: true,
        section: true,
        attendance: {
          where: Object.keys(dateWhere).length > 0 ? { date: dateWhere } : undefined,
          select: { status: true, date: true },
        },
      },
      orderBy: { fullName: "asc" },
    })

    const stats = students.map((student) => {
      const total = student.attendance.length
      const present = student.attendance.filter((a) => a.status === "present").length
      const absent = student.attendance.filter((a) => a.status === "absent").length
      const late = student.attendance.filter((a) => a.status === "late").length
      const excused = student.attendance.filter((a) => a.status === "excused").length

      return {
        studentId: student.studentId,
        fullName: student.fullName,
        class: student.class,
        section: student.section,
        totalDays: total,
        present,
        absent,
        late,
        excused,
        percentage: total > 0 ? Math.round((present / total) * 100) : 0,
      }
    })

    const totals = stats.reduce(
      (acc, s) => ({
        totalStudents: acc.totalStudents + 1,
        totalDays: acc.totalDays + s.totalDays,
        totalPresent: acc.totalPresent + s.present,
        totalAbsent: acc.totalAbsent + s.absent,
        totalLate: acc.totalLate + s.late,
        totalExcused: acc.totalExcused + s.excused,
      }),
      { totalStudents: 0, totalDays: 0, totalPresent: 0, totalAbsent: 0, totalLate: 0, totalExcused: 0 }
    )

    return NextResponse.json({
      stats,
      totals,
      filters: { class: className || null, section: section || null, from: from || null, to: to || null },
    })
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("Unauthorized")) {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    console.error("Error generating attendance report:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
