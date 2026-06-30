import { NextRequest, NextResponse } from "next/server"
import { requireAnyRole, requireRole } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  try {
    await requireAnyRole(["student", "admin"])
    const { searchParams } = new URL(req.url)
    const audience = searchParams.get("audience")

    const where: Record<string, unknown> = {}
    if (audience) where.audience = audience

    const records = await prisma.event.findMany({
      where,
      orderBy: { eventDate: "asc" },
    })

    return NextResponse.json({ records })
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("Unauthorized")) {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    console.error("Error fetching events:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireRole("admin")
    const body = await req.json()
    const { title, description, eventDate, eventTime, location, organizer, audience } = body

    if (!title || !eventDate) {
      return NextResponse.json({ error: "Title and event date are required" }, { status: 400 })
    }

    const event = await prisma.event.create({
      data: {
        title,
        description: description || null,
        eventDate: new Date(eventDate),
        eventTime: eventTime || null,
        location: location || null,
        organizer: organizer || null,
        audience: audience || "all",
      },
    })

    return NextResponse.json(event, { status: 201 })
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("Unauthorized")) {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    console.error("Error creating event:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
