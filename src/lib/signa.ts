import type {
  SearchResponse,
  IdentityResponse,
  SearchFilters,
  SortOption,
  TrademarkDetail,
  EventsResponse,
  ProceedingsResponse,
} from "@/types"

const BASE = "/api/v1"

export class SignaApiError extends Error {
  status: number
  detail: string | null

  constructor(message: string, status: number, detail: string | null = null) {
    super(message)
    this.name = "SignaApiError"
    this.status = status
    this.detail = detail
  }
}

export function friendlyErrorMessage(err: unknown): string {
  if (err instanceof SignaApiError) {
    if (err.status === 401) return "Your Signa API key is invalid or expired. Check VITE_SIGNA_API_KEY in your .env file."
    if (err.status === 403) return "This API key doesn't have access to that resource."
    if (err.status === 429) return "Too many requests — slow down a little and try again."
    if (err.status === 404) return "We couldn't find that trademark."
    if (err.status >= 500) return "Signa's API is having trouble right now. Please try again in a moment."
    return err.detail ?? err.message
  }
  if (err instanceof DOMException && err.name === "AbortError") return "Request cancelled."
  if (err instanceof TypeError) return "Network error — check your connection and try again."
  if (err instanceof Error) return err.message
  return "Something unexpected happened."
}

function headers(apiKey: string): HeadersInit {
  return {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
  }
}

async function parseError(res: Response): Promise<SignaApiError> {
  const body = await res.json().catch(() => null) as { detail?: unknown; error?: unknown; message?: unknown } | null
  const detail =
    (body && typeof body.detail === "string" && body.detail) ||
    (body && typeof body.error === "string" && body.error) ||
    (body && typeof body.message === "string" && body.message) ||
    null
  return new SignaApiError(detail ?? `Request failed: ${res.status}`, res.status, detail)
}

function isListEnvelope(x: unknown): x is { object: "list"; data: unknown[] } {
  return (
    typeof x === "object" &&
    x !== null &&
    (x as { object?: unknown }).object === "list" &&
    Array.isArray((x as { data?: unknown }).data)
  )
}

async function parseListResponse<T>(res: Response): Promise<T> {
  const body = await res.json().catch(() => null)
  if (!isListEnvelope(body)) {
    throw new SignaApiError("Unexpected response shape from Signa API", res.status)
  }
  return body as T
}

export async function getMe(apiKey: string, signal?: AbortSignal): Promise<IdentityResponse> {
  const res = await fetch(`${BASE}/me`, {
    headers: headers(apiKey),
    signal,
  })
  if (!res.ok) throw await parseError(res)
  return res.json()
}

export type SearchStrategy = "exact" | "fuzzy" | "phonetic" | "prefix"

export async function searchTrademarks(
  apiKey: string,
  params: {
    query?: string
    filters: SearchFilters
    sort: SortOption
    limit: number
    cursor?: string
    includeTotal?: boolean
    applicationNumber?: string
    registrationNumber?: string
    office?: string
    strategies?: SearchStrategy[]
    signal?: AbortSignal
  }
): Promise<SearchResponse> {
  const isIdentifierSearch = !!(params.applicationNumber || params.registrationNumber)

  const body: Record<string, unknown> = {
    options: {
      aggregations: ["status_stage"],
      include_total: params.includeTotal ?? true,
    },
    limit: params.limit,
  }

  if (params.query && !isIdentifierSearch) {
    body.query = params.query
    body.strategies = params.strategies && params.strategies.length > 0
      ? params.strategies
      : ["exact", "fuzzy"]
  }

  if (params.cursor) {
    body.cursor = params.cursor
  }

  if (params.sort && !isIdentifierSearch) {
    body.sort = params.sort
  }

  const filters: Record<string, unknown> = {}

  if (isIdentifierSearch) {
    if (params.applicationNumber) filters.application_number = params.applicationNumber
    if (params.registrationNumber) filters.registration_number = params.registrationNumber
    filters.office = params.office ?? "uspto"
  } else {
    if (params.filters.status_primary.length > 0 && params.filters.status_primary.length < 3) {
      filters.status_primary = params.filters.status_primary
    }
    if (params.filters.status_stage.length > 0) {
      filters.status_stage = params.filters.status_stage
    }
    if (params.filters.nice_classes.length > 0) {
      filters.nice_classes = params.filters.nice_classes
    }
    if (params.filters.offices.length > 0) {
      filters.offices = params.filters.offices
    }
  }

  if (Object.keys(filters).length > 0) {
    body.filters = filters
  }

  const res = await fetch(`${BASE}/trademarks`, {
    method: "POST",
    headers: headers(apiKey),
    body: JSON.stringify(body),
    signal: params.signal,
  })

  if (!res.ok) throw await parseError(res)
  return parseListResponse<SearchResponse>(res)
}

export async function getTrademark(
  apiKey: string,
  id: string,
  signal?: AbortSignal
): Promise<TrademarkDetail> {
  const res = await fetch(`${BASE}/trademarks/${id}`, { headers: headers(apiKey), signal })
  if (!res.ok) throw await parseError(res)
  return res.json()
}

export async function getTrademarkHistory(
  apiKey: string,
  id: string,
  signal?: AbortSignal
): Promise<EventsResponse> {
  const res = await fetch(`${BASE}/trademarks/${id}/history?limit=50`, {
    headers: headers(apiKey),
    signal,
  })
  if (!res.ok) throw await parseError(res)
  return parseListResponse<EventsResponse>(res)
}

export async function getTrademarkProceedings(
  apiKey: string,
  id: string,
  signal?: AbortSignal
): Promise<ProceedingsResponse> {
  const res = await fetch(`${BASE}/trademarks/${id}/proceedings?limit=20`, {
    headers: headers(apiKey),
    signal,
  })
  if (!res.ok) throw await parseError(res)
  return parseListResponse<ProceedingsResponse>(res)
}
