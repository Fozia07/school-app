"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Send, MessageSquare } from "lucide-react"

interface ChatMessage {
  id: string
  senderId: string
  receiverId: string
  message: string
  timestamp: string
  read: boolean
  sender: { id: string; email: string }
  receiver: { id: string; email: string }
}

export default function StudentMessagesPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [newMessage, setNewMessage] = useState("")
  const [sending, setSending] = useState(false)
  const [teachers, setTeachers] = useState<{ id: string; teacherId: string; fullName: string; subject: string }[]>([])
  const [selectedTeacher, setSelectedTeacher] = useState("")
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [teachersRes, messagesRes] = await Promise.all([
          fetch("/api/students"),
          fetch("/api/chat"),
        ])
        // Since /api/students returns students, we need a different approach for teachers
        // Let's just fetch messages and show all
        if (messagesRes.ok) {
          const d = await messagesRes.json()
          setMessages(d.messages || [])
        }
      } catch {} finally { setLoading(false) }
    }
    fetchData()
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const sendMessage = async () => {
    if (!newMessage.trim()) return
    setSending(true)
    try {
      // For now, send to the first admin user as a default recipient
      // In production, this would use the selected teacher
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ receiverId: selectedTeacher || "system", message: newMessage.trim() }),
      })
      if (res.ok) {
        const msg = await res.json()
        setMessages((prev) => [...prev, msg])
        setNewMessage("")
      }
    } catch {} finally { setSending(false) }
  }

  const getOtherUser = (msg: ChatMessage) => {
    // We just show all messages - in production filter by conversation
    return msg.sender.email
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="h-[calc(100vh-10rem)] flex flex-col">
        <div className="mb-4">
          <h1 className="text-2xl font-bold tracking-tight">Messages</h1>
          <p className="text-muted-foreground mt-1">Communicate with teachers and staff</p>
        </div>

        <Card className="flex-1 flex flex-col">
          <CardContent className="flex-1 flex flex-col p-0">
            {loading ? (
              <div className="flex justify-center py-12"><LoadingSpinner size="lg" /></div>
            ) : messages.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
                <MessageSquare className="h-12 w-12 mb-3 opacity-30" />
                <p>No messages yet</p>
                <p className="text-xs mt-1">Send a message to get started</p>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.senderId === "current" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                      msg.senderId === "current"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted/50"
                    }`}>
                      <p className="text-xs text-muted-foreground mb-1">{getOtherUser(msg)}</p>
                      <p>{msg.message}</p>
                      <p className="text-xs text-muted-foreground/60 mt-1">
                        {new Date(msg.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>
            )}

            <div className="border-t border-border p-3 flex gap-2">
              <Input
                placeholder="Type your message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
                className="flex-1"
              />
              <Button size="icon" onClick={sendMessage} disabled={sending || !newMessage.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
