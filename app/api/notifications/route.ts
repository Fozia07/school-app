import { NextRequest, NextResponse } from "next/server"
import { requireAnyRole } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const user = await requireAnyRole(["student", "teacher", "admin"])

    const records = await prisma.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 50,
    })

    const unread = records.filter((n) => !n.read).length

    return NextResponse.json({ records, unread })
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("Unauthorized")) {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    console.error("Error fetching notifications:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAnyRole(["student", "teacher", "admin"])
    const body = await req.json()
    const { userId, title, message, type } = body

    if (!userId || !title || !message || !type) {
      return NextResponse.json({ error: "User ID, title, message, and type are required" }, { status: 400 })
    }

    const notification = await prisma.notification.create({
      data: { userId, title, message, type },
    })

    return NextResponse.json(notification, { status: 201 })
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("Unauthorized")) {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    console.error("Error creating notification:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await requireAnyRole(["student", "teacher", "admin"])
    const body = await req.json()
    const { ids, markAll } = body

    if (markAll) {
      await prisma.notification.updateMany({
        where: { userId: user.id, read: false },
        data: { read: true },
      })
    } else if (ids && Array.isArray(ids)) {
      await prisma.notification.updateMany({
        where: { id: { in: ids }, userId: user.id },
        data: { read: true },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("Unauthorized")) {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    console.error("Error updating notifications:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
