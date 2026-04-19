import { Search, AlertCircle } from "lucide-react"

interface EmptyStateProps {
  hasSearched: boolean
  query: string
  error: string | null
}

function StackedIcon({ icon: Icon, tone = "default" }: { icon: React.ComponentType<{ className?: string }>; tone?: "default" | "danger" }) {
  const cardBase =
    "flex size-9 items-center justify-center rounded-md border bg-white text-foreground " +
    "before:pointer-events-none before:absolute before:inset-0 before:rounded-[calc(var(--radius-md)-1px)] " +
    "before:shadow-[0_1px_rgba(0,0,0,0.04)]"
  const iconColor = tone === "danger" ? "text-red-400" : "text-gray-500"
  return (
    <div className="relative mb-4 h-9 w-[52px]">
      {/* Left decorative card */}
      <div
        aria-hidden="true"
        className={`${cardBase} pointer-events-none absolute bottom-0 left-[calc(50%-18px)] origin-bottom-left -translate-x-0.5 -rotate-[10deg] scale-[0.84] shadow-none`}
      />
      {/* Right decorative card */}
      <div
        aria-hidden="true"
        className={`${cardBase} pointer-events-none absolute bottom-0 left-[calc(50%-18px)] origin-bottom-right translate-x-0.5 rotate-[10deg] scale-[0.84] shadow-none`}
      />
      {/* Main card with icon */}
      <div className={`${cardBase} relative left-[calc(50%-18px)] shadow-sm/5`}>
        <Icon className={`h-4 w-4 ${iconColor}`} />
      </div>
    </div>
  )
}

export function EmptyState({ hasSearched, query, error }: EmptyStateProps) {
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <StackedIcon icon={AlertCircle} tone="danger" />
        <h3 className="text-base font-semibold text-gray-900 mb-1">Something went wrong</h3>
        <p className="text-sm text-gray-500 max-w-sm">{error}</p>
      </div>
    )
  }

  if (!hasSearched) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <StackedIcon icon={Search} />
        <h3 className="text-base font-semibold text-gray-900 mb-1">Search USPTO trademarks</h3>
        <p className="text-sm text-gray-500 max-w-sm">
          Search the USPTO register by wordmark, serial number, or registration number to get started.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <StackedIcon icon={Search} />
      <h3 className="text-base font-semibold text-gray-900 mb-1">No results</h3>
      <p className="text-sm text-gray-500 max-w-sm">
        Nothing found for &quot;{query}&quot;. Try a different term or adjust your filters.
      </p>
    </div>
  )
}
