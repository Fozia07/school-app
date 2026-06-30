"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Plus, DollarSign, Search, X } from "lucide-react"

interface StudentInfo {
  id: string
  studentId: string
  fullName: string
  class: string
  section: string
}

interface FeeRecord {
  id: string
  studentId: string
  term: string
  amount: number
  dueDate: string
  paidAmount: number
  paymentStatus: string
  paymentDate: string | null
  transactionId: string | null
  student: StudentInfo
}

interface FeeManagerProps {
  students: StudentInfo[]
}

const statusStyles: Record<string, string> = {
  paid: "bg-green-500/15 text-green-300 border-green-500/30",
  partial: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  pending: "bg-red-500/15 text-red-300 border-red-500/30",
  overdue: "bg-red-600/15 text-red-300 border-red-600/30",
}

export function FeeManager({ students }: FeeManagerProps) {
  const [records, setRecords] = useState<FeeRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [paymentModal, setPaymentModal] = useState<FeeRecord | null>(null)

  const [formStudentId, setFormStudentId] = useState("")
  const [formTerm, setFormTerm] = useState("")
  const [formAmount, setFormAmount] = useState("")
  const [formDueDate, setFormDueDate] = useState("")

  const [payAmount, setPayAmount] = useState("")
  const [payDate, setPayDate] = useState(new Date().toISOString().split("T")[0])
  const [payTransactionId, setPayTransactionId] = useState("")

  const fetchFees = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (searchTerm) params.set("studentId", searchTerm)
      const res = await fetch(`/api/fees?${params.toString()}&limit=200`)
      if (!res.ok) throw new Error("Failed to fetch")
      const data = await res.json()
      setRecords(data.records || [])
    } catch (err) {
      console.error("Error fetching fees:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchFees() }, [])

  const resetForm = () => {
    setFormStudentId("")
    setFormTerm("")
    setFormAmount("")
    setFormDueDate("")
    setShowForm(false)
    setMessage(null)
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formStudentId || !formTerm || !formAmount || !formDueDate) return
    setSaving(true)
    setMessage(null)

    try {
      const res = await fetch("/api/fees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId: formStudentId, term: formTerm, amount: formAmount, dueDate: formDueDate }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Failed to create")
      }

      setMessage({ type: "success", text: "Fee record created" })
      resetForm()
      fetchFees()
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Failed to create" })
    } finally {
      setSaving(false)
    }
  }

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!paymentModal || !payAmount) return
    setSaving(true)
    setMessage(null)

    try {
      const res = await fetch(`/api/fees/${paymentModal.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paidAmount: Number(payAmount),
          paymentDate: payDate,
          transactionId: payTransactionId || null,
        }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Failed to update payment")
      }

      setMessage({ type: "success", text: "Payment recorded" })
      setPaymentModal(null)
      fetchFees()
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Failed to record payment" })
    } finally {
      setSaving(false)
    }
  }

  const filteredStudents = students.filter(
    (s) =>
      s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.studentId.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Fee Management</h1>
          <p className="text-muted-foreground mt-1">Track payments and manage fee records</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" /> Add Fee Record
        </Button>
      </div>

      {message && (
        <div className={`p-3 rounded-lg text-sm ${
          message.type === "success" ? "bg-green-500/10 text-green-300 border border-green-500/20" : "bg-red-500/10 text-red-300 border border-red-500/20"
        }`}>
          {message.text}
        </div>
      )}

      <div className="flex gap-2 max-w-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            placeholder="Search by student name or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex h-9 w-full rounded-lg border border-input bg-background pl-9 pr-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
        </div>
      </div>

      {showForm && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>New Fee Record</CardTitle>
            <Button variant="ghost" size="sm" onClick={resetForm}><X className="h-4 w-4" /></Button>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fee-student">Student</Label>
                <select
                  id="fee-student"
                  value={formStudentId}
                  onChange={(e) => setFormStudentId(e.target.value)}
                  className="flex h-9 w-full rounded-lg border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  required
                >
                  <option value="">Select a student</option>
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>{s.fullName} ({s.studentId})</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fee-term">Term</Label>
                  <Input id="fee-term" value={formTerm} onChange={(e) => setFormTerm(e.target.value)} placeholder="Q1 2025" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fee-amount">Amount</Label>
                  <Input id="fee-amount" type="number" step="0.01" value={formAmount} onChange={(e) => setFormAmount(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fee-duedate">Due Date</Label>
                  <Input id="fee-duedate" type="date" value={formDueDate} onChange={(e) => setFormDueDate(e.target.value)} required />
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <Button type="submit" disabled={saving}>
                  {saving ? <LoadingSpinner size="sm" className="mr-2" /> : null}
                  Create
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {paymentModal && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Record Payment</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => setPaymentModal(null)}><X className="h-4 w-4" /></Button>
          </CardHeader>
          <CardContent>
            <div className="text-sm mb-4">
              <p><strong>Student:</strong> {paymentModal.student.fullName}</p>
              <p><strong>Term:</strong> {paymentModal.term}</p>
              <p><strong>Amount:</strong> ${paymentModal.amount.toFixed(2)}</p>
              <p><strong>Paid So Far:</strong> ${paymentModal.paidAmount.toFixed(2)}</p>
              <p><strong>Remaining:</strong> ${(paymentModal.amount - paymentModal.paidAmount).toFixed(2)}</p>
            </div>
            <form onSubmit={handlePayment} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="pay-amount">Payment Amount</Label>
                  <Input id="pay-amount" type="number" step="0.01" value={payAmount} onChange={(e) => setPayAmount(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pay-date">Payment Date</Label>
                  <Input id="pay-date" type="date" value={payDate} onChange={(e) => setPayDate(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pay-txn">Transaction ID</Label>
                  <Input id="pay-txn" value={payTransactionId} onChange={(e) => setPayTransactionId(e.target.value)} placeholder="Optional" />
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <Button type="submit" disabled={saving}>
                  {saving ? <LoadingSpinner size="sm" className="mr-2" /> : null}
                  Record Payment
                </Button>
                <Button type="button" variant="outline" onClick={() => setPaymentModal(null)}>Cancel</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="flex justify-center py-12"><LoadingSpinner size="lg" /></div>
      ) : records.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center py-12 text-muted-foreground">
            <DollarSign className="h-12 w-12 mb-3 opacity-30" />
            <p>No fee records yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 px-3 font-medium text-muted-foreground">Student</th>
                <th className="text-left py-2 px-3 font-medium text-muted-foreground">Class</th>
                <th className="text-left py-2 px-3 font-medium text-muted-foreground">Term</th>
                <th className="text-right py-2 px-3 font-medium text-muted-foreground">Amount</th>
                <th className="text-right py-2 px-3 font-medium text-muted-foreground">Paid</th>
                <th className="text-right py-2 px-3 font-medium text-muted-foreground">Remaining</th>
                <th className="text-center py-2 px-3 font-medium text-muted-foreground">Status</th>
                <th className="text-center py-2 px-3 font-medium text-muted-foreground">Due</th>
                <th className="text-center py-2 px-3 font-medium text-muted-foreground">Action</th>
              </tr>
            </thead>
            <tbody>
              {records.map((fee) => {
                const remaining = fee.amount - fee.paidAmount
                return (
                  <tr key={fee.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                    <td className="py-2.5 px-3">
                      <div className="font-medium">{fee.student.fullName}</div>
                      <div className="text-xs text-muted-foreground font-mono">{fee.student.studentId}</div>
                    </td>
                    <td className="py-2.5 px-3 text-muted-foreground">{fee.student.class}{fee.student.section ? `-${fee.student.section}` : ""}</td>
                    <td className="py-2.5 px-3">{fee.term}</td>
                    <td className="py-2.5 px-3 text-right">${fee.amount.toFixed(2)}</td>
                    <td className="py-2.5 px-3 text-right">${fee.paidAmount.toFixed(2)}</td>
                    <td className="py-2.5 px-3 text-right font-medium">${remaining.toFixed(2)}</td>
                    <td className="py-2.5 px-3 text-center">
                      <Badge variant="outline" className={statusStyles[fee.paymentStatus] || "bg-muted/30 text-muted-foreground"}>
                        {fee.paymentStatus}
                      </Badge>
                    </td>
                    <td className="py-2.5 px-3 text-center text-xs text-muted-foreground">
                      {new Date(fee.dueDate).toLocaleDateString()}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <Button variant="outline" size="sm" onClick={() => {
                        setPaymentModal(fee)
                        setPayAmount((fee.amount - fee.paidAmount).toString())
                      }}>
                        <DollarSign className="h-3.5 w-3.5 mr-1" /> Pay
                      </Button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
