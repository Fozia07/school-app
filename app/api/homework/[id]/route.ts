import { NextRequest, NextResponse } from "next/server"
import { requireRole } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireRole("teacher")
    const { id } = await params

    const existing = await prisma.homework.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: "Homework not found" }, { status: 404 })
    }

    const teacher = await prisma.teacher.findUnique({ where: { userId: user.id } })
    if (!teacher || existing.teacherId !== teacher.id) {
      return NextResponse.json({ error: "Not authorized to update this homework" }, { status: 403 })
    }

    const body = await req.json()
    const { class: className, section, subject, title, description, dueDate, attachmentUrl } = body

    const homework = await prisma.homework.update({
      where: { id },
      data: {
        ...(className && { class: className }),
        ...(section && { section }),
        ...(subject && { subject }),
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
        ...(attachmentUrl !== undefined && { attachmentUrl }),
      },
      include: { teacher: { select: { id: true, fullName: true } } },
    })

    return NextResponse.json(homework)
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("Unauthorized")) {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    console.error("Error updating homework:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireRole("teacher")
    const { id } = await params

    const existing = await prisma.homework.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: "Homework not found" }, { status: 404 })
    }

    const teacher = await prisma.teacher.findUnique({ where: { userId: user.id } })
    if (!teacher || existing.teacherId !== teacher.id) {
      return NextResponse.json({ error: "Not authorized to delete this homework" }, { status: 403 })
    }

    await prisma.homework.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("Unauthorized")) {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    console.error("Error deleting homework:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
