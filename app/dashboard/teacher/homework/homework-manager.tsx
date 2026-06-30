"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Plus, Pencil, Trash2, BookOpen, Calendar, Clock, X } from "lucide-react"

interface ClassInfo {
  className: string
  section: string
}

interface HomeworkRecord {
  id: string
  class: string
  section: string
  subject: string
  title: string
  description: string | null
  dueDate: string | null
  attachmentUrl: string | null
  createdAt: string
  teacher: { fullName: string }
}

interface HomeworkManagerProps {
  classes: ClassInfo[]
}

export function HomeworkManager({ classes }: HomeworkManagerProps) {
  const [records, setRecords] = useState<HomeworkRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<HomeworkRecord | null>(null)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const [formClass, setFormClass] = useState(classes[0]?.className || "")
  const [formSection, setFormSection] = useState(classes[0]?.section || "")
  const [formSubject, setFormSubject] = useState("")
  const [formTitle, setFormTitle] = useState("")
  const [formDescription, setFormDescription] = useState("")
  const [formDueDate, setFormDueDate] = useState("")
  const [formAttachment, setFormAttachment] = useState("")

  const uniqueClasses = [...new Set(classes.map((c) => c.className))]
  const sectionsForClass = classes.filter((c) => c.className === formClass).map((c) => c.section)

  const fetchHomework = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/homework")
      if (!res.ok) throw new Error("Failed to fetch")
      const data = await res.json()
      setRecords(data.records || [])
    } catch (err) {
      console.error("Error fetching homework:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchHomework() }, [])

  const resetForm = () => {
    setFormClass(classes[0]?.className || "")
    setFormSection(classes[0]?.section || "")
    setFormSubject("")
    setFormTitle("")
    setFormDescription("")
    setFormDueDate("")
    setFormAttachment("")
    setEditing(null)
    setShowForm(false)
    setMessage(null)
  }

  const openEdit = (hw: HomeworkRecord) => {
    setEditing(hw)
    setFormClass(hw.class)
    setFormSection(hw.section)
    setFormSubject(hw.subject)
    setFormTitle(hw.title)
    setFormDescription(hw.description || "")
    setFormDueDate(hw.dueDate ? hw.dueDate.split("T")[0] : "")
    setFormAttachment(hw.attachmentUrl || "")
    setShowForm(true)
    setMessage(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formTitle || !formSubject) return
    setSaving(true)
    setMessage(null)

    try {
      const body = {
        class: formClass,
        section: formSection,
        subject: formSubject,
        title: formTitle,
        description: formDescription || null,
        dueDate: formDueDate || null,
        attachmentUrl: formAttachment || null,
      }

      let res: Response
      if (editing) {
        res = await fetch(`/api/homework/${editing.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        })
      } else {
        res = await fetch("/api/homework", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        })
      }

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Failed to save")
      }

      setMessage({ type: "success", text: editing ? "Homework updated" : "Homework created" })
      resetForm()
      fetchHomework()
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Failed to save" })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this homework assignment?")) return
    try {
      const res = await fetch(`/api/homework/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed to delete")
      setRecords((prev) => prev.filter((r) => r.id !== id))
      setMessage({ type: "success", text: "Homework deleted" })
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Failed to delete" })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Homework</h1>
          <p className="text-muted-foreground mt-1">Create and manage assignments for your classes</p>
        </div>
        <Button onClick={() => { resetForm(); setShowForm(true) }}>
          <Plus className="h-4 w-4 mr-2" /> New Assignment
        </Button>
      </div>

      {message && (
        <div className={`p-3 rounded-lg text-sm ${
          message.type === "success" ? "bg-green-500/10 text-green-300 border border-green-500/20" : "bg-red-500/10 text-red-300 border border-red-500/20"
        }`}>
          {message.text}
        </div>
      )}

      {showForm && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{editing ? "Edit Assignment" : "New Assignment"}</CardTitle>
            <Button variant="ghost" size="sm" onClick={resetForm}>
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="hw-class">Class</Label>
                  <select
                    id="hw-class"
                    value={formClass}
                    onChange={(e) => {
                      setFormClass(e.target.value)
                      const secs = classes.filter((c) => c.className === e.target.value)
                      if (secs.length > 0 && !secs.find((s) => s.section === formSection)) {
                        setFormSection(secs[0].section)
                      }
                    }}
                    className="flex h-9 w-full rounded-lg border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    {uniqueClasses.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hw-section">Section</Label>
                  <select
                    id="hw-section"
                    value={formSection}
                    onChange={(e) => setFormSection(e.target.value)}
                    className="flex h-9 w-full rounded-lg border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    {sectionsForClass.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hw-subject">Subject</Label>
                  <Input
                    id="hw-subject"
                    value={formSubject}
                    onChange={(e) => setFormSubject(e.target.value)}
                    placeholder="e.g., Mathematics"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="hw-title">Title</Label>
                <Input
                  id="hw-title"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="Assignment title"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="hw-desc">Description</Label>
                <textarea
                  id="hw-desc"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Describe the assignment..."
                  className="flex min-h-24 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="hw-due">Due Date</Label>
                  <Input
                    id="hw-due"
                    type="date"
                    value={formDueDate}
                    onChange={(e) => setFormDueDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hw-attach">Attachment URL (optional)</Label>
                  <Input
                    id="hw-attach"
                    value={formAttachment}
                    onChange={(e) => setFormAttachment(e.target.value)}
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button type="submit" disabled={saving}>
                  {saving ? <LoadingSpinner size="sm" className="mr-2" /> : null}
                  {editing ? "Update" : "Create"}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>
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
            <BookOpen className="h-12 w-12 mb-3 opacity-30" />
            <p>No homework assignments yet</p>
            <Button variant="outline" size="sm" className="mt-4" onClick={() => { resetForm(); setShowForm(true) }}>
              <Plus className="h-4 w-4 mr-2" /> Create First Assignment
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {records.map((hw) => (
            <Card key={hw.id} className="hover:border-border/60 transition-colors">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1 min-w-0">
                    <h3 className="font-semibold truncate">{hw.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {hw.subject} &middot; {hw.class}{hw.section ? `-${hw.section}` : ""}
                    </p>
                    {hw.description && (
                      <p className="text-sm text-muted-foreground/80 mt-2 line-clamp-2">{hw.description}</p>
                    )}
                    <div className="flex flex-wrap gap-3 mt-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Created {new Date(hw.createdAt).toLocaleDateString()}
                      </span>
                      {hw.dueDate && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Due {new Date(hw.dueDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(hw)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400 hover:text-red-300" onClick={() => handleDelete(hw.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
