"use client"

import { usePathname } from "next/navigation"
import { Menu, Bell } from "lucide-react"
import { UserButton } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { getPageTitle, type UserRole } from "./nav-items"

interface HeaderProps {
  role: UserRole
  onToggleSidebar: () => void
}

export function Header({ role, onToggleSidebar }: HeaderProps) {
  const pathname = usePathname()
  const title = getPageTitle(pathname)

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-card/80 px-4 backdrop-blur-md sm:px-6">
      <Button
        variant="ghost"
        size="icon"
        onClick={onToggleSidebar}
        className="md:hidden"
        aria-label="Toggle sidebar"
      >
        <Menu className="h-5 w-5" />
      </Button>

      <div className="flex-1">
        <h1 className="text-xl font-bold text-foreground">{title}</h1>
      </div>

      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
          <Bell className="h-5 w-5" />
          <span className="absolute right-1.5 top-1.5 flex h-2 w-2 rounded-full bg-red-500 ring-2 ring-card" />
        </Button>

        <div className="flex items-center gap-2">
          <span className="hidden text-sm text-muted-foreground sm:inline capitalize">
            {role}
          </span>
          <UserButton
            appearance={{
              elements: {
                userButtonAvatarBox: "h-8 w-8",
              },
            }}
          />
        </div>
      </div>
    </header>
  )
}
