import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"

interface LoadingSpinnerProps {
  size?: "sm" | "default" | "lg"
  className?: string
}

export function LoadingSpinner({ size = "default", className }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    default: "h-6 w-6",
    lg: "h-8 w-8",
  }

  return (
    <Loader2
      data-slot="loading-spinner"
      className={cn("animate-spin text-muted-foreground", sizeClasses[size], className)}
    />
  )
}
