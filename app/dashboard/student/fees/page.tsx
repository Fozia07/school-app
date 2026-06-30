import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DollarSign } from "lucide-react"

const statusStyles: Record<string, string> = {
  paid: "bg-green-500/15 text-green-300 border-green-500/30",
  partial: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  pending: "bg-red-500/15 text-red-300 border-red-500/30",
  overdue: "bg-red-600/15 text-red-300 border-red-600/30",
}

export default async function StudentFeesPage() {
  const user = await getCurrentUser()
  if (!user || user.role !== "student") redirect("/dashboard")

  const student = await prisma.student.findUnique({
    where: { userId: user.id },
    select: { id: true, studentId: true, fullName: true, class: true, section: true },
  })
  if (!student) redirect("/onboarding")

  const records = await prisma.fee.findMany({
    where: { studentId: student.id },
    orderBy: [{ term: "desc" }, { dueDate: "desc" }],
  })

  const totalAmount = records.reduce((sum, r) => sum + r.amount, 0)
  const totalPaid = records.reduce((sum, r) => sum + r.paidAmount, 0)
  const totalRemaining = totalAmount - totalPaid
  const pendingCount = records.filter((r) => r.paymentStatus === "pending" || r.paymentStatus === "partial").length
  const paidCount = records.filter((r) => r.paymentStatus === "paid").length

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">My Fees</h1>
        <p className="text-muted-foreground mt-1">
          {student.fullName} &middot; {student.studentId}
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl font-bold text-center">${totalAmount.toFixed(2)}</CardTitle>
          </CardHeader>
          <CardContent className="text-center text-sm text-muted-foreground pb-4">Total Fees</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl font-bold text-center text-green-400">${totalPaid.toFixed(2)}</CardTitle>
          </CardHeader>
          <CardContent className="text-center text-sm text-muted-foreground pb-4">Total Paid</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl font-bold text-center text-red-400">${totalRemaining.toFixed(2)}</CardTitle>
          </CardHeader>
          <CardContent className="text-center text-sm text-muted-foreground pb-4">Remaining</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl font-bold text-center">{paidCount}/{records.length}</CardTitle>
          </CardHeader>
          <CardContent className="text-center text-sm text-muted-foreground pb-4">Terms Paid</CardContent>
        </Card>
      </div>

      {records.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center py-12 text-muted-foreground">
            <DollarSign className="h-12 w-12 mb-3 opacity-30" />
            <p>No fee records yet</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Fee History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 px-3 font-medium text-muted-foreground">Term</th>
                    <th className="text-right py-2 px-3 font-medium text-muted-foreground">Amount</th>
                    <th className="text-right py-2 px-3 font-medium text-muted-foreground">Paid</th>
                    <th className="text-right py-2 px-3 font-medium text-muted-foreground">Remaining</th>
                    <th className="text-center py-2 px-3 font-medium text-muted-foreground">Status</th>
                    <th className="text-left py-2 px-3 font-medium text-muted-foreground">Due Date</th>
                    {records.some((r) => r.paymentDate) && (
                      <th className="text-left py-2 px-3 font-medium text-muted-foreground">Paid On</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {records.map((fee) => (
                    <tr key={fee.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                      <td className="py-2.5 px-3 font-medium">{fee.term}</td>
                      <td className="py-2.5 px-3 text-right">${fee.amount.toFixed(2)}</td>
                      <td className="py-2.5 px-3 text-right">${fee.paidAmount.toFixed(2)}</td>
                      <td className="py-2.5 px-3 text-right">${(fee.amount - fee.paidAmount).toFixed(2)}</td>
                      <td className="py-2.5 px-3 text-center">
                        <Badge variant="outline" className={statusStyles[fee.paymentStatus] || undefined}>
                          {fee.paymentStatus}
                        </Badge>
                      </td>
                      <td className="py-2.5 px-3 text-muted-foreground">
                        {new Date(fee.dueDate).toLocaleDateString()}
                      </td>
                      {fee.paymentDate && (
                        <td className="py-2.5 px-3 text-muted-foreground">
                          {new Date(fee.paymentDate).toLocaleDateString()}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
