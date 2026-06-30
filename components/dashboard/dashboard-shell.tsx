"use client"

import { useState } from "react"
import { Sidebar } from "./sidebar"
import { Header } from "./header"
import type { UserRole } from "./nav-items"

interface DashboardShellProps {
  role: UserRole
  children: React.ReactNode
}

export function DashboardShell({ role, children }: DashboardShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar
        role={role}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex flex-1 flex-col">
        <Header
          role={role}
          onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
        />

        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
