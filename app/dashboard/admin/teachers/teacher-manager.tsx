"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Search, GraduationCap } from "lucide-react"
import { useMemo, useState } from "react"

interface TeacherWithDetails {
  id: string
  teacherId: string
  fullName: string
  subject: string
  qualification: string | null
  salary: number | null
  joiningDate: string | Date
  user: { email: string }
  classes: { className: string; section: string }[]
}

interface TeacherManagerProps { teachers: TeacherWithDetails[] }

export function TeacherManager({ teachers }: TeacherManagerProps) {
  const [search, setSearch] = useState("")

  const filtered = useMemo(() => {
    if (!search) return teachers
    const q = search.toLowerCase()
    return teachers.filter((t) => t.fullName.toLowerCase().includes(q) || t.teacherId.toLowerCase().includes(q) || t.subject.toLowerCase().includes(q))
  }, [search, teachers])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Teachers</h1>
        <p className="text-muted-foreground mt-1">View and manage teaching staff</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card><CardHeader className="pb-2"><CardTitle className="text-2xl font-bold text-center">{teachers.length}</CardTitle></CardHeader><CardContent className="text-center text-sm pb-4">Total Teachers</CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-2xl font-bold text-center">{teachers.filter((t) => t.classes.length > 0).length}</CardTitle></CardHeader><CardContent className="text-center text-sm pb-4">With Classes</CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-2xl font-bold text-center">{[...new Set(teachers.map((t) => t.subject))].length}</CardTitle></CardHeader><CardContent className="text-center text-sm pb-4">Subjects</CardContent></Card>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input placeholder="Search by name, ID, or subject..." value={search} onChange={(e) => setSearch(e.target.value)}
          className="flex h-9 w-full rounded-lg border border-input bg-background pl-9 pr-3 py-1 text-sm" />
      </div>

      {filtered.length === 0 ? (
        <Card><CardContent className="flex flex-col items-center py-12 text-muted-foreground">
          <GraduationCap className="h-12 w-12 mb-3 opacity-30" /><p>No teachers found</p>
        </CardContent></Card>
      ) : (
        <div className="grid gap-3">
          {filtered.map((t) => (
            <Card key={t.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <h3 className="font-semibold">{t.fullName}</h3>
                    <p className="text-sm text-muted-foreground">{t.subject}{t.qualification ? ` | ${t.qualification}` : ""}</p>
                    <p className="text-xs text-muted-foreground">{t.user.email} &middot; ID: {t.teacherId}</p>
                    {t.classes.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {t.classes.map((c) => (
                          <Badge key={`${c.className}-${c.section}`} variant="outline" className="text-xs">
                            {c.className}-{c.section}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="text-right text-xs text-muted-foreground shrink-0">
                    <p>Joined {new Date(t.joiningDate).toLocaleDateString()}</p>
                    {t.salary && <p className="mt-1">${t.salary.toFixed(2)}</p>}
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
