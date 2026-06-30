"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Download, Search } from "lucide-react"

interface StudentReport {
  studentId: string
  fullName: string
  class: string
  section: string
  totalDays: number
  present: number
  absent: number
  late: number
  excused: number
  percentage: number
}

interface ReportResponse {
  stats: StudentReport[]
  totals: {
    totalStudents: number
    totalDays: number
    totalPresent: number
    totalAbsent: number
    totalLate: number
    totalExcused: number
  }
  filters: Record<string, string | null>
}

interface AttendanceReportProps {
  classes: string[]
  sectionsByClass: { className: string; section: string }[]
}

export function AttendanceReport({ classes, sectionsByClass }: AttendanceReportProps) {
  const [selectedClass, setSelectedClass] = useState("")
  const [selectedSection, setSelectedSection] = useState("")
  const [from, setFrom] = useState("")
  const [to, setTo] = useState("")
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<ReportResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  const sectionsForClass = sectionsByClass
    .filter((c) => c.className === selectedClass)
    .map((c) => c.section)

  const fetchReport = async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      if (selectedClass) params.set("class", selectedClass)
      if (selectedSection) params.set("section", selectedSection)
      if (from) params.set("from", from)
      if (to) params.set("to", to)

      const res = await fetch(`/api/attendance/report?${params.toString()}`)
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Failed to fetch report")
      }
      const json = await res.json()
      setData(json)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch report")
    } finally {
      setLoading(false)
    }
  }

  const getPercentageColor = (pct: number) => {
    if (pct >= 90) return "text-green-400"
    if (pct >= 75) return "text-amber-400"
    return "text-red-400"
  }

  const exportCsv = () => {
    if (!data) return
    const headers = ["Student ID", "Name", "Class", "Section", "Total Days", "Present", "Absent", "Late", "Excused", "Percentage"]
    const rows = data.stats.map((s) => [s.studentId, s.fullName, s.class, s.section, s.totalDays, s.present, s.absent, s.late, s.excused, s.percentage])
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "attendance-report.csv"
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Attendance Report</h1>
          <p className="text-muted-foreground mt-1">View aggregate attendance statistics by class</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="class">Class</Label>
              <select
                id="class"
                value={selectedClass}
                onChange={(e) => {
                  setSelectedClass(e.target.value)
                  setSelectedSection("")
                }}
                className="flex h-9 w-full rounded-lg border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="">All Classes</option>
                {classes.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="section">Section</Label>
              <select
                id="section"
                value={selectedSection}
                onChange={(e) => setSelectedSection(e.target.value)}
                className="flex h-9 w-full rounded-lg border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="">All Sections</option>
                {sectionsForClass.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="from">From Date</Label>
              <Input id="from" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="to">To Date</Label>
              <Input id="to" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <Button onClick={fetchReport} disabled={loading}>
              {loading ? <LoadingSpinner size="sm" className="mr-2" /> : <Search className="h-4 w-4 mr-2" />}
              Generate Report
            </Button>
            {data && (
              <Button variant="outline" onClick={exportCsv}>
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {error && (
        <div className="p-3 rounded-lg text-sm bg-red-500/10 text-red-300 border border-red-500/20">
          {error}
        </div>
      )}

      {loading && (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      )}

      {data && !loading && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-2xl font-bold text-center">{data.totals.totalStudents}</CardTitle>
              </CardHeader>
              <CardContent className="text-center text-sm text-muted-foreground pb-4">Students</CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-2xl font-bold text-center text-green-400">{data.totals.totalPresent}</CardTitle>
              </CardHeader>
              <CardContent className="text-center text-sm text-muted-foreground pb-4">Present</CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-2xl font-bold text-center text-red-400">{data.totals.totalAbsent}</CardTitle>
              </CardHeader>
              <CardContent className="text-center text-sm text-muted-foreground pb-4">Absent</CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-2xl font-bold text-center text-amber-400">{data.totals.totalLate + data.totals.totalExcused}</CardTitle>
              </CardHeader>
              <CardContent className="text-center text-sm text-muted-foreground pb-4">Late / Excused</CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Student Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 px-3 font-medium text-muted-foreground">Student ID</th>
                      <th className="text-left py-2 px-3 font-medium text-muted-foreground">Name</th>
                      <th className="text-left py-2 px-3 font-medium text-muted-foreground">Class</th>
                      <th className="text-center py-2 px-3 font-medium text-muted-foreground">Days</th>
                      <th className="text-center py-2 px-3 font-medium text-muted-foreground">Present</th>
                      <th className="text-center py-2 px-3 font-medium text-muted-foreground">Absent</th>
                      <th className="text-center py-2 px-3 font-medium text-muted-foreground">Late</th>
                      <th className="text-center py-2 px-3 font-medium text-muted-foreground">Excused</th>
                      <th className="text-center py-2 px-3 font-medium text-muted-foreground">%</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.stats.map((student) => (
                      <tr key={student.studentId} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                        <td className="py-2.5 px-3 font-mono text-xs">{student.studentId}</td>
                        <td className="py-2.5 px-3 font-medium">{student.fullName}</td>
                        <td className="py-2.5 px-3 text-muted-foreground">{student.class}{student.section ? `-${student.section}` : ""}</td>
                        <td className="py-2.5 px-3 text-center">{student.totalDays}</td>
                        <td className="py-2.5 px-3 text-center text-green-400">{student.present}</td>
                        <td className="py-2.5 px-3 text-center text-red-400">{student.absent}</td>
                        <td className="py-2.5 px-3 text-center text-amber-400">{student.late}</td>
                        <td className="py-2.5 px-3 text-center text-blue-400">{student.excused}</td>
                        <td className={`py-2.5 px-3 text-center font-bold ${getPercentageColor(student.percentage)}`}>
                          {student.percentage}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
