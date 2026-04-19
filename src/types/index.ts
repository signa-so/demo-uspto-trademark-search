export interface TrademarkStatus {
  primary: "active" | "pending" | "inactive" | "unknown"
  stage: string | null
  reason: string | null
  challenges: string[]
}

export interface ClassificationSummary {
  nice_class: number
  goods_services_text: string | null
}

export interface TrademarkSummary {
  id: string
  object: "trademark"
  mark_text: string | null
  mark_feature_type: string | null
  mark_legal_category: string | null
  right_kind: string | null
  status: TrademarkStatus
  office_code: string
  jurisdiction_code: string
  scope_kind: string | null
  filing_route: string | null
  application_number: string | null
  registration_number: string | null
  filing_date: string | null
  registration_date: string | null
  expiry_date: string | null
  renewal_due_date: string | null
  classifications: ClassificationSummary[]
  owner_name: string | null
  has_media: boolean
  primary_image_url: string | null
  updated_at: string
  relevance_score: number | null
  match_explanation: {
    strategies_matched: string[]
    boost_factors: { factor: string; weight: number }[]
  } | null
  highlights: Record<string, string> | null
}

export interface Classification {
  nice_class: number
  nice_edition: string | null
  goods_services_text: string | null
  goods_services_language: string | null
  status: string | null
  class_status_raw: string | null
}

export interface Address {
  line_1?: string | null
  line_2?: string | null
  street?: string | null
  city?: string | null
  state?: string | null
  region?: string | null
  postal_code?: string | null
  country_code?: string | null
  country?: string | null
  formatted?: string | null
}

export interface Owner {
  id: string
  name: string
  country_code: string | null
  entity_type: string | null
  role: string | null
  address?: Address | string | null
  state_of_organization?: string | null
  organized_in?: string | null
}

export interface Attorney {
  id: string
  name: string
  firm_id: string | null
  firm_name: string | null
  role: string | null
  address?: Address | string | null
  email?: string | null
  phone?: string | null
  docket_number?: string | null
}

export interface Deadline {
  type: string
  name: string
  due_date: string
  grace_expiry: string | null
  window_opens: string | null
  jurisdiction_code: string | null
  status: string
  urgency: string
  days_until_due: number
  consequence_if_missed: string | null
}

export interface FilingBasis {
  basis_type: string
  nice_class_number: number | null
  first_use_date: string | null
  first_use_in_commerce_date: string | null
  foreign_application_number: string | null
  foreign_country_code: string | null
}

export interface Publication {
  publication_type: string
  publication_date: string | null
  bulletin_number: string | null
  source_reference: string | null
  opposition_period_start: string | null
  opposition_period_end: string | null
}

export interface DesignCode {
  code_system: string
  code_value: string
  edition: string | null
}

export interface Statement {
  type: string
  text: string
  language_code: string | null
  applies_to_class: number | null
}

export interface PriorityClaim {
  country_code: string
  application_number: string | null
  filing_date: string | null
}

export interface TextVariant {
  variant_type: string
  text: string
  language_code: string | null
  script: string | null
}

export interface TrademarkEvent {
  id: string
  object: "trademark_event"
  event_date: string | null
  event_type: string
  description: string | null
  raw_code: string | null
  raw_label: string | null
  event_scope: string | null
  status_after_event: string | null
  nice_class_number: number | null
  territory_code: string | null
  source_identifier: string | null
  sequence_no: number | null
}

export interface ProceedingParty {
  owner_id: string | null
  name: string | null
  role: string | null
  country_code: string | null
}

export interface Proceeding {
  id: string
  object: "proceeding"
  proceeding_type: string
  proceeding_number: string | null
  status: string | null
  filed_date: string | null
  decision_date: string | null
  decision_outcome: string | null
  parties: ProceedingParty[]
  contested_classes: number[]
  description: string | null
}

export interface EventsResponse {
  object: "list"
  data: TrademarkEvent[]
  has_more: boolean
  pagination: { cursor: string | null }
  livemode: boolean
  request_id: string
}

export interface ProceedingsResponse {
  object: "list"
  data: Proceeding[]
  has_more: boolean
  pagination: { cursor: string | null }
  livemode: boolean
  request_id: string
}

export interface TrademarkDetail extends TrademarkSummary {
  mark_text_language?: string | null
  mark_text_script?: string | null
  is_series_mark?: boolean | null
  is_retracted?: boolean
  publication_date?: string | null
  priority_date?: string | null
  termination_date?: string | null
  protection_effective_date?: string | null
  classifications: Classification[]
  owners?: Owner[]
  attorneys?: Attorney[]
  deadlines?: Deadline[]
  filing_bases?: FilingBasis[]
  publications?: Publication[]
  design_codes?: DesignCode[]
  statements?: Statement[]
  priority_claims?: PriorityClaim[]
  text_variants?: TextVariant[]
  office_extensions?: Record<string, unknown>
  events_count?: number
  proceedings_count?: number
  coverage_count?: number
  relationships_count?: number
  data_freshness?: {
    source_data_date: string | null
    source_format: string | null
    last_updated_at: string | null
  }
}

export interface SearchMeta {
  search_id: string
  query: string | null
  strategies_used: string[]
  total_results?: number
  total_count_exact?: boolean
  execution_time_ms: number
}

export interface Aggregations {
  [field: string]: Record<string, number>
}

export interface SearchResponse {
  object: "list"
  data: TrademarkSummary[]
  has_more: boolean
  pagination: {
    cursor: string | null
    total_count?: number
  }
  livemode: boolean
  request_id: string
  aggregations: Aggregations
  search_meta: SearchMeta
}

export interface IdentityResponse {
  object: "identity"
  org_id: string
  org_name: string
  plan: string
  api_key: {
    id: string
    prefix: string
    scopes: string[]
    rate_limit_tier: string
  }
  livemode: boolean
  request_id: string
}

export interface SearchFilters {
  status_primary: string[]
  status_stage: string[]
  nice_classes: number[]
  offices: string[]
}

export type ViewMode = "grid" | "list" | "compact"

export type SortOption =
  | ""
  | "filing_date"
  | "-filing_date"
  | "registration_date"
  | "-registration_date"
  | "updated_at"
  | "-updated_at"
