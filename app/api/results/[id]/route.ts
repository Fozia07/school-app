import { NextRequest, NextResponse } from "next/server"
import { requireRole } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireRole("teacher")
    const { id } = await params
    const body = await req.json()
    const { marksObtained, totalMarks, examDate } = body

    const existing = await prisma.result.findUnique({ where: { id } })
    if (!existing) return NextResponse.json({ error: "Result not found" }, { status: 404 })

    const total = totalMarks || existing.totalMarks
    const marks = marksObtained !== undefined ? Number(marksObtained) : existing.marksObtained
    const pct = (marks / Number(total)) * 100
    let grade = "F"
    if (pct >= 90) grade = "A+"
    else if (pct >= 80) grade = "A"
    else if (pct >= 70) grade = "B+"
    else if (pct >= 60) grade = "B"
    else if (pct >= 50) grade = "C"
    else if (pct >= 40) grade = "D"

    const result = await prisma.result.update({
      where: { id },
      data: {
        ...(marksObtained !== undefined && { marksObtained: marks }),
        ...(totalMarks !== undefined && { totalMarks: Number(totalMarks) }),
        grade,
        ...(examDate !== undefined && { examDate: examDate ? new Date(examDate) : null }),
      },
      include: { student: { select: { id: true, studentId: true, fullName: true } }, subject: { select: { id: true, name: true, code: true } } },
    })

    return NextResponse.json(result)
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("Unauthorized")) {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    console.error("Error updating result:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
