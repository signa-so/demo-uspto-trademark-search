import { useCallback } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronDown } from "lucide-react"
import type { SearchFilters, SortOption, Aggregations } from "@/types"
import type { SearchStrategy, SearchType } from "@/hooks/use-trademark-search"

interface FilterSidebarProps {
  filters: SearchFilters
  sort: SortOption
  aggregations: Aggregations
  strategies: SearchStrategy[]
  submittedType: SearchType
  onFiltersChange: (filters: SearchFilters) => void
  onSortChange: (sort: SortOption) => void
  onStrategiesChange: (strategies: SearchStrategy[]) => void
}

const STRATEGY_OPTIONS: { value: SearchStrategy; label: string; hint: string }[] = [
  { value: "exact", label: "Exact", hint: "Match the word exactly" },
  { value: "fuzzy", label: "Fuzzy", hint: "Allow typos and misspellings" },
  { value: "phonetic", label: "Phonetic", hint: "Sounds-like matches" },
  { value: "prefix", label: "Prefix", hint: "Starts-with matches" },
]

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-2.5 px-1">
      {children}
    </h3>
  )
}

function FilterRow({
  id,
  label,
  checked,
  onChange,
  count,
  indent,
  bold,
}: {
  id: string
  label: string
  checked: boolean
  onChange: (c: boolean) => void
  count?: number
  indent?: boolean
  bold?: boolean
}) {
  return (
    <div
      className={`flex items-center gap-2.5 py-1.5 px-2 rounded-md hover:bg-gray-50 cursor-pointer transition-colors ${indent ? "pl-7" : ""}`}
      onClick={() => onChange(!checked)}
    >
      <Checkbox
        id={id}
        checked={checked}
        onCheckedChange={(c) => onChange(!!c)}
        className="data-checked:bg-[#295E9F] data-checked:border-[#295E9F]"
      />
      <span className={`text-[13px] text-gray-700 select-none ${bold ? "font-medium" : ""}`}>{label}</span>
      {count !== undefined && (
        <span className="ml-auto text-[11px] text-gray-400 tabular-nums">{count.toLocaleString()}</span>
      )}
    </div>
  )
}

const SORT_OPTIONS: { value: string; sortValue: SortOption; label: string }[] = [
  { value: "relevance", sortValue: "", label: "Relevance" },
  { value: "-filing_date", sortValue: "-filing_date", label: "Filing date (newest)" },
  { value: "filing_date", sortValue: "filing_date", label: "Filing date (oldest)" },
  { value: "-registration_date", sortValue: "-registration_date", label: "Registration date (newest)" },
  { value: "registration_date", sortValue: "registration_date", label: "Registration date (oldest)" },
  { value: "-updated_at", sortValue: "-updated_at", label: "Recently updated" },
]

const CLASSES = Array.from({ length: 45 }, (_, i) => i + 1)

