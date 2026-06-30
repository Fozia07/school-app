"use client"

import { Button } from "@/components/ui/button"

export default function TeacherError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center p-12">
      <h2 className="text-xl font-bold mb-2">Something went wrong</h2>
      <p className="text-sm text-muted-foreground mb-6">{error.message}</p>
      <Button onClick={reset}>Try again</Button>
    </div>
  )
}
