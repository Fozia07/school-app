import { NextRequest, NextResponse } from "next/server"
import { requireAnyRole, requireRole } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  try {
    const user = await requireAnyRole(["student", "admin"])
    const { searchParams } = new URL(req.url)
    const studentId = searchParams.get("studentId")
    const term = searchParams.get("term")
    const paymentStatus = searchParams.get("paymentStatus")
    const limit = Math.min(Number(searchParams.get("limit")) || 50, 200)
    const page = Math.max(Number(searchParams.get("page")) || 1, 1)

    const where: Record<string, unknown> = {}

    if (user.role === "student") {
      const student = await prisma.student.findUnique({
        where: { userId: user.id },
        select: { id: true },
      })
      if (student) where.studentId = student.id
    }

    if (studentId) where.studentId = studentId
    if (term) where.term = term
    if (paymentStatus) where.paymentStatus = paymentStatus

    const [records, total] = await Promise.all([
      prisma.fee.findMany({
        where,
        include: { student: { select: { id: true, studentId: true, fullName: true, class: true, section: true } } },
        orderBy: [{ term: "desc" }, { dueDate: "desc" }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.fee.count({ where }),
    ])

    return NextResponse.json({ records, total, page, limit })
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("Unauthorized")) {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    console.error("Error fetching fees:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireRole("admin")
    const body = await req.json()
    const { studentId, term, amount, dueDate } = body

    if (!studentId || !term || !amount || !dueDate) {
      return NextResponse.json({ error: "Student ID, term, amount, and due date are required" }, { status: 400 })
    }

    const student = await prisma.student.findUnique({ where: { id: studentId } })
    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 })
    }

    const fee = await prisma.fee.create({
      data: {
        studentId,
        term,
        amount: Number(amount),
        dueDate: new Date(dueDate),
      },
      include: { student: { select: { id: true, studentId: true, fullName: true, class: true, section: true } } },
    })

    return NextResponse.json(fee, { status: 201 })
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("Unauthorized")) {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    console.error("Error creating fee:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
