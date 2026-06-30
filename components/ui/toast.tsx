"use client"

import { useState, useEffect, createContext, useContext, useCallback } from "react"
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"

type ToastVariant = "success" | "error" | "info" | "warning"

interface Toast {
  id: string
  message: string
  variant: ToastVariant
}

interface ToastContextValue {
  addToast: (message: string, variant?: ToastVariant) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error("useToast must be used within ToastProvider")
  return ctx
}

const iconMap = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
  warning: AlertTriangle,
}

const colorMap = {
  success: "border-green-500 bg-green-50 text-green-800",
  error: "border-red-500 bg-red-50 text-red-800",
  info: "border-blue-500 bg-blue-50 text-blue-800",
  warning: "border-amber-500 bg-amber-50 text-amber-800",
}

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) {
  const Icon = iconMap[toast.variant]

  useEffect(() => {
    const timer = setTimeout(() => onRemove(toast.id), 5000)
    return () => clearTimeout(timer)
  }, [toast.id, onRemove])

  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-lg border p-4 shadow-lg animate-in slide-in-from-right",
        colorMap[toast.variant]
      )}
    >
      <Icon className="h-5 w-5 shrink-0 mt-0.5" />
      <p className="flex-1 text-sm">{toast.message}</p>
      <button onClick={() => onRemove(toast.id)} className="shrink-0 rounded p-0.5 hover:opacity-70">
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback((message: string, variant: ToastVariant = "info") => {
    const id = Math.random().toString(36).slice(2)
    setToasts((prev) => [...prev, { id, message, variant }])
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}
