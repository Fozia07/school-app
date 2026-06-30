import { NextRequest, NextResponse } from "next/server"
import { requireAnyRole } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAnyRole(["teacher", "admin"])
    const { id } = await params
    const body = await req.json()
    const { status, priority, assignedToId } = body

    const existing = await prisma.complaint.findUnique({ where: { id } })
    if (!existing) return NextResponse.json({ error: "Complaint not found" }, { status: 404 })

    const updateData: Record<string, unknown> = {}
    if (status) {
      updateData.status = status
      if (status === "resolved") updateData.resolvedAt = new Date()
    }
    if (priority) updateData.priority = priority
    if (assignedToId !== undefined) updateData.assignedToId = assignedToId || null

    const complaint = await prisma.complaint.update({
      where: { id },
      data: updateData as Record<string, string | Date | null>,
      include: { fromUser: { select: { id: true, email: true } }, assignedTo: { select: { id: true, email: true } } },
    })

    return NextResponse.json(complaint)
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("Unauthorized")) {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    console.error("Error updating complaint:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
