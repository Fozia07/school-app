import { NextRequest, NextResponse } from "next/server"
import { requireRole } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { PaymentStatus } from "@prisma/client"

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireRole("admin")
    const { id } = await params

    const existing = await prisma.fee.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: "Fee record not found" }, { status: 404 })
    }

    const body = await req.json()
    const { paidAmount, paymentDate, transactionId, paymentStatus } = body

    const validStatuses = Object.values(PaymentStatus)
    if (paymentStatus && !validStatuses.includes(paymentStatus as PaymentStatus)) {
      return NextResponse.json({ error: "Invalid payment status" }, { status: 400 })
    }

    const updateData: Record<string, unknown> = {}

    if (paidAmount !== undefined) updateData.paidAmount = Number(paidAmount)
    if (paymentDate !== undefined) updateData.paymentDate = paymentDate ? new Date(paymentDate) : null
    if (transactionId !== undefined) updateData.transactionId = transactionId
    if (paymentStatus) updateData.paymentStatus = paymentStatus

    if (updateData.paidAmount !== undefined) {
      const newPaid = Number(updateData.paidAmount)
      if (newPaid >= existing.amount) {
        updateData.paymentStatus = "paid"
      } else if (newPaid > 0) {
        updateData.paymentStatus = "partial"
      }
    }

    const fee = await prisma.fee.update({
      where: { id },
      data: updateData as Record<string, string | number | Date | null>,
      include: { student: { select: { id: true, studentId: true, fullName: true, class: true, section: true } } },
    })

    return NextResponse.json(fee)
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("Unauthorized")) {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    console.error("Error updating fee:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
