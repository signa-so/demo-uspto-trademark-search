import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select"
import { Search, X, SlidersHorizontal } from "lucide-react"
import type { SearchType } from "@/hooks/use-trademark-search"

interface SearchBarProps {
  query: string
  onQueryChange: (q: string) => void
  onSearch: (q: string, type: SearchType) => void
  loading: boolean
  onOpenFilters?: () => void
}

const TYPE_OPTIONS: { value: SearchType; label: string; placeholder: string; inputMode?: "text" | "numeric" }[] = [
  { value: "wordmark", label: "Wordmark", placeholder: "Search trademarks by name..." },
  { value: "serial", label: "Serial number", placeholder: "Enter USPTO serial number...", inputMode: "numeric" },
  { value: "registration", label: "Registration number", placeholder: "Enter USPTO registration number...", inputMode: "numeric" },
]

export function SearchBar({ query, onQueryChange, onSearch, loading, onOpenFilters }: SearchBarProps) {
  const [type, setType] = useState<SearchType>("wordmark")
  const current = TYPE_OPTIONS.find((o) => o.value === type) ?? TYPE_OPTIONS[0]

  const canSubmit = query.trim().length > 0 && !loading

  const submit = () => {
    if (!canSubmit) return
    onSearch(query, type)
  }

  return (
    <div className="bg-gray-50 border-b">
      <div className="max-w-[1400px] mx-auto px-6 py-5 flex items-center gap-3">
        <div className="flex items-stretch h-12 rounded-md overflow-hidden flex-1 min-w-0">
          <Select value={type} onValueChange={(v) => setType(v as SearchType)}>
            <SelectTrigger
              className="h-12 data-[size=default]:h-12 rounded-none border-0 bg-[#295E9F] hover:bg-[#1F4A7F] text-white px-4 text-sm font-semibold shrink-0 gap-2 focus-visible:ring-0 focus-visible:ring-offset-0 [&>svg:last-child]:text-white/80"
            >
              <span className="text-white">{current.label}</span>
            </SelectTrigger>
            <SelectContent>
              {TYPE_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value} className="text-[13px]">
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="relative flex-1 flex items-center bg-white border-y border-gray-200 min-w-0">
            <Input
              value={query}
              onChange={(e) => onQueryChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") submit()
              }}
              placeholder={current.placeholder}
              inputMode={current.inputMode}
              maxLength={256}
              className="h-12 pl-4 pr-10 text-base rounded-none border-0 bg-transparent shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
            />
            {query && (
              <button
                onClick={() => onQueryChange("")}
                aria-label="Clear search"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-gray-600 transition-colors rounded-md hover:bg-gray-100"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <button
            onClick={submit}
            disabled={!canSubmit}
            aria-label="Search"
            className="h-12 w-12 shrink-0 bg-[#295E9F] hover:bg-[#1F4A7F] disabled:opacity-50 disabled:cursor-not-allowed text-white flex items-center justify-center transition-colors"
          >
            <Search className="h-4 w-4" />
          </button>
        </div>
        {onOpenFilters && (
          <button
            onClick={onOpenFilters}
            aria-label="Open filters"
            className="md:hidden h-12 w-12 shrink-0 rounded-md border border-gray-200 bg-white text-gray-600 hover:text-gray-900 hover:bg-gray-50 flex items-center justify-center transition-colors"
          >
            <SlidersHorizontal className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  )
}
