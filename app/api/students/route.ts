import { NextRequest, NextResponse } from "next/server"
import { requireAnyRole } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  try {
    await requireAnyRole(["student", "teacher", "admin"])
    const { searchParams } = new URL(req.url)
    const className = searchParams.get("class")
    const section = searchParams.get("section")
    const studentId = searchParams.get("studentId")

    const where: Record<string, unknown> = {}
    if (className) where.class = className
    if (section) where.section = section
    if (studentId) where.studentId = { contains: studentId }

    const students = await prisma.student.findMany({
      where,
      select: {
        id: true,
        studentId: true,
        fullName: true,
        class: true,
        section: true,
      },
      orderBy: { fullName: "asc" },
    })

    return NextResponse.json(students)
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("Unauthorized")) {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    console.error("Error fetching students:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