export function FilterSidebar({
  filters,
  sort,
  aggregations,
  strategies,
  submittedType,
  onFiltersChange,
  onSortChange,
  onStrategiesChange,
}: FilterSidebarProps) {
  const showStrategies = submittedType === "wordmark"

  const toggleStrategy = (value: SearchStrategy, checked: boolean) => {
    const next = checked
      ? [...strategies, value]
      : strategies.filter((s) => s !== value)
    if (next.length === 0) return
    onStrategiesChange(next)
  }
  const stageAgg = aggregations.status_stage ?? {}
  const registeredCount = stageAgg["registered"] ?? 0
  const pendingCount =
    (stageAgg["published"] ?? 0) +
    (stageAgg["examining"] ?? 0) +
    (stageAgg["allowed"] ?? 0) +
    (stageAgg["pending_opposition"] ?? 0) +
    (stageAgg["pending_issuance"] ?? 0)
  const cancelledCount = stageAgg["cancelled"] ?? 0
  const abandonedCount = stageAgg["abandoned"] ?? 0
  const expiredCount = stageAgg["expired"] ?? 0
  const liveCount = registeredCount + pendingCount
  const deadCount =
    cancelledCount + abandonedCount + expiredCount +
    (stageAgg["refused"] ?? 0) + (stageAgg["withdrawn"] ?? 0)

  // Derive checkbox state from filters
  const hasNoStatusFilter =
    filters.status_primary.length === 0 && filters.status_stage.length === 0
  const liveChecked = hasNoStatusFilter || filters.status_primary.includes("active")
  const deadChecked = hasNoStatusFilter || filters.status_primary.includes("inactive")
  const registeredChecked = hasNoStatusFilter || filters.status_stage.includes("registered")
  const pendingChecked = hasNoStatusFilter || filters.status_stage.includes("published") || filters.status_stage.includes("examining")
  const cancelledChecked = hasNoStatusFilter || filters.status_stage.includes("cancelled")
  const abandonedChecked = hasNoStatusFilter || filters.status_stage.includes("abandoned")

  const handleStatusToggle = useCallback(
    (field: string, checked: boolean) => {
      // Build next state
      const next = {
        live: liveChecked,
        registered: registeredChecked,
        pending: pendingChecked,
        dead: deadChecked,
        cancelled: cancelledChecked,
        abandoned: abandonedChecked,
      }

      switch (field) {
        case "live":
          next.live = checked
          if (!checked) { next.registered = false; next.pending = false }
          else { next.registered = true; next.pending = true }
          break
        case "registered":
          next.registered = checked
          if (checked) next.live = true
          else if (!next.pending) next.live = false
          break
        case "pending":
          next.pending = checked
          if (checked) next.live = true
          else if (!next.registered) next.live = false
          break
        case "dead":
          next.dead = checked
          if (!checked) { next.cancelled = false; next.abandoned = false }
          else { next.cancelled = true; next.abandoned = true }
          break
        case "cancelled":
          next.cancelled = checked
          if (checked) next.dead = true
          else if (!next.abandoned) next.dead = false
          break
        case "abandoned":
          next.abandoned = checked
          if (checked) next.dead = true
          else if (!next.cancelled) next.dead = false
          break
      }

      const allChecked = next.live && next.dead
      const noneChecked = !next.live && !next.dead
      if (allChecked || noneChecked) {
        onFiltersChange({ ...filters, status_primary: [], status_stage: [] })
        return
      }

      const primary: string[] = []
      const stage: string[] = []
      if (next.live) primary.push("active")
      if (next.dead) primary.push("inactive")
      if (next.registered) stage.push("registered")
      if (next.pending) { stage.push("published"); stage.push("examining") }
      if (next.cancelled) stage.push("cancelled")
      if (next.abandoned) stage.push("abandoned")

      onFiltersChange({ ...filters, status_primary: primary, status_stage: stage })
    },
    [filters, liveChecked, deadChecked, registeredChecked, pendingChecked, cancelledChecked, abandonedChecked, onFiltersChange]
  )

  const handleToggleClass = useCallback(
    (classNum: number) => {
      const current = filters.nice_classes
      const next = current.includes(classNum)
        ? current.filter((c) => c !== classNum)
        : [...current, classNum]
      onFiltersChange({ ...filters, nice_classes: next })
    },
    [filters, onFiltersChange]
  )

  const activeClassCount = filters.nice_classes.length

  return (
    <div className="space-y-5">
        {/* Status — USPTO style */}
        <div>
          <SectionTitle>Status filter</SectionTitle>
          <div className="space-y-0.5">
            <FilterRow id="filter-live" label="Live" checked={liveChecked} onChange={(c) => handleStatusToggle("live", c)} count={liveCount} bold />
            <FilterRow id="filter-registered" label="Registered" checked={registeredChecked} onChange={(c) => handleStatusToggle("registered", c)} count={registeredCount} indent />
            <FilterRow id="filter-pending" label="Pending" checked={pendingChecked} onChange={(c) => handleStatusToggle("pending", c)} count={pendingCount} indent />
            <FilterRow id="filter-dead" label="Dead" checked={deadChecked} onChange={(c) => handleStatusToggle("dead", c)} count={deadCount} bold />
            <FilterRow id="filter-cancelled" label="Cancelled" checked={cancelledChecked} onChange={(c) => handleStatusToggle("cancelled", c)} count={cancelledCount} indent />
            <FilterRow id="filter-abandoned" label="Abandoned" checked={abandonedChecked} onChange={(c) => handleStatusToggle("abandoned", c)} count={abandonedCount} indent />
          </div>
        </div>

        {/* Class filter */}
        <div>
          <div className="flex items-center justify-between px-1 mb-2.5">
            <SectionTitle>Nice class</SectionTitle>
            {activeClassCount > 0 && (
              <button
                onClick={() => onFiltersChange({ ...filters, nice_classes: [] })}
                className="text-[10px] text-[#295E9F] hover:text-[#1F4A7F] font-medium transition-colors"
              >
                Clear ({activeClassCount})
              </button>
            )}
          </div>
          <div className="grid grid-cols-5 gap-1 px-1">
            {CLASSES.map((cls) => {
              const isSelected = filters.nice_classes.includes(cls)
              return (
                <button
                  key={cls}
                  onClick={() => handleToggleClass(cls)}
                  className={`
                    text-[11px] py-1 rounded-md transition-all font-medium tabular-nums
                    ${isSelected
                      ? "bg-[#295E9F] text-white shadow-sm"
                      : "bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-gray-700 border border-gray-100"
                    }
                  `}
                >
                  {cls}
                </button>
              )
            })}
          </div>
        </div>

        {/* Sort */}
        <div>
          <SectionTitle>Sort</SectionTitle>
          <Select
            value={sort || "relevance"}
            onValueChange={(v) => {
              const opt = SORT_OPTIONS.find((o) => o.value === v)
              if (opt) onSortChange(opt.sortValue)
            }}
          >
            <SelectTrigger className="w-full h-8 text-[13px] rounded-lg border-gray-200 justify-between">
              {SORT_OPTIONS.find((o) => o.value === (sort || "relevance"))?.label ?? "Relevance"}
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value} className="text-[13px]">
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Advanced — match strategies */}
        {showStrategies && (
          <Collapsible>
            <CollapsibleTrigger className="flex items-center justify-between w-full px-1 py-1 text-[11px] font-semibold uppercase tracking-wider text-gray-400 hover:text-gray-600 transition-colors">
              <span>Advanced</span>
              <ChevronDown className="h-3.5 w-3.5 transition-transform aria-expanded:rotate-180" />
            </CollapsibleTrigger>
            <CollapsibleContent className="overflow-hidden">
              <div className="mt-2">
                <p className="text-[11px] text-gray-400 mb-1.5 px-1">Match type</p>
                <div className="space-y-0.5">
                  {STRATEGY_OPTIONS.map((opt) => (
                    <FilterRow
                      key={opt.value}
                      id={`filter-strategy-${opt.value}`}
                      label={opt.label}
                      checked={strategies.includes(opt.value)}
                      onChange={(c) => toggleStrategy(opt.value, c)}
                    />
                  ))}
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}
    </div>
  )
}
