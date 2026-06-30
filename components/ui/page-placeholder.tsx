import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { LucideIcon } from "lucide-react"

interface PagePlaceholderProps {
  title: string
  description: string
  icon: LucideIcon
  color?: string
}

export function PagePlaceholder({ title, description, icon: Icon, color = "text-muted-foreground" }: PagePlaceholderProps) {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <Card className="mx-auto max-w-lg">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-muted p-4">
              <Icon className={cn("h-8 w-8", color)} />
            </div>
          </div>
          <CardTitle className="text-xl">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
          <p className="mt-4 text-xs text-muted-foreground">
            This feature is coming soon.
          </p>
        </CardHeader>
      </Card>
    </div>
  )
}
