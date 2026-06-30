import { NextRequest, NextResponse } from "next/server"
import { requireAnyRole } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  try {
    const user = await requireAnyRole(["student", "teacher", "admin"])
    const { searchParams } = new URL(req.url)
    const status = searchParams.get("status")
    const category = searchParams.get("category")

    const where: Record<string, unknown> = {}

    if (user.role === "student") {
      where.fromUserId = user.id
    } else if (user.role === "teacher") {
      where.OR = [{ assignedToId: user.id }, { toUserId: user.id }]
    }

    if (status) where.status = status
    if (category) where.category = category

    const records = await prisma.complaint.findMany({
      where,
      include: {
        fromUser: { select: { id: true, email: true } },
        toUser: { select: { id: true, email: true } },
        assignedTo: { select: { id: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({ records })
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("Unauthorized")) {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    console.error("Error fetching complaints:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAnyRole(["student", "teacher", "admin"])
    const body = await req.json()
    const { toUserId, category, message } = body

    if (!category || !message) {
      return NextResponse.json({ error: "Category and message are required" }, { status: 400 })
    }

    const validCategories = ["academic", "behavior", "facility", "other"]
    if (!validCategories.includes(category)) {
      return NextResponse.json({ error: "Invalid category" }, { status: 400 })
    }

    const complaint = await prisma.complaint.create({
      data: { fromUserId: user.id, toUserId: toUserId || null, category, message },
      include: { fromUser: { select: { id: true, email: true } } },
    })

    return NextResponse.json(complaint, { status: 201 })
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("Unauthorized")) {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    console.error("Error creating complaint:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
