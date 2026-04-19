import { TrademarkCard } from "./TrademarkCard"
import { TrademarkListItem } from "./TrademarkListItem"
import { TrademarkTable } from "./TrademarkTable"
import { Skeleton } from "@/components/ui/skeleton"
import type { TrademarkSummary, ViewMode } from "@/types"

interface ResultsAreaProps {
  results: TrademarkSummary[]
  viewMode: ViewMode
  loading: boolean
  onSelectTrademark: (tm: TrademarkSummary) => void
  pageOffset: number
}

function GridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} className="flex flex-col bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {/* Mark area — matches TrademarkCard h-28 */}
          <div className="h-28 shrink-0 bg-gray-50/50" />
          {/* Details — matches TrademarkCard content structure */}
          <div className="flex-1 flex flex-col px-4 py-3 border-t border-gray-100">
            <Skeleton className="h-4 w-28" />
            <div className="flex items-center gap-1.5 mt-1">
              <Skeleton className="h-5 w-12 rounded-full" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
            <div className="mt-2 min-h-[2.5em] space-y-1">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-2/3" />
            </div>
            <div className="flex-1" />
            <div className="flex items-center gap-3 pt-2 mt-2 border-t border-gray-50">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-3 w-16" />
            </div>
            <Skeleton className="h-3 w-24 mt-1.5" />
          </div>
        </div>
      ))}
    </div>
  )
}

function ListSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex items-stretch rounded-xl border border-gray-200 overflow-hidden">
          <div className="w-0.5 bg-gray-200 shrink-0" />
          <Skeleton className="w-28 shrink-0 rounded-none" />
          <div className="flex-1 p-4 space-y-2">
            <div className="flex gap-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-5 w-12 rounded-full" />
            </div>
            <Skeleton className="h-3 w-3/4" />
          </div>
        </div>
      ))}
    </div>
  )
}

function TableSkeleton() {
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <div className="bg-gray-50 border-b border-gray-200 h-10" />
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-3 py-3 border-b border-gray-50">
          <Skeleton className="h-3 w-6" />
          <Skeleton className="h-8 w-14 rounded" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-16 ml-auto" />
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>
      ))}
    </div>
  )
}

export function ResultsArea({ results, viewMode, loading, onSelectTrademark, pageOffset }: ResultsAreaProps) {
  if (loading && results.length === 0) {
    if (viewMode === "grid") return <GridSkeleton />
    if (viewMode === "compact") return <TableSkeleton />
    return <ListSkeleton />
  }

  if (results.length === 0) return null

  const dimmedClass = loading ? "opacity-50 pointer-events-none transition-opacity" : "transition-opacity"

  if (viewMode === "grid") {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 ${dimmedClass}`}>
        {results.map((tm) => (
          <button
            key={tm.id}
            type="button"
            onClick={() => onSelectTrademark(tm)}
            aria-label={`Open details for ${tm.mark_text ?? "trademark"}`}
            className="text-left cursor-pointer rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#295E9F] focus-visible:ring-offset-2"
          >
            <TrademarkCard trademark={tm} />
          </button>
        ))}
      </div>
    )
  }

  if (viewMode === "compact") {
    return (
      <div className={dimmedClass}>
        <TrademarkTable
          results={results}
          onSelect={onSelectTrademark}
          pageOffset={pageOffset}
        />
      </div>
    )
  }

  return (
    <div className={`space-y-2.5 ${dimmedClass}`}>
      {results.map((tm) => (
        <button
          key={tm.id}
          type="button"
          onClick={() => onSelectTrademark(tm)}
          aria-label={`Open details for ${tm.mark_text ?? "trademark"}`}
          className="w-full text-left cursor-pointer rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#295E9F] focus-visible:ring-offset-2"
        >
          <TrademarkListItem trademark={tm} />
        </button>
      ))}
    </div>
  )
}
