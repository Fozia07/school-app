"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Plus, Calendar, X, Pencil, Trash2 } from "lucide-react"

interface EventRecord {
  id: string
  title: string
  description: string | null
  eventDate: string
  eventTime: string | null
  location: string | null
  organizer: string | null
  audience: string
}

export default function AdminEventsPage() {
  const [records, setRecords] = useState<EventRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<EventRecord | null>(null)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [eventDate, setEventDate] = useState("")
  const [eventTime, setEventTime] = useState("")
  const [location, setLocation] = useState("")
  const [organizer, setOrganizer] = useState("")
  const [audience, setAudience] = useState("all")

  const fetchData = async () => {
    setLoading(true)
    try { const r = await fetch("/api/events"); const d = await r.json(); setRecords(d.records || []) } catch {} finally { setLoading(false) }
  }
  useEffect(() => { fetchData() }, [])

  const resetForm = () => {
    setTitle(""); setDescription(""); setEventDate(""); setEventTime(""); setLocation(""); setOrganizer(""); setAudience("all")
    setEditing(null); setShowForm(false); setMessage(null)
  }

  const openEdit = (e: EventRecord) => {
    setEditing(e); setTitle(e.title); setDescription(e.description || ""); setEventDate(e.eventDate.split("T")[0])
    setEventTime(e.eventTime || ""); setLocation(e.location || ""); setOrganizer(e.organizer || ""); setAudience(e.audience)
    setShowForm(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !eventDate) return
    setSaving(true)
    try {
      const body = { title, description, eventDate, eventTime, location, organizer, audience }
      let res: Response
      if (editing) {
        res = await fetch(`/api/events/${editing.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
      } else {
        res = await fetch("/api/events", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
      }
      if (!res.ok) throw new Error()
      setMessage({ type: "success", text: editing ? "Event updated" : "Event created" })
      resetForm(); fetchData()
    } catch { setMessage({ type: "error", text: "Failed to save" }) } finally { setSaving(false) }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this event?")) return
    try {
      await fetch(`/api/events/${id}`, { method: "DELETE" })
      setRecords((prev) => prev.filter((r) => r.id !== id))
      setMessage({ type: "success", text: "Event deleted" })
    } catch { setMessage({ type: "error", text: "Failed to delete" }) }
  }

  const now = new Date()
  const upcoming = records.filter((r) => new Date(r.eventDate) >= now)
  const past = records.filter((r) => new Date(r.eventDate) < now)

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Events</h1>
          <p className="text-muted-foreground mt-1">Schedule and manage school events</p>
        </div>
        <Button onClick={() => { resetForm(); setShowForm(true) }}><Plus className="h-4 w-4 mr-2" /> New Event</Button>
      </div>

      {message && (
        <div className={`p-3 rounded-lg text-sm ${message.type === "success" ? "bg-green-500/10 text-green-300 border border-green-500/20" : "bg-red-500/10 text-red-300 border border-red-500/20"}`}>{message.text}</div>
      )}

      {showForm && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{editing ? "Edit Event" : "New Event"}</CardTitle>
            <Button variant="ghost" size="sm" onClick={resetForm}><X className="h-4 w-4" /></Button>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="flex min-h-20 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Date</Label>
                  <Input type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label>Time</Label>
                  <Input type="time" value={eventTime} onChange={(e) => setEventTime(e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Location</Label>
                  <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Auditorium" />
                </div>
                <div className="space-y-2">
                  <Label>Organizer</Label>
                  <Input value={organizer} onChange={(e) => setOrganizer(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Audience</Label>
                  <select value={audience} onChange={(e) => setAudience(e.target.value)}
                    className="flex h-9 w-full rounded-lg border border-input bg-background px-3 py-1 text-sm">
                    <option value="all">Everyone</option>
                    <option value="students">Students Only</option>
                    <option value="teachers">Teachers Only</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <Button type="submit" disabled={saving}>{saving ? <LoadingSpinner size="sm" className="mr-2" /> : null}{editing ? "Update" : "Create"}</Button>
                <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="flex justify-center py-12"><LoadingSpinner size="lg" /></div>
      ) : records.length === 0 ? (
        <Card><CardContent className="flex flex-col items-center py-12 text-muted-foreground">
          <Calendar className="h-12 w-12 mb-3 opacity-30" /><p>No events scheduled</p>
        </CardContent></Card>
      ) : (
        <>
          {upcoming.length > 0 && (
            <div>
              <h2 className="text-sm font-medium text-muted-foreground mb-3">Upcoming ({upcoming.length})</h2>
              <div className="grid gap-3">
                {upcoming.map((ev) => (
                  <Card key={ev.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1">
                          <h3 className="font-semibold">{ev.title}</h3>
                          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                            <span>{new Date(ev.eventDate).toLocaleDateString()}{ev.eventTime ? ` at ${ev.eventTime}` : ""}</span>
                            {ev.location && <span>{ev.location}</span>}
                            {ev.organizer && <span>By: {ev.organizer}</span>}
                          </div>
                          {ev.description && <p className="text-sm text-muted-foreground/80 mt-1">{ev.description}</p>}
                        </div>
                        <div className="flex gap-1 shrink-0">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(ev)}><Pencil className="h-3.5 w-3.5" /></Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400" onClick={() => handleDelete(ev.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {past.length > 0 && (
            <div>
              <h2 className="text-sm font-medium text-muted-foreground mb-3">Past ({past.length})</h2>
              <div className="grid gap-3 opacity-60">
                {past.map((ev) => (
                  <Card key={ev.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1">
                          <h3 className="font-semibold">{ev.title}</h3>
                          <p className="text-xs text-muted-foreground">{new Date(ev.eventDate).toLocaleDateString()}{ev.eventTime ? ` at ${ev.eventTime}` : ""}</p>
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400" onClick={() => handleDelete(ev.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
