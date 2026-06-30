import { NextRequest, NextResponse } from "next/server"
import { requireRole } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireRole("admin")
    const { id } = await params
    const body = await req.json()
    const { title, description, eventDate, eventTime, location, organizer, audience } = body

    const existing = await prisma.event.findUnique({ where: { id } })
    if (!existing) return NextResponse.json({ error: "Event not found" }, { status: 404 })

    const updateData: Record<string, unknown> = {}
    if (title) updateData.title = title
    if (description !== undefined) updateData.description = description
    if (eventDate) updateData.eventDate = new Date(eventDate)
    if (eventTime !== undefined) updateData.eventTime = eventTime
    if (location !== undefined) updateData.location = location
    if (organizer !== undefined) updateData.organizer = organizer
    if (audience) updateData.audience = audience

    const event = await prisma.event.update({
      where: { id },
      data: updateData as Record<string, string | Date | null>,
    })

    return NextResponse.json(event)
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("Unauthorized")) {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    console.error("Error updating event:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireRole("admin")
    const { id } = await params
    const existing = await prisma.event.findUnique({ where: { id } })
    if (!existing) return NextResponse.json({ error: "Event not found" }, { status: 404 })

    await prisma.event.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("Unauthorized")) {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    console.error("Error deleting event:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
