"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { MessageSquare } from "lucide-react"

interface ComplaintRecord {
  id: string
  fromUserId: string
  category: string
  message: string
  status: string
  priority: string
  createdAt: string
  fromUser: { id: string; email: string }
}

const statusStyles: Record<string, string> = {
  pending: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  in_progress: "bg-blue-500/15 text-blue-300 border-blue-500/30",
  resolved: "bg-green-500/15 text-green-300 border-green-500/30",
  dismissed: "bg-red-500/15 text-red-300 border-red-500/30",
}

export default function TeacherComplaintsPage() {
  const [records, setRecords] = useState<ComplaintRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)

  const fetchData = async () => {
    setLoading(true)
    try { const r = await fetch("/api/complaints"); const d = await r.json(); setRecords(d.records || []) } catch {} finally { setLoading(false) }
  }
  useEffect(() => { fetchData() }, [])

  const updateStatus = async (id: string, status: string) => {
    setUpdating(id)
    try {
      await fetch(`/api/complaints/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) })
      fetchData()
    } catch {} finally { setUpdating(null) }
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Complaints</h1>
        <p className="text-muted-foreground mt-1">Review and respond to complaints</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><LoadingSpinner size="lg" /></div>
      ) : records.length === 0 ? (
        <Card><CardContent className="flex flex-col items-center py-12 text-muted-foreground">
          <MessageSquare className="h-12 w-12 mb-3 opacity-30" />
          <p>No complaints assigned to you</p>
        </CardContent></Card>
      ) : (
        <div className="space-y-3">
          {records.map((c) => (
            <Card key={c.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium capitalize text-muted-foreground">{c.category}</span>
                      <Badge variant="outline" className={statusStyles[c.status] || ""}>{c.status}</Badge>
                      <span className={`text-xs font-medium ${c.priority === "high" ? "text-red-400" : c.priority === "medium" ? "text-amber-400" : "text-muted-foreground"}`}>
                        {c.priority}
                      </span>
                    </div>
                    <p className="text-sm mt-1">{c.message}</p>
                    <p className="text-xs text-muted-foreground">From: {c.fromUser.email} &middot; {new Date(c.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    {c.status === "pending" && (
                      <Button size="sm" variant="outline" onClick={() => updateStatus(c.id, "in_progress")} disabled={updating === c.id}>
                        Accept
                      </Button>
                    )}
                    {c.status === "in_progress" && (
                      <>
                        <Button size="sm" variant="outline" onClick={() => updateStatus(c.id, "resolved")} disabled={updating === c.id}>
                          Resolve
                        </Button>
                        <Button size="sm" variant="outline" className="text-red-400" onClick={() => updateStatus(c.id, "dismissed")} disabled={updating === c.id}>
                          Dismiss
                        </Button>
                      </>
                    )}
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
