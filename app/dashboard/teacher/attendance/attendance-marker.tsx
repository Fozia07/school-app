"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { CheckCircle, XCircle, Clock, AlertTriangle, Save } from "lucide-react"

interface ClassInfo {
  className: string
  section: string
}

interface StudentInfo {
  id: string
  studentId: string
  fullName: string
  class: string
  section: string
}

interface AttendanceRecord {
  id: string
  studentId: string
  status: string
  remarks: string | null
}

type AttendanceStatus = "present" | "absent" | "late" | "excused"

const statusColors: Record<AttendanceStatus, string> = {
  present: "bg-green-500/15 text-green-300 border-green-500/30",
  absent: "bg-red-500/15 text-red-300 border-red-500/30",
  late: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  excused: "bg-blue-500/15 text-blue-300 border-blue-500/30",
}

const statusIcons: Record<AttendanceStatus, React.ReactNode> = {
  present: <CheckCircle className="h-3.5 w-3.5" />,
  absent: <XCircle className="h-3.5 w-3.5" />,
  late: <Clock className="h-3.5 w-3.5" />,
  excused: <AlertTriangle className="h-3.5 w-3.5" />,
}

interface AttendanceMarkerProps {
  classes: ClassInfo[]
  teacherId: string
}

export function AttendanceMarker({ classes }: AttendanceMarkerProps) {
  const [selectedClass, setSelectedClass] = useState(classes[0]?.className || "")
  const [selectedSection, setSelectedSection] = useState(classes[0]?.section || "")
  const [date, setDate] = useState(new Date().toISOString().split("T")[0])
  const [students, setStudents] = useState<StudentInfo[]>([])
  const [attendance, setAttendance] = useState<Record<string, AttendanceStatus>>({})
  const [remarks, setRemarks] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const uniqueClasses = [...new Set(classes.map((c) => c.className))]
  const sectionsForClass = classes.filter((c) => c.className === selectedClass).map((c) => c.section)

  useEffect(() => {
    if (!selectedClass || !selectedSection || !date) return

    const fetchData = async () => {
      setLoading(true)
      setMessage(null)
      try {
        const [studentsRes, attendanceRes] = await Promise.all([
          fetch(`/api/students?class=${selectedClass}&section=${selectedSection}`),
          fetch(`/api/attendance?class=${selectedClass}&section=${selectedSection}&date=${date}&limit=200`),
        ])

        if (!studentsRes.ok) throw new Error("Failed to fetch students")
        const studentsData = await studentsRes.json()
        const studentsList = Array.isArray(studentsData) ? studentsData : studentsData.students || []
        setStudents(studentsList)

        if (attendanceRes.ok) {
          const attData = await attendanceRes.json()
          const records: AttendanceRecord[] = attData.records || []
          const attMap: Record<string, AttendanceStatus> = {}
          const remMap: Record<string, string> = {}
          records.forEach((r: AttendanceRecord) => {
            attMap[r.studentId] = r.status as AttendanceStatus
            if (r.remarks) remMap[r.studentId] = r.remarks
          })
          setAttendance(attMap)
          setRemarks(remMap)
        }
      } catch (err) {
        console.error("Error fetching data:", err)
        setMessage({ type: "error", text: "Failed to load student data" })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [selectedClass, selectedSection, date])

  const setAllStatus = useCallback((status: AttendanceStatus) => {
    const newAttendance: Record<string, AttendanceStatus> = {}
    students.forEach((s) => { newAttendance[s.id] = status })
    setAttendance(newAttendance)
  }, [students])

  const handleSave = async () => {
    if (!date || students.length === 0) return
    setSaving(true)
    setMessage(null)

    const records = Object.entries(attendance)
      .filter(([_, status]) => status)
      .map(([studentId, status]) => ({
        studentId,
        status,
        remarks: remarks[studentId] || null,
      }))

    try {
      const res = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ records, date }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Failed to save")
      }

      setMessage({ type: "success", text: `Attendance saved for ${records.length} students` })
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Failed to save" })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Mark Attendance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="space-y-2">
              <Label htmlFor="class">Class</Label>
              <select
                id="class"
                value={selectedClass}
                onChange={(e) => {
                  setSelectedClass(e.target.value)
                  const secs = classes.filter((c) => c.className === e.target.value)
                  if (secs.length > 0) setSelectedSection(secs[0].section)
                }}
                className="flex h-9 w-full rounded-lg border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                {uniqueClasses.map((c) => (
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
                {sectionsForClass.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
          </div>

          <div className="flex gap-2 mb-4">
            <span className="text-sm text-muted-foreground self-center mr-2">Set all:</span>
            {(Object.keys(statusColors) as AttendanceStatus[]).map((status) => (
              <Button
                key={status}
                variant="outline"
                size="sm"
                onClick={() => setAllStatus(status)}
                className="text-xs"
              >
                {status}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {message && (
        <div className={`p-3 rounded-lg text-sm ${
          message.type === "success" ? "bg-green-500/10 text-green-300 border border-green-500/20" : "bg-red-500/10 text-red-300 border border-red-500/20"
        }`}>
          {message.text}
        </div>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>
            Students
            {students.length > 0 && (
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                ({students.length} students)
              </span>
            )}
          </CardTitle>
          <Button onClick={handleSave} disabled={saving || students.length === 0}>
            {saving ? <LoadingSpinner size="sm" className="mr-2" /> : <Save className="h-4 w-4 mr-2" />}
            {saving ? "Saving..." : "Save Attendance"}
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : students.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">Select a class and section to view students</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 px-3 font-medium text-muted-foreground">#</th>
                    <th className="text-left py-2 px-3 font-medium text-muted-foreground">Student ID</th>
                    <th className="text-left py-2 px-3 font-medium text-muted-foreground">Name</th>
                    <th className="text-center py-2 px-3 font-medium text-muted-foreground">Status</th>
                    <th className="text-left py-2 px-3 font-medium text-muted-foreground">Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student, idx) => {
                    const currentStatus = attendance[student.id] || "present"
                    return (
                      <tr key={student.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                        <td className="py-2.5 px-3 text-muted-foreground">{idx + 1}</td>
                        <td className="py-2.5 px-3 font-mono text-xs">{student.studentId}</td>
                        <td className="py-2.5 px-3 font-medium">{student.fullName}</td>
                        <td className="py-2.5 px-3">
                          <div className="flex justify-center">
                            <select
                              value={currentStatus}
                              onChange={(e) => setAttendance((prev) => ({ ...prev, [student.id]: e.target.value as AttendanceStatus }))}
                              className="flex h-8 rounded-md border border-input bg-background px-2 text-xs font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                            >
                              {(["present", "absent", "late", "excused"] as const).map((s) => (
                                <option key={s} value={s}>{s}</option>
                              ))}
                            </select>
                          </div>
                        </td>
                        <td className="py-2.5 px-3">
                          <Input
                            placeholder="Optional"
                            value={remarks[student.id] || ""}
                            onChange={(e) => setRemarks((prev) => ({ ...prev, [student.id]: e.target.value }))}
                            className="h-8 text-xs"
                          />
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
