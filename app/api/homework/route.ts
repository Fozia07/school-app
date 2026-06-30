import { NextRequest, NextResponse } from "next/server"
import { requireAnyRole, requireRole } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  try {
    const user = await requireAnyRole(["student", "teacher", "admin"])
    const { searchParams } = new URL(req.url)
    const className = searchParams.get("class")
    const section = searchParams.get("section")
    const subject = searchParams.get("subject")
    const limit = Math.min(Number(searchParams.get("limit")) || 50, 200)
    const page = Math.max(Number(searchParams.get("page")) || 1, 1)

    const where: Record<string, unknown> = {}

    if (user.role === "student") {
      const student = await prisma.student.findUnique({
        where: { userId: user.id },
        select: { class: true, section: true },
      })
      if (student) {
        where.class = student.class
        where.section = student.section
      }
    }

    if (user.role === "teacher") {
      const teacher = await prisma.teacher.findUnique({
        where: { userId: user.id },
        select: { id: true },
      })
      if (teacher) where.teacherId = teacher.id
    }

    if (className) where.class = className
    if (section) where.section = section
    if (subject) where.subject = subject

    const [records, total] = await Promise.all([
      prisma.homework.findMany({
        where,
        include: { teacher: { select: { id: true, fullName: true } } },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.homework.count({ where }),
    ])

    return NextResponse.json({ records, total, page, limit })
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("Unauthorized")) {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    console.error("Error fetching homework:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireRole("teacher")
    const teacher = await prisma.teacher.findUnique({ where: { userId: user.id } })
    if (!teacher) {
      return NextResponse.json({ error: "Teacher profile not found" }, { status: 404 })
    }

    const body = await req.json()
    const { class: className, section, subject, title, description, dueDate, attachmentUrl } = body

    if (!className || !section || !subject || !title) {
      return NextResponse.json({ error: "Class, section, subject, and title are required" }, { status: 400 })
    }

    const homework = await prisma.homework.create({
      data: {
        teacherId: teacher.id,
        class: className,
        section,
        subject,
        title,
        description: description || null,
        dueDate: dueDate ? new Date(dueDate) : null,
        attachmentUrl: attachmentUrl || null,
      },
      include: { teacher: { select: { id: true, fullName: true } } },
    })

    return NextResponse.json(homework, { status: 201 })
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("Unauthorized")) {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    console.error("Error creating homework:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
