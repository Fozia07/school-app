import { Skeleton } from "@/components/ui/skeleton"

export default function StudentLoading() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8">
      <Skeleton className="h-32 w-full rounded-xl" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-40 rounded-xl" />
        ))}
      </div>
    </div>
  )
}
