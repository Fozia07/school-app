import { NextRequest, NextResponse } from "next/server"
import { requireAnyRole, requireRole } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { AttendanceStatus } from "@prisma/client"

export async function GET(req: NextRequest) {
  try {
    const user = await requireAnyRole(["student", "teacher", "admin"])
    const { searchParams } = new URL(req.url)
    const studentId = searchParams.get("studentId")
    const className = searchParams.get("class")
    const section = searchParams.get("section")
    const date = searchParams.get("date")
    const from = searchParams.get("from")
    const to = searchParams.get("to")
    const limit = Math.min(Number(searchParams.get("limit")) || 50, 200)
    const page = Math.max(Number(searchParams.get("page")) || 1, 1)

    const where: Record<string, unknown> = {}

    if (user.role === "student") {
      where.student = { userId: user.id }
    }

    if (studentId) {
      where.studentId = studentId
    }

    if (date) {
      const d = new Date(date)
      where.date = {
        gte: new Date(d.setHours(0, 0, 0, 0)),
        lte: new Date(d.setHours(23, 59, 59, 999)),
      }
    } else if (from || to) {
      where.date = {}
      if (from) (where.date as Record<string, Date>).gte = new Date(from)
      if (to) (where.date as Record<string, Date>).lte = new Date(to + "T23:59:59.999Z")
    }

    if (className) {
      where.student = { ...(where.student as Record<string, unknown> || {}), class: className }
    }
    if (section) {
      where.student = { ...(where.student as Record<string, unknown> || {}), section }
    }

    const [records, total] = await Promise.all([
      prisma.attendance.findMany({
        where,
        include: {
          student: { select: { id: true, studentId: true, fullName: true, class: true, section: true } },
          markedBy: { select: { id: true, fullName: true } },
        },
        orderBy: { date: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.attendance.count({ where }),
    ])

    return NextResponse.json({ records, total, page, limit })
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("Unauthorized")) {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    console.error("Error fetching attendance:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAnyRole(["teacher", "admin"])
    const body = await req.json()
    const { records, date: reqDate } = body

    if (!records || !Array.isArray(records) || records.length === 0) {
      return NextResponse.json({ error: "Records array is required" }, { status: 400 })
    }

    if (!reqDate) {
      return NextResponse.json({ error: "Date is required" }, { status: 400 })
    }

    const date = new Date(reqDate)
    if (isNaN(date.getTime())) {
      return NextResponse.json({ error: "Invalid date" }, { status: 400 })
    }

    const validStatuses = Object.values(AttendanceStatus)
    const teacher = await prisma.teacher.findUnique({ where: { userId: user.id } })

    const results = await Promise.all(
      records.map((record: { studentId: string; status: string; remarks?: string }) => {
        if (!record.studentId || !record.status) {
          return Promise.reject(new Error("Each record needs studentId and status"))
        }
        if (!validStatuses.includes(record.status as AttendanceStatus)) {
          return Promise.reject(new Error(`Invalid status: ${record.status}`))
        }

        return prisma.attendance.upsert({
          where: {
            studentId_date: {
              studentId: record.studentId,
              date,
            },
          },
          update: {
            status: record.status as AttendanceStatus,
            markedById: teacher?.id || null,
            remarks: record.remarks || null,
          },
          create: {
            studentId: record.studentId,
            date,
            status: record.status as AttendanceStatus,
            markedById: teacher?.id || null,
            remarks: record.remarks || null,
          },
        })
      })
    )

    return NextResponse.json({ success: true, count: results.length })
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("Unauthorized")) {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    console.error("Error marking attendance:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
