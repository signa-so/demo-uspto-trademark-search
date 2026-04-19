import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { LayoutGrid, List, AlignJustify } from "lucide-react"
import type { ViewMode } from "@/types"

interface ResultsHeaderProps {
  totalResults: number
  query: string
  viewMode: ViewMode
  onViewModeChange: (mode: ViewMode) => void
  loading?: boolean
}

export function ResultsHeader({
  totalResults,
  query,
  viewMode,
  onViewModeChange,
  loading,
}: ResultsHeaderProps) {
  return (
    <div className="flex items-center justify-between pb-4">
      {loading ? (
        <div className="h-5 flex items-center">
          <Skeleton className="h-4 w-48" />
        </div>
      ) : (
        <h2 className="text-sm font-medium text-gray-900">
          {totalResults.toLocaleString()} results
          {query && (
            <span className="text-gray-500 font-normal"> for {query}</span>
          )}
        </h2>
      )}
      <Tabs
        value={viewMode}
        onValueChange={(v) => onViewModeChange(v as ViewMode)}
      >
        <TabsList>
          <TabsTrigger value="grid" aria-label="Grid view">
            <LayoutGrid className="h-3.5 w-3.5" />
          </TabsTrigger>
          <TabsTrigger value="list" aria-label="List view">
            <List className="h-3.5 w-3.5" />
          </TabsTrigger>
          <TabsTrigger value="compact" aria-label="Table view">
            <AlignJustify className="h-3.5 w-3.5" />
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  )
}
