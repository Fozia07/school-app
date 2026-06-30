import {
  LayoutDashboard,
  Calendar,
  BookOpen,
  FileText,
  MessageSquare,
  ClipboardList,
  Users,
  ClipboardCheck,
  BarChart,
  GraduationCap,
  DollarSign,
  AlertCircle,
  type LucideIcon,
} from "lucide-react"

export type UserRole = "student" | "teacher" | "admin"

export interface NavItem {
  title: string
  href: string
  icon: LucideIcon
  badge?: number
}

export interface NavSection {
  title: string
  items: NavItem[]
}

const studentNav: NavSection[] = [
  {
    title: "Overview",
    items: [
      { title: "Dashboard", href: "/dashboard/student", icon: LayoutDashboard },
    ],
  },
  {
    title: "Academic",
    items: [
      { title: "Attendance", href: "/dashboard/student/attendance", icon: Calendar },
      { title: "Homework", href: "/dashboard/student/homework", icon: BookOpen },
      { title: "Results", href: "/dashboard/student/results", icon: FileText },
    ],
  },
  {
    title: "Communication",
    items: [
      { title: "Messages", href: "/dashboard/student/messages", icon: MessageSquare },
      { title: "Complaints", href: "/dashboard/student/complaints", icon: ClipboardList },
    ],
  },
  {
    title: "Info",
    items: [
      { title: "Fees", href: "/dashboard/student/fees", icon: DollarSign },
      { title: "Events", href: "/dashboard/student/events", icon: Calendar },
    ],
  },
]

const teacherNav: NavSection[] = [
  {
    title: "Overview",
    items: [
      { title: "Dashboard", href: "/dashboard/teacher", icon: LayoutDashboard },
    ],
  },
  {
    title: "Teaching",
    items: [
      { title: "My Classes", href: "/dashboard/teacher/classes", icon: Users },
      { title: "Mark Attendance", href: "/dashboard/teacher/attendance", icon: ClipboardCheck },
      { title: "Homework", href: "/dashboard/teacher/homework", icon: BookOpen },
      { title: "Upload Results", href: "/dashboard/teacher/results", icon: FileText },
    ],
  },
  {
    title: "Management",
    items: [
      { title: "Complaints", href: "/dashboard/teacher/complaints", icon: ClipboardList },
      { title: "Analytics", href: "/dashboard/teacher/analytics", icon: BarChart },
    ],
  },
]

const adminNav: NavSection[] = [
  {
    title: "Overview",
    items: [
      { title: "Dashboard", href: "/dashboard/admin", icon: LayoutDashboard },
    ],
  },
  {
    title: "Management",
    items: [
      { title: "Students", href: "/dashboard/admin/students", icon: Users },
      { title: "Teachers", href: "/dashboard/admin/teachers", icon: GraduationCap },
      { title: "Fees", href: "/dashboard/admin/fees", icon: DollarSign },
      { title: "Events", href: "/dashboard/admin/events", icon: Calendar },
    ],
  },
  {
    title: "Oversight",
    items: [
      { title: "Attendance Report", href: "/dashboard/admin/attendance", icon: ClipboardCheck },
      { title: "Complaints", href: "/dashboard/admin/complaints", icon: AlertCircle },
      { title: "Reports", href: "/dashboard/admin/reports", icon: BarChart },
    ],
  },
]

export const roleNavMap: Record<UserRole, NavSection[]> = {
  student: studentNav,
  teacher: teacherNav,
  admin: adminNav,
}

export const roleAccentColors: Record<UserRole, string> = {
  student: "text-blue-400",
  teacher: "text-emerald-400",
  admin: "text-purple-400",
}

export const roleAccentBg: Record<UserRole, string> = {
  student: "bg-blue-500/10 text-blue-300",
  teacher: "bg-emerald-500/10 text-emerald-300",
  admin: "bg-purple-500/10 text-purple-300",
}

export const roleActiveBg: Record<UserRole, string> = {
  student: "bg-blue-500/15 text-blue-300 font-medium",
  teacher: "bg-emerald-500/15 text-emerald-300 font-medium",
  admin: "bg-purple-500/15 text-purple-300 font-medium",
}

export function getPageTitle(pathname: string): string {
  const segments = pathname.split("/").filter(Boolean)
  if (segments.length < 2) return "Dashboard"
  const last = segments[segments.length - 1]
  return last.charAt(0).toUpperCase() + last.slice(1).replace(/-/g, " ")
}

export function getGreeting(name?: string): string {
  if (name) return `Welcome back, ${name}`
  return "Welcome back"
}
