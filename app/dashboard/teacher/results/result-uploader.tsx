"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Plus, Pencil, X, Search } from "lucide-react"

interface ClassInfo { className: string; section: string }
interface SubjectInfo { id: string; name: string; code: string }
interface StudentInfo { id: string; studentId: string; fullName: string; class: string; section: string }
interface ResultRecord {
  id: string
  studentId: string
  subjectId: string
  examType: string
  marksObtained: number
  totalMarks: number
  grade: string | null
  examDate: string | null
  student: StudentInfo
  subject: { id: string; name: string; code: string }
}

interface ResultUploaderProps { classes: ClassInfo[]; subjects: SubjectInfo[] }

export function ResultUploader({ classes, subjects }: ResultUploaderProps) {
  const [selectedClass, setSelectedClass] = useState(classes[0]?.className || "")
  const [selectedSection, setSelectedSection] = useState(classes[0]?.section || "")
  const [selectedSubject, setSelectedSubject] = useState(subjects[0]?.code || "")
  const [examType, setExamType] = useState("midterm")
  const [examDate, setExamDate] = useState("")
  const [students, setStudents] = useState<StudentInfo[]>([])
  const [results, setResults] = useState<Record<string, string>>({})
  const [savedResults, setSavedResults] = useState<ResultRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const uniqueClasses = [...new Set(classes.map((c) => c.className))]
  const sectionsForClass = classes.filter((c) => c.className === selectedClass).map((c) => c.section)

  useEffect(() => {
    if (!selectedClass || !selectedSection) return
    const fetchData = async () => {
      setLoading(true)
      try {
        const [studentsRes, resultsRes] = await Promise.all([
          fetch(`/api/students?class=${selectedClass}&section=${selectedSection}`),
          fetch(`/api/results?subjectCode=${selectedSubject}&examType=${examType}`),
        ])
        const studentsData = await studentsRes.json()
        setStudents(Array.isArray(studentsData) ? studentsData : studentsData.students || [])

        if (resultsRes.ok) {
          const resultsData = await resultsRes.json()
          setSavedResults(resultsData.records || [])
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [selectedClass, selectedSection, selectedSubject, examType])

  const handleSave = async () => {
    setSaving(true)
    setMessage(null)
    const errors: string[] = []

    for (const [studentId, marksObtained] of Object.entries(results)) {
      if (!marksObtained) continue
      try {
        const res = await fetch("/api/results", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ studentId, subjectCode: selectedSubject, examType, marksObtained, examDate: examDate || null }),
        })
        if (!res.ok) {
          const err = await res.json()
          errors.push(`${studentId}: ${err.error}`)
        }
      } catch {
        errors.push(`${studentId}: Network error`)
      }
    }

    if (errors.length > 0) {
      setMessage({ type: "error", text: `Saved with ${errors.length} error(s): ${errors[0]}` })
    } else {
      setMessage({ type: "success", text: "All results saved successfully" })
      setResults({})
    }
    setSaving(false)
  }

  const getExistingMark = (studentId: string) => {
    const r = savedResults.find((r) => r.studentId === studentId && r.subject.code === selectedSubject)
    return r ? r.marksObtained.toString() : ""
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Upload Results</h1>
        <p className="text-muted-foreground mt-1">Enter marks for your students</p>
      </div>

      {message && (
        <div className={`p-3 rounded-lg text-sm ${
          message.type === "success" ? "bg-green-500/10 text-green-300 border border-green-500/20" : "bg-red-500/10 text-red-300 border border-red-500/20"
        }`}>{message.text}</div>
      )}

      <Card>
        <CardHeader><CardTitle>Filters</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
            <div className="space-y-2">
              <Label>Class</Label>
              <select value={selectedClass} onChange={(e) => { setSelectedClass(e.target.value); const s = classes.filter((c) => c.className === e.target.value); if (s.length > 0) setSelectedSection(s[0].section) }}
                className="flex h-9 w-full rounded-lg border border-input bg-background px-3 py-1 text-sm">
                {uniqueClasses.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Section</Label>
              <select value={selectedSection} onChange={(e) => setSelectedSection(e.target.value)}
                className="flex h-9 w-full rounded-lg border border-input bg-background px-3 py-1 text-sm">
                {sectionsForClass.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Subject</Label>
              <select value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)}
                className="flex h-9 w-full rounded-lg border border-input bg-background px-3 py-1 text-sm">
                {subjects.map((s) => <option key={s.code} value={s.code}>{s.name}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Exam Type</Label>
              <select value={examType} onChange={(e) => setExamType(e.target.value)}
                className="flex h-9 w-full rounded-lg border border-input bg-background px-3 py-1 text-sm">
                <option value="midterm">Midterm</option>
                <option value="final">Final</option>
                <option value="quiz">Quiz</option>
                <option value="assignment">Assignment</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>Exam Date</Label>
              <Input type="date" value={examDate} onChange={(e) => setExamDate(e.target.value)} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Student Marks</CardTitle>
          <Button onClick={handleSave} disabled={saving || students.length === 0}>
            {saving ? <LoadingSpinner size="sm" className="mr-2" /> : null}
            Save Results
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-12"><LoadingSpinner size="lg" /></div>
          ) : students.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">Select a class and section</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 px-3 font-medium text-muted-foreground">#</th>
                    <th className="text-left py-2 px-3 font-medium text-muted-foreground">Student ID</th>
                    <th className="text-left py-2 px-3 font-medium text-muted-foreground">Name</th>
                    <th className="text-center py-2 px-3 font-medium text-muted-foreground">Marks</th>
                    <th className="text-center py-2 px-3 font-medium text-muted-foreground">Grade</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student, idx) => {
                    const existingMark = getExistingMark(student.id)
                    const pct = results[student.id] ? (Number(results[student.id]) / 100) * 100 : existingMark ? (Number(existingMark) / 100) * 100 : 0
                    let grade = "—"
                    if (pct >= 90) grade = "A+"
                    else if (pct >= 80) grade = "A"
                    else if (pct >= 70) grade = "B+"
                    else if (pct >= 60) grade = "B"
                    else if (pct >= 50) grade = "C"
                    else if (pct >= 40) grade = "D"
                    else if (pct > 0) grade = "F"

                    return (
                      <tr key={student.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                        <td className="py-2.5 px-3 text-muted-foreground">{idx + 1}</td>
                        <td className="py-2.5 px-3 font-mono text-xs">{student.studentId}</td>
                        <td className="py-2.5 px-3 font-medium">{student.fullName}</td>
                        <td className="py-2.5 px-3">
                          <div className="flex justify-center">
                            <Input
                              type="number"
                              min="0"
                              max="100"
                              placeholder={existingMark || "0"}
                              value={results[student.id] || ""}
                              onChange={(e) => setResults((prev) => ({ ...prev, [student.id]: e.target.value }))}
                              className="h-8 w-20 text-center"
                            />
                          </div>
                        </td>
                        <td className="py-2.5 px-3 text-center font-bold">{grade}</td>
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
