import { NextRequest, NextResponse } from "next/server"
import { requireAnyRole, requireRole } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  try {
    const user = await requireAnyRole(["student", "teacher", "admin"])
    const { searchParams } = new URL(req.url)
    const studentId = searchParams.get("studentId")
    const subjectId = searchParams.get("subjectId")
    const examType = searchParams.get("examType")

    const where: Record<string, unknown> = {}

    if (user.role === "student") {
      const student = await prisma.student.findUnique({ where: { userId: user.id }, select: { id: true } })
      if (student) where.studentId = student.id
    }
    if (studentId) where.studentId = studentId
    if (subjectId) where.subjectId = subjectId
    if (examType) where.examType = examType

    const records = await prisma.result.findMany({
      where,
      include: {
        student: { select: { id: true, studentId: true, fullName: true, class: true, section: true } },
        subject: { select: { id: true, name: true, code: true } },
      },
      orderBy: [{ examDate: "desc" }, { subject: { name: "asc" } }],
    })

    return NextResponse.json({ records })
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("Unauthorized")) {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    console.error("Error fetching results:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireRole("teacher")
    const body = await req.json()
    const { studentId, subjectCode, examType, marksObtained, totalMarks, examDate } = body

    if (!studentId || !subjectCode || !examType || marksObtained === undefined) {
      return NextResponse.json({ error: "Student ID, subject code, exam type, and marks are required" }, { status: 400 })
    }

    const subject = await prisma.subject.findUnique({ where: { code: subjectCode } })
    if (!subject) {
      return NextResponse.json({ error: "Subject not found" }, { status: 404 })
    }

    const total = totalMarks || 100
    const pct = (Number(marksObtained) / Number(total)) * 100
    let grade = "F"
    if (pct >= 90) grade = "A+"
    else if (pct >= 80) grade = "A"
    else if (pct >= 70) grade = "B+"
    else if (pct >= 60) grade = "B"
    else if (pct >= 50) grade = "C"
    else if (pct >= 40) grade = "D"

    const result = await prisma.result.upsert({
      where: { studentId_subjectId_examType: { studentId, subjectId: subject.id, examType } },
      update: { marksObtained: Number(marksObtained), totalMarks: Number(total), grade, examDate: examDate ? new Date(examDate) : null },
      create: { studentId, subjectId: subject.id, examType, marksObtained: Number(marksObtained), totalMarks: Number(total), grade, examDate: examDate ? new Date(examDate) : null },
      include: { student: { select: { id: true, studentId: true, fullName: true } }, subject: { select: { id: true, name: true, code: true } } },
    })

    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("Unauthorized")) {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    if (error instanceof Error && error.message.includes("Unique constraint")) {
      return NextResponse.json({ error: "Result already exists for this student/subject/exam. Use PUT to update." }, { status: 409 })
    }
    console.error("Error creating result:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
