import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, MapPin, Clock, User } from "lucide-react"

export default async function StudentEventsPage() {
  const user = await getCurrentUser()
  if (!user || user.role !== "student") redirect("/dashboard")

  const now = new Date()
  const records = await prisma.event.findMany({
    where: { eventDate: { gte: now }, audience: { in: ["all", "students"] } },
    orderBy: { eventDate: "asc" },
  })

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Upcoming Events</h1>
        <p className="text-muted-foreground mt-1">Stay informed about school events</p>
      </div>

      {records.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center py-12 text-muted-foreground">
            <Calendar className="h-12 w-12 mb-3 opacity-30" />
            <p>No upcoming events</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {records.map((event) => (
            <Card key={event.id}>
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-start gap-4">
                  <div className="flex flex-col items-center min-w-14 bg-muted/30 rounded-lg p-2">
                    <span className="text-lg font-bold">{new Date(event.eventDate).getDate()}</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(event.eventDate).toLocaleDateString("en-US", { month: "short" })}
                    </span>
                  </div>
                  <div className="space-y-1 min-w-0 flex-1">
                    <h3 className="font-semibold">{event.title}</h3>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(event.eventDate).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                      </span>
                      {event.eventTime && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {event.eventTime}
                        </span>
                      )}
                      {event.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {event.location}
                        </span>
                      )}
                      {event.organizer && (
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {event.organizer}
                        </span>
                      )}
                    </div>
                    {event.description && (
                      <p className="text-sm text-muted-foreground/80 mt-2">{event.description}</p>
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
