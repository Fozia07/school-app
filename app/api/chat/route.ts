import { NextRequest, NextResponse } from "next/server"
import { requireAnyRole } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  try {
    const user = await requireAnyRole(["student", "teacher", "admin"])
    const { searchParams } = new URL(req.url)
    const withUserId = searchParams.get("withUserId")

    const where: Record<string, unknown> = {
      OR: [{ senderId: user.id }, { receiverId: user.id }],
    }

    if (withUserId) {
      where.OR = [
        { senderId: user.id, receiverId: withUserId },
        { senderId: withUserId, receiverId: user.id },
      ]
    }

    const messages = await prisma.chatMessage.findMany({
      where: where as { OR: Record<string, unknown>[] },
      include: {
        sender: { select: { id: true, email: true } },
        receiver: { select: { id: true, email: true } },
      },
      orderBy: { timestamp: "asc" },
      take: 100,
    })

    return NextResponse.json({ messages })
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("Unauthorized")) {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    console.error("Error fetching messages:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAnyRole(["student", "teacher", "admin"])
    const body = await req.json()
    const { receiverId, message } = body

    if (!receiverId || !message) {
      return NextResponse.json({ error: "Receiver and message are required" }, { status: 400 })
    }

    const msg = await prisma.chatMessage.create({
      data: { senderId: user.id, receiverId, message },
      include: {
        sender: { select: { id: true, email: true } },
        receiver: { select: { id: true, email: true } },
      },
    })

    return NextResponse.json(msg, { status: 201 })
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("Unauthorized")) {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    console.error("Error sending message:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
