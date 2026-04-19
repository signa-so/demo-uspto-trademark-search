import { useState, useCallback, useRef } from "react"
import type {
  TrademarkSummary,
  SearchFilters,
  SortOption,
  Aggregations,
  SearchMeta,
  SearchResponse,
} from "@/types"
import { searchTrademarks, friendlyErrorMessage, type SearchStrategy } from "@/lib/signa"

export type { SearchStrategy }
export type SearchType = "wordmark" | "serial" | "registration"

export const DEFAULT_STRATEGIES: SearchStrategy[] = ["exact", "fuzzy"]

const DEFAULT_FILTERS: SearchFilters = {
  status_primary: [],
  status_stage: [],
  nice_classes: [],
  offices: [],
}

interface FetchOpts {
  query: string
  type: SearchType
  strategies: SearchStrategy[]
  filters: SearchFilters
  sort: SortOption
  limit: number
  page: number
  cursor?: string
}

interface FetchResult {
  response: SearchResponse
}

// A stable fingerprint of everything that makes a result-set unique.
// The prefetch cache is keyed by (page, fingerprint) so a stale prefetch
// can't serve the wrong filters.
function fingerprintOf(o: Omit<FetchOpts, "page" | "cursor">): string {
  return JSON.stringify([
    o.query,
    o.type,
    o.strategies,
    o.filters.status_primary,
    o.filters.status_stage,
    o.filters.nice_classes,
    o.filters.offices,
    o.sort,
    o.limit,
  ])
}

