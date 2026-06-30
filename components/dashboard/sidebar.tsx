"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { X, School } from "lucide-react"
import { cn } from "@/lib/utils"
import { roleNavMap, roleActiveBg, type UserRole } from "./nav-items"

interface SidebarProps {
  role: UserRole
  open: boolean
  onClose: () => void
}

export function Sidebar({ role, open, onClose }: SidebarProps) {
  const pathname = usePathname()
  const sections = roleNavMap[role]

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden" onClick={onClose} />
      )}

      <aside
        className={cn(
          "fixed top-0 left-0 z-50 flex h-full w-64 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-transform duration-300 md:static md:z-auto md:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-6">
          <Link href={`/dashboard/${role}`} className="flex items-center gap-2" onClick={onClose}>
            <School className="h-6 w-6 text-blue-400" />
            <span className="text-lg font-bold">SchoolMS</span>
          </Link>
          <button onClick={onClose} className="rounded-md p-1 hover:bg-sidebar-accent md:hidden">
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {sections.map((section) => (
            <div key={section.title} className="mb-6">
              <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/50">
                {section.title}
              </p>
              <ul className="space-y-1">
                {section.items.map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={onClose}
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                          isActive && roleActiveBg[role]
                        )}
                      >
                        <item.icon className="h-4 w-4 shrink-0" />
                        <span>{item.title}</span>
                        {item.badge !== undefined && item.badge > 0 && (
                          <span className="ml-auto rounded-full px-2 py-0.5 text-xs font-medium bg-sidebar-accent text-sidebar-accent-foreground">
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </nav>

        <div className="border-t border-sidebar-border p-4">
          <p className="text-xs text-sidebar-foreground/40">
            &copy; {new Date().getFullYear()} SchoolMS
          </p>
        </div>
      </aside>
    </>
  )
}
