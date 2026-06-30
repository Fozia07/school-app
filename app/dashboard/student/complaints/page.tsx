"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Plus, X, MessageSquare } from "lucide-react"

interface ComplaintRecord {
  id: string
  fromUserId: string
  toUserId: string | null
  category: string
  message: string
  status: string
  priority: string
  createdAt: string
  resolvedAt: string | null
  assignedTo: { id: string; email: string } | null
  fromUser: { id: string; email: string }
}

const statusStyles: Record<string, string> = {
  pending: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  in_progress: "bg-blue-500/15 text-blue-300 border-blue-500/30",
  resolved: "bg-green-500/15 text-green-300 border-green-500/30",
  dismissed: "bg-red-500/15 text-red-300 border-red-500/30",
}

export default function StudentComplaints() {
  const [records, setRecords] = useState<ComplaintRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [category, setCategory] = useState("academic")
  const [message, setMessage] = useState("")
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const fetchData = async () => {
    setLoading(true)
    try { const r = await fetch("/api/complaints"); const d = await r.json(); setRecords(d.records || []) } catch {} finally { setLoading(false) }
  }
  useEffect(() => { fetchData() }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message) return
    setSaving(true)
    try {
      const r = await fetch("/api/complaints", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ category, message }) })
      if (!r.ok) throw new Error()
      setMsg({ type: "success", text: "Complaint submitted" })
      setShowForm(false); setMessage(""); fetchData()
    } catch { setMsg({ type: "error", text: "Failed to submit" }) } finally { setSaving(false) }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Complaints</h1>
          <p className="text-muted-foreground mt-1">Submit and track your complaints</p>
        </div>
        <Button onClick={() => setShowForm(true)}><Plus className="h-4 w-4 mr-2" /> New Complaint</Button>
      </div>

      {msg && (
        <div className={`p-3 rounded-lg text-sm ${msg.type === "success" ? "bg-green-500/10 text-green-300 border border-green-500/20" : "bg-red-500/10 text-red-300 border border-red-500/20"}`}>{msg.text}</div>
      )}

      {showForm && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>New Complaint</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => setShowForm(false)}><X className="h-4 w-4" /></Button>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <select value={category} onChange={(e) => setCategory(e.target.value)}
                  className="flex h-9 w-full rounded-lg border border-input bg-background px-3 py-1 text-sm">
                  <option value="academic">Academic</option>
                  <option value="behavior">Behavior</option>
                  <option value="facility">Facility</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Message</Label>
                <textarea value={message} onChange={(e) => setMessage(e.target.value)} required
                  className="flex min-h-24 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" />
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={saving}>{saving ? <LoadingSpinner size="sm" className="mr-2" /> : null}Submit</Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="flex justify-center py-12"><LoadingSpinner size="lg" /></div>
      ) : records.length === 0 ? (
        <Card><CardContent className="flex flex-col items-center py-12 text-muted-foreground">
          <MessageSquare className="h-12 w-12 mb-3 opacity-30" />
          <p>No complaints yet</p>
        </CardContent></Card>
      ) : (
        <div className="space-y-3">
          {records.map((c) => (
            <Card key={c.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium capitalize text-muted-foreground">{c.category}</span>
                      <Badge variant="outline" className={statusStyles[c.status] || ""}>{c.status}</Badge>
                    </div>
                    <p className="text-sm mt-1">{c.message}</p>
                    <p className="text-xs text-muted-foreground">{new Date(c.createdAt).toLocaleDateString()}</p>
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
