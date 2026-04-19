import { Suspense, lazy, useState } from "react"
import { useTrademarkSearch } from "@/hooks/use-trademark-search"
import { Header } from "./components/Header"
import { UsptoRef } from "./components/UsptoRef"
import { SearchBar } from "./components/SearchBar"
import { FilterSidebar } from "./components/FilterSidebar"
import { ResultsHeader } from "./components/ResultsHeader"
import { ResultsArea } from "./components/ResultsArea"
import { ResultsPagination } from "./components/ResultsPagination"
import { EmptyState } from "./components/EmptyState"
import { MissingKeyScreen } from "./components/MissingKeyScreen"
import { Footer } from "./components/Footer"
import { MobileFilterSheet } from "./components/MobileFilterSheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { ViewMode, TrademarkSummary } from "@/types"

const TrademarkDetailDialog = lazy(() =>
  import("./components/TrademarkDetailDialog").then((m) => ({ default: m.TrademarkDetailDialog }))
)

const API_KEY: string | undefined = import.meta.env.VITE_SIGNA_API_KEY

export default function App() {
  const [viewMode, setViewMode] = useState<ViewMode>("grid")
  const hasKey = typeof API_KEY === "string" && API_KEY.startsWith("sig_")

  if (!hasKey) {
    return (
      <div className="min-h-screen bg-gray-50/50 flex flex-col">
        <Header />
        <UsptoRef />
        <MissingKeyScreen />
        <Footer />
      </div>
    )
  }

  return <Authenticated apiKey={API_KEY as string} viewMode={viewMode} setViewMode={setViewMode} />
}

function Authenticated({
  apiKey,
  viewMode,
  setViewMode,
}: {
  apiKey: string
  viewMode: ViewMode
  setViewMode: (m: ViewMode) => void
}) {
  const [selectedTrademark, setSelectedTrademark] = useState<TrademarkSummary | null>(null)
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

  const {
    results,
    loading,
    error,
    aggregations,
    totalResults,
    hasMore,
    currentPage,
    totalPages,
    limit,
    query,
    setQuery,
    submittedQuery,
    submittedType,
    strategies,
    filters,
    sort,
    hasSearched,
    search,
    updateFilters,
    updateSort,
    updateLimit,
    updateStrategies,
    goToPage,
    prefetchPage,
  } = useTrademarkSearch(apiKey, ["uspto"])

  const showResults = hasSearched && results.length > 0
  const showEmpty = hasSearched && !loading && results.length === 0
  const showInitial = !hasSearched && !loading

  const pageOffset = (currentPage - 1) * limit

  const sidebar = (
    <FilterSidebar
      filters={filters}
      sort={sort}
      aggregations={aggregations}
      strategies={strategies}
      submittedType={submittedType}
      onFiltersChange={updateFilters}
      onSortChange={updateSort}
      onStrategiesChange={updateStrategies}
    />
  )

  return (
    <div className="min-h-screen bg-gray-50/50 flex flex-col">
      <Header />
      <UsptoRef />
      <SearchBar
        query={query}
        onQueryChange={setQuery}
        onSearch={search}
        loading={loading}
        onOpenFilters={() => setMobileFiltersOpen(true)}
      />

      <div className="flex flex-1 max-w-[1400px] mx-auto w-full px-6 pt-5 pb-8 gap-6">
        {/* Sidebar — desktop only */}
        <aside className="hidden md:block shrink-0 sticky top-14 self-start pt-4">
          <ScrollArea className="h-[calc(100vh-160px)]">
            <div className="w-48 pr-4">
              {sidebar}
            </div>
          </ScrollArea>
        </aside>

        {/* Mobile sheet */}
        <MobileFilterSheet open={mobileFiltersOpen} onClose={() => setMobileFiltersOpen(false)}>
          {sidebar}
        </MobileFilterSheet>

        {/* Main */}
        <main className="flex-1 min-w-0">
          {showResults && (
            <>
              <ResultsHeader
                totalResults={totalResults}
                query={submittedQuery}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
              />
              <ResultsArea
                results={results}
                viewMode={viewMode}
                loading={loading}
                onSelectTrademark={setSelectedTrademark}
                pageOffset={pageOffset}
              />
              <ResultsPagination
                currentPage={currentPage}
                totalPages={totalPages}
                limit={limit}
                hasMore={hasMore}
                onPageChange={goToPage}
                onLimitChange={updateLimit}
                onPrefetchPage={prefetchPage}
              />
            </>
          )}

          {loading && !showResults && (
            <>
              <ResultsHeader
                totalResults={0}
                query=""
                viewMode={viewMode}
                onViewModeChange={setViewMode}
                loading={true}
              />
              <ResultsArea
                results={[]}
                viewMode={viewMode}
                loading={true}
                onSelectTrademark={() => {}}
                pageOffset={0}
              />
            </>
          )}

          {showEmpty && (
            <EmptyState hasSearched={true} query={submittedQuery} error={error} />
          )}

          {showInitial && (
            <EmptyState hasSearched={false} query="" error={null} />
          )}

          {error && !showEmpty && (
            <EmptyState hasSearched={true} query={submittedQuery} error={error} />
          )}
        </main>
      </div>

      <Footer />

      <Suspense fallback={null}>
        {selectedTrademark !== null && (
          <TrademarkDetailDialog
            key={selectedTrademark.id}
            trademark={selectedTrademark}
            results={results}
            totalResults={totalResults}
            query={submittedQuery}
            onSelect={setSelectedTrademark}
            open={true}
            onClose={() => setSelectedTrademark(null)}
            apiKey={apiKey}
          />
        )}
      </Suspense>
    </div>
  )
}
