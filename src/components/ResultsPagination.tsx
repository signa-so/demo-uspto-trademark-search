import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface ResultsPaginationProps {
  currentPage: number
  totalPages: number
  limit: number
  hasMore: boolean
  onPageChange: (page: number) => void
  onLimitChange: (limit: number) => void
  onPrefetchPage?: (page: number) => void
}

export function ResultsPagination({
  currentPage,
  totalPages,
  limit,
  hasMore,
  onPageChange,
  onLimitChange,
  onPrefetchPage,
}: ResultsPaginationProps) {
  return (
    <div className="flex items-center justify-between pt-6 pb-4 mt-4 border-t border-gray-100">
      <Select
        value={String(limit)}
        onValueChange={(v) => onLimitChange(Number(v))}
      >
        <SelectTrigger className="w-[120px] h-8 text-xs rounded-lg border-gray-200">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="20">20 per page</SelectItem>
          <SelectItem value="50">50 per page</SelectItem>
          <SelectItem value="100">100 per page</SelectItem>
        </SelectContent>
      </Select>

      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-500 tabular-nums mr-1">
          Page {currentPage} of {totalPages}
        </span>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 rounded-lg border-gray-200"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
          onMouseEnter={() => currentPage > 1 && onPrefetchPage?.(currentPage - 1)}
          onFocus={() => currentPage > 1 && onPrefetchPage?.(currentPage - 1)}
        >
          <ChevronLeft className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 rounded-lg border-gray-200"
          disabled={!hasMore}
          onClick={() => onPageChange(currentPage + 1)}
          onMouseEnter={() => hasMore && onPrefetchPage?.(currentPage + 1)}
          onFocus={() => hasMore && onPrefetchPage?.(currentPage + 1)}
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  )
}