export function useTrademarkSearch(apiKey: string, defaultOffices: string[] = []) {
  const [results, setResults] = useState<TrademarkSummary[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [aggregations, setAggregations] = useState<Aggregations>({})
  const [searchMeta, setSearchMeta] = useState<SearchMeta | null>(null)
  const [totalResults, setTotalResults] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [limit, setLimit] = useState(20)
  const [query, setQuery] = useState("")
  const [submittedQuery, setSubmittedQuery] = useState("")
  const [submittedType, setSubmittedType] = useState<SearchType>("wordmark")
  const [strategies, setStrategies] = useState<SearchStrategy[]>(DEFAULT_STRATEGIES)
  const [filters, setFilters] = useState<SearchFilters>({
    ...DEFAULT_FILTERS,
    offices: defaultOffices,
  })
  const [sort, setSort] = useState<SortOption>("")
  const [hasSearched, setHasSearched] = useState(false)

  const cursors = useRef<Map<number, string>>(new Map())
  const abortRef = useRef<AbortController | null>(null)
  const prefetchCache = useRef<Map<string, Promise<FetchResult>>>(new Map())

  const doFetch = useCallback(
    async (opts: FetchOpts, signal: AbortSignal): Promise<FetchResult> => {
      const response = await searchTrademarks(apiKey, {
        query: opts.type === "wordmark" ? opts.query || undefined : undefined,
        applicationNumber: opts.type === "serial" ? opts.query.trim() || undefined : undefined,
        registrationNumber: opts.type === "registration" ? opts.query.trim() || undefined : undefined,
        office: opts.type === "wordmark" ? undefined : "uspto",
        strategies: opts.type === "wordmark" ? opts.strategies : undefined,
        filters: opts.filters,
        sort: opts.sort,
        limit: opts.limit,
        cursor: opts.cursor,
        includeTotal: true,
        signal,
      })

      return { response }
    },
    [apiKey]
  )

  const applyResult = useCallback(
    (page: number, { response }: FetchResult) => {
      setResults(response.data)
      setAggregations(response.aggregations ?? {})
      setSearchMeta(response.search_meta)
      setTotalResults(
        response.pagination.total_count ??
          response.search_meta.total_results ??
          0
      )
      setHasMore(response.has_more)
      setCurrentPage(page)
      if (response.pagination.cursor) {
        cursors.current.set(page + 1, response.pagination.cursor)
      }
    },
    []
  )

  const executeSearch = useCallback(
    async (opts: FetchOpts) => {
      abortRef.current?.abort()
      const controller = new AbortController()
      abortRef.current = controller

      setLoading(true)
      setError(null)
      setHasSearched(true)

      const key = `${opts.page}::${fingerprintOf(opts)}`

      try {
        const cached = prefetchCache.current.get(key)
        const resultPromise = cached ?? doFetch(opts, controller.signal)
        prefetchCache.current.set(key, resultPromise)
        const result = await resultPromise
        if (controller.signal.aborted) return
        applyResult(opts.page, result)
      } catch (err) {
        if (controller.signal.aborted) return
        if (err instanceof DOMException && err.name === "AbortError") return
        prefetchCache.current.delete(key)
        setError(friendlyErrorMessage(err))
        setResults([])
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    },
    [doFetch, applyResult]
  )

  const invalidatePrefetch = useCallback(() => {
    prefetchCache.current.clear()
  }, [])

  const prefetchPage = useCallback(
    (page: number) => {
      if (page === currentPage) return
      const opts: FetchOpts = {
        query: submittedQuery,
        type: submittedType,
        strategies,
        filters,
        sort,
        limit,
        page,
        cursor: cursors.current.get(page),
      }
      const key = `${page}::${fingerprintOf(opts)}`
      if (prefetchCache.current.has(key)) return
      if (page !== 1 && !opts.cursor) return

      // Prefetch requests share their own controller so they don't get
      // cancelled by the active search's AbortController.
      const prefetchController = new AbortController()
      const promise = doFetch(opts, prefetchController.signal)
      prefetchCache.current.set(key, promise)
      promise.catch(() => prefetchCache.current.delete(key))
    },
    [currentPage, submittedQuery, submittedType, strategies, filters, sort, limit, doFetch]
  )

  const search = useCallback(
    (q: string, type: SearchType = "wordmark") => {
      const trimmed = q.trim()
      if (!trimmed) return
      setSubmittedQuery(trimmed)
      setSubmittedType(type)
      cursors.current.clear()
      invalidatePrefetch()
      executeSearch({
        query: trimmed,
        type,
        strategies,
        filters,
        sort,
        limit,
        page: 1,
      })
    },
    [strategies, filters, sort, limit, executeSearch, invalidatePrefetch]
  )

  const updateFilters = useCallback(
    (newFilters: SearchFilters) => {
      setFilters(newFilters)
      cursors.current.clear()
      invalidatePrefetch()
      executeSearch({
        query: submittedQuery,
        type: submittedType,
        strategies,
        filters: newFilters,
        sort,
        limit,
        page: 1,
      })
    },
    [submittedQuery, submittedType, strategies, sort, limit, executeSearch, invalidatePrefetch]
  )

  const updateSort = useCallback(
    (newSort: SortOption) => {
      setSort(newSort)
      cursors.current.clear()
      invalidatePrefetch()
      executeSearch({
        query: submittedQuery,
        type: submittedType,
        strategies,
        filters,
        sort: newSort,
        limit,
        page: 1,
      })
    },
    [submittedQuery, submittedType, strategies, filters, limit, executeSearch, invalidatePrefetch]
  )

  const updateLimit = useCallback(
    (newLimit: number) => {
      setLimit(newLimit)
      cursors.current.clear()
      invalidatePrefetch()
      executeSearch({
        query: submittedQuery,
        type: submittedType,
        strategies,
        filters,
        sort,
        limit: newLimit,
        page: 1,
      })
    },
    [submittedQuery, submittedType, strategies, filters, sort, executeSearch, invalidatePrefetch]
  )

  const updateStrategies = useCallback(
    (newStrategies: SearchStrategy[]) => {
      setStrategies(newStrategies)
      cursors.current.clear()
      invalidatePrefetch()
      if (submittedType !== "wordmark" || !submittedQuery) return
      executeSearch({
        query: submittedQuery,
        type: submittedType,
        strategies: newStrategies,
        filters,
        sort,
        limit,
        page: 1,
      })
    },
    [submittedQuery, submittedType, filters, sort, limit, executeSearch, invalidatePrefetch]
  )

  const goToPage = useCallback(
    (page: number) => {
      if (page < 1) return
      const cursor = cursors.current.get(page)
      if (page === 1) {
        executeSearch({
          query: submittedQuery,
          type: submittedType,
          strategies,
          filters,
          sort,
          limit,
          page: 1,
        })
      } else if (cursor) {
        executeSearch({
          query: submittedQuery,
          type: submittedType,
          strategies,
          filters,
          sort,
          limit,
          page,
          cursor,
        })
      }
    },
    [submittedQuery, submittedType, strategies, filters, sort, limit, executeSearch]
  )

  const totalPages = Math.max(1, Math.ceil(totalResults / limit))

  return {
    results,
    loading,
    error,
    aggregations,
    searchMeta,
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
  }
}
