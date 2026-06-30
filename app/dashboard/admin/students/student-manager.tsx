"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Search, Users } from "lucide-react"

interface StudentWithDetails {
  id: string
  studentId: string
  fullName: string
  class: string
  section: string
  parentName: string | null
  parentPhone: string | null
  enrollmentDate: string | Date
  user: { email: string; createdAt: string | Date }
  attendance: { status: string }[]
  fees: { paymentStatus: string }[]
}

interface StudentManagerProps { students: StudentWithDetails[] }

export function StudentManager({ students }: StudentManagerProps) {
  const [search, setSearch] = useState("")

  const filtered = useMemo(() => {
    if (!search) return students
    const q = search.toLowerCase()
    return students.filter((s) => s.fullName.toLowerCase().includes(q) || s.studentId.toLowerCase().includes(q) || s.class.toLowerCase().includes(q))
  }, [search, students])

  const stats = {
    total: students.length,
    withAttendance: students.filter((s) => s.attendance.length > 0).length,
    withPendingFees: students.filter((s) => s.fees.some((f) => f.paymentStatus === "pending" || f.paymentStatus === "overdue")).length,
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Students</h1>
        <p className="text-muted-foreground mt-1">View and manage student records</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card><CardHeader className="pb-2"><CardTitle className="text-2xl font-bold text-center">{stats.total}</CardTitle></CardHeader><CardContent className="text-center text-sm pb-4">Total</CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-2xl font-bold text-center text-green-400">{stats.withAttendance}</CardTitle></CardHeader><CardContent className="text-center text-sm pb-4">With Attendance</CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-2xl font-bold text-center text-red-400">{stats.withPendingFees}</CardTitle></CardHeader><CardContent className="text-center text-sm pb-4">Pending Fees</CardContent></Card>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input placeholder="Search by name, ID, or class..." value={search} onChange={(e) => setSearch(e.target.value)}
          className="flex h-9 w-full rounded-lg border border-input bg-background pl-9 pr-3 py-1 text-sm" />
      </div>

      {filtered.length === 0 ? (
        <Card><CardContent className="flex flex-col items-center py-12 text-muted-foreground">
          <Users className="h-12 w-12 mb-3 opacity-30" /><p>No students found</p>
        </CardContent></Card>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 px-3 font-medium text-muted-foreground">Student ID</th>
                <th className="text-left py-2 px-3 font-medium text-muted-foreground">Name</th>
                <th className="text-left py-2 px-3 font-medium text-muted-foreground">Class</th>
                <th className="text-left py-2 px-3 font-medium text-muted-foreground">Parent</th>
                <th className="text-center py-2 px-3 font-medium text-muted-foreground">Attendance</th>
                <th className="text-center py-2 px-3 font-medium text-muted-foreground">Fees</th>
                <th className="text-left py-2 px-3 font-medium text-muted-foreground">Enrolled</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <tr key={s.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                  <td className="py-2.5 px-3 font-mono text-xs">{s.studentId}</td>
                  <td className="py-2.5 px-3 font-medium">{s.fullName}</td>
                  <td className="py-2.5 px-3">{s.class}{s.section ? `-${s.section}` : ""}</td>
                  <td className="py-2.5 px-3 text-muted-foreground">{s.parentName || "—"}</td>
                  <td className="py-2.5 px-3 text-center">
                    <Badge variant="outline" className={s.attendance.length > 0 ? "bg-green-500/15 text-green-300 border-green-500/30" : "bg-muted/30 text-muted-foreground"}>
                      {s.attendance.length} days
                    </Badge>
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <Badge variant="outline" className={s.fees.some((f) => f.paymentStatus === "pending" || f.paymentStatus === "overdue") ? "bg-red-500/15 text-red-300 border-red-500/30" : "bg-green-500/15 text-green-300 border-green-500/30"}>
                      {s.fees.filter((f) => f.paymentStatus === "paid").length}/{s.fees.length}
                    </Badge>
                  </td>
                  <td className="py-2.5 px-3 text-muted-foreground text-xs">
                    {new Date(s.enrollmentDate).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
