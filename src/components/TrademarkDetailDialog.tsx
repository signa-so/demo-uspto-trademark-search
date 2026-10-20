import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { StatusBadge } from "./StatusBadge"
import { TrademarkImage } from "./TrademarkImage"
import { ChevronLeft, ChevronRight, X, ExternalLink, AlertCircle } from "lucide-react"
import {
  getTrademark,
  getTrademarkHistory,
  getTrademarkDeadlines,
  getTrademarkProceedings,
  friendlyErrorMessage,
} from "@/lib/signa"
import type { TrademarkSummary, TrademarkDetail, TrademarkEvent, Proceeding, Address, Deadline } from "@/types"

function formatAddress(addr: Address | string | null | undefined): string | null {
  if (!addr) return null
  if (typeof addr === "string") return addr.trim() || null
  if (addr.formatted) return addr.formatted
  const line1 = addr.line_1 ?? addr.street ?? null
  const cityRegion = [addr.city, addr.state ?? addr.region, addr.postal_code].filter(Boolean).join(" ")
  const country = addr.country ?? addr.country_code ?? null
  return [line1, addr.line_2, cityRegion, country].filter(Boolean).join("\n") || null
}

interface TrademarkDetailDialogProps {
  trademark: TrademarkSummary | null
  results: TrademarkSummary[]
  totalResults: number
  query: string
  onSelect: (tm: TrademarkSummary | null) => void
  open: boolean
  onClose: () => void
  apiKey: string
}

function formatDate(d: string | null | undefined): string | null {
  if (!d) return null
  try {
    return new Date(d).toISOString().slice(0, 10)
  } catch {
    return d
  }
}

function Field({
  label,
  children,
  className = "",
}: {
  label: string
  children: React.ReactNode
  className?: string
}) {
  const hasValue = children !== null && children !== undefined && children !== ""
  return (
    <div className={className}>
      <dt className="text-[13px] font-semibold text-gray-900 mb-0.5">{label}</dt>
      <dd className="text-[13px] text-gray-700 leading-relaxed">
        {hasValue ? children : <span className="text-gray-300">—</span>}
      </dd>
    </div>
  )
}

function SectionCard({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <Card className="ring-0 border border-gray-200 shadow-none rounded-lg bg-white">
      <CardContent className="px-6 py-5">
        {title && (
          <h3 className="text-[17px] font-semibold text-gray-900 mb-5">{title}</h3>
        )}
        {children}
      </CardContent>
    </Card>
  )
}

function NavButton({
  onClick,
  disabled,
  label,
  children,
}: {
  onClick: () => void
  disabled?: boolean
  label: string
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="h-8 w-8 flex items-center justify-center rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
    >
      {children}
    </button>
  )
}

export function TrademarkDetailDialog({
  trademark,
  results,
  totalResults,
  query,
  onSelect,
  open,
  onClose,
  apiKey,
}: TrademarkDetailDialogProps) {
  const [detail, setDetail] = useState<TrademarkDetail | null>(null)
  const [events, setEvents] = useState<TrademarkEvent[]>([])
  const [proceedings, setProceedings] = useState<Proceeding[]>([])
  const [deadlines, setDeadlines] = useState<Deadline[]>([])
  const [loading, setLoading] = useState(false)
  const [detailError, setDetailError] = useState<string | null>(null)

  useEffect(() => {
    if (!trademark || !open) return

    const id = trademark.id
    setLoading(true)

    const controller = new AbortController()

    const ignore = (err: unknown) => err instanceof DOMException && err.name === "AbortError"

    getTrademark(apiKey, id, controller.signal)
      .then((data) => {
        if (!controller.signal.aborted) setDetail(data)
      })
      .catch((err) => {
        if (ignore(err) || controller.signal.aborted) return
        setDetailError(friendlyErrorMessage(err))
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })

    getTrademarkHistory(apiKey, id, controller.signal)
      .then((r) => {
        if (!controller.signal.aborted) setEvents(r.data)
      })
      .catch((err) => {
        if (ignore(err) || controller.signal.aborted) return
        setEvents([])
      })

    getTrademarkDeadlines(apiKey, id, controller.signal)
      .then((r) => {
        if (!controller.signal.aborted) setDeadlines(r)
      })
      .catch((err) => {
        if (ignore(err) || controller.signal.aborted) return
        setDeadlines([])
      })

    getTrademarkProceedings(apiKey, id, controller.signal)
      .then((r) => {
        if (!controller.signal.aborted) setProceedings(r.data)
      })
      .catch((err) => {
        if (ignore(err) || controller.signal.aborted) return
        setProceedings([])
      })

    return () => controller.abort()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trademark?.id, open, apiKey])

  if (!trademark) return null

  const tm = trademark
  const d = detail
  const idx = results.findIndex((r) => r.id === tm.id)
  const canPrev = idx > 0
  const canNext = idx >= 0 && idx < results.length - 1
  const usptoUrl = tm.application_number
    ? `https://tmsearch.uspto.gov/search/search-results/${tm.application_number}`
    : null

  // Merge first-use data from filing_bases onto classifications by nice_class
  const firstUseByClass = new Map<number, { anywhere: string | null; commerce: string | null }>()
  for (const fb of d?.filing_bases ?? []) {
    if (fb.nice_class_number != null) {
      firstUseByClass.set(fb.nice_class_number, {
        anywhere: fb.first_use_date,
        commerce: fb.first_use_in_commerce_date,
      })
    }
  }

  const classes = (d?.classifications ?? []).map((c) => c.nice_class)
  const classesDisplay = classes.length > 0 ? classes.map((c) => String(c).padStart(3, "0")).join(", ") : null

  // Derive some common fields
  const markDrawingCode =
    tm.mark_feature_type === "word"
      ? "(4) Standard character drawing"
      : tm.mark_feature_type === "combined"
        ? "(3) Design plus words"
        : tm.mark_feature_type === "figurative"
          ? "(2) Design only"
          : null

  const ext = (d?.office_extensions ?? {}) as Record<string, unknown>
  const extStr = (k: string) =>
    typeof ext[k] === "string" && (ext[k] as string).length > 0 ? (ext[k] as string) : null
  const registrationType = extStr("register_type") ?? extStr("register")
  const caseStatus = extStr("case_status_description") ?? d?.status?.reason ?? null
  const statusDate = extStr("status_date")
  const tm5Status = extStr("tm5_status") ?? extStr("tm5_common_status")

  // Statements helpers — disclaimers, descriptions, translations, transliterations, etc.
  const findStatement = (type: string): string | null => {
    const s = d?.statements?.find((st) => st.type?.toLowerCase().replace(/[-\s]/g, "_") === type)
    return s?.text ?? null
  }
  const description = findStatement("description") ?? findStatement("description_of_mark")
  const disclaimer = findStatement("disclaimer")
  const translation = findStatement("translation")
  const transliteration = findStatement("transliteration")
  const colorClaim = findStatement("color_claim") ?? findStatement("colors_claimed")
  const standardCharStatement = findStatement("standard_character_claim")
  const standardCharacterClaim = standardCharStatement
    ? `Yes. ${standardCharStatement}`
    : tm.mark_legal_category === "standard"
      ? "Yes. The mark consists of standard characters without claim to any particular font style, size, or color."
      : tm.mark_legal_category === "figurative"
        ? "No"
        : null

  // Separate deadlines into maintenance vs other
  const maintenanceTypes = new Set([
    "renewal",
    "combined_renewal_and_use",
    "declaration_of_use",
    "declaration_of_incontestability",
    "international_renewal",
    "restoration",
  ])
  const maintenanceDeadlines = deadlines.filter((dl) =>
    maintenanceTypes.has(dl.type)
  )
  const renewalDeadline =
    maintenanceDeadlines.find((dl) => dl.type === "renewal" || dl.type === "combined_renewal_and_use") ?? null
  const nextForm =
    deadlines.slice().sort((a, b) => a.days_until_due - b.days_until_due)[0] ?? null

  // Find historical declaration events (§8, §9, §15)
  const declarationEvents = events.filter((e) => {
    const t = (e.event_type || "").toLowerCase()
    return t === "renewal" || t === "declaration_of_use" || t === "declaration_of_incontestability"
  })

  const goToPrev = () => { if (canPrev) onSelect(results[idx - 1]) }
  const goToNext = () => { if (canNext) onSelect(results[idx + 1]) }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose() }}>
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-[min(1100px,calc(100vw-80px))] w-[calc(100vw-80px)] max-h-[92vh] overflow-hidden rounded-2xl p-0 gap-0 flex flex-col bg-gray-50"
      >
        {/* Nav header */}
        <div className="shrink-0 px-6 pt-5 pb-4 flex items-center justify-between gap-6">
          <div className="min-w-0">
            <DialogTitle className="text-[15px] font-semibold text-gray-900 leading-tight">
              {idx >= 0 ? (
                <>
                  Result <span className="tabular-nums">{idx + 1}</span> of{" "}
                  <span className="tabular-nums">{totalResults.toLocaleString()}</span>
                  {query && <span className="font-normal text-gray-500"> for {query}</span>}
                </>
              ) : (
                <>Trademark detail</>
              )}
            </DialogTitle>
          </div>
          <div className="flex items-center shrink-0 gap-2">
            {usptoUrl && (
              <a
                href={usptoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[12px] text-gray-500 hover:text-[#295E9F] font-medium transition-colors mr-1"
              >
                View in USPTO
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
            <NavButton onClick={goToPrev} disabled={!canPrev} label="Previous trademark">
              <ChevronLeft className="h-4 w-4" />
            </NavButton>
            <NavButton onClick={goToNext} disabled={!canNext} label="Next trademark">
              <ChevronRight className="h-4 w-4" />
            </NavButton>
            <div className="mx-1 h-5 w-px bg-gray-200" />
            <NavButton onClick={onClose} label="Close">
              <X className="h-4 w-4" />
            </NavButton>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-4">
          {/* Trademark section */}
          <SectionCard>
            <div className="grid grid-cols-1 md:grid-cols-[240px_1fr_1fr] gap-x-10 gap-y-6">
              {/* Image column */}
              <div>
                <h3 className="text-[15px] font-semibold text-gray-900 mb-4">Trademark</h3>
                <TrademarkImage
                  src={tm.primary_image_url}
                  hasMedia={tm.has_media}
                  markText={tm.mark_text}
                  className="h-28 justify-start"
                  imgClassName="max-h-28 max-w-full object-contain"
                  fallbackClassName="text-xl font-bold text-gray-900"
                />
              </div>

              {/* Middle column */}
              <div className="space-y-5">
                <Field label="Wordmark">
                  <span className="font-medium text-gray-900">{tm.mark_text}</span>
                </Field>
                <Field label="Serial number">
                  <span className="font-mono tabular-nums">{tm.application_number}</span>
                </Field>
                <Field label="Registration number">
                  <span className="font-mono tabular-nums">
                    {d?.registration_number ?? tm.registration_number}
                  </span>
                </Field>
                <Field label="Status">
                  <div className="flex items-center gap-1.5 mt-1">
                    <StatusBadge value={tm.status.primary} type="primary" />
                    {tm.status.stage && <StatusBadge value={tm.status.stage} type="stage" />}
                  </div>
                </Field>
                {caseStatus && (
                  <Field label="Case status">
                    <span className="leading-relaxed">{caseStatus}</span>
                  </Field>
                )}
              </div>

              {/* Right column */}
              <div className="space-y-5">
                <Field label="Filing date">
                  <span className="tabular-nums">{formatDate(tm.filing_date)}</span>
                </Field>
                <Field label="Registration date">
                  <span className="tabular-nums">{formatDate(tm.registration_date)}</span>
                </Field>
                <Field label="Status date">
                  <span className="tabular-nums">{formatDate(statusDate)}</span>
                </Field>
                <Field label="Registration type">{registrationType}</Field>
                <Field label="Publication date">
                  <span className="tabular-nums">{formatDate(d?.publication_date)}</span>
                </Field>
                <Field label="Class">
                  <span className="tabular-nums">{classesDisplay}</span>
                </Field>
                {tm5Status && (
                  <Field label="TM5 Status">
                    <span className="text-gray-700">{tm5Status}</span>
                  </Field>
                )}
              </div>
            </div>
          </SectionCard>

          {detailError && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 flex items-start gap-2.5">
              <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
              <div className="min-w-0">
                <p className="text-[13px] font-semibold text-red-900">Couldn&apos;t load full trademark detail</p>
                <p className="text-[12px] text-red-700 mt-0.5 leading-relaxed">{detailError}</p>
              </div>
            </div>
          )}

          {loading && !d ? (
            <>
              <SectionCard title="Goods and services">
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </SectionCard>
              <SectionCard title="Current owner">
                <Skeleton className="h-4 w-64" />
              </SectionCard>
            </>
          ) : (
            <>
              {/* Goods and services */}
              {d?.classifications && d.classifications.length > 0 && (
                <SectionCard title="Goods and services">
                  <div className="space-y-4">
                    {d.classifications.map((cls, i) => {
                      const fu = firstUseByClass.get(cls.nice_class)
                      const pieces: React.ReactNode[] = []
                      pieces.push(
                        <span key="ic">
                          <span className="font-semibold text-gray-900">
                            IC {String(cls.nice_class).padStart(3, "0")}:
                          </span>{" "}
                          {cls.goods_services_text ?? "—"}
                        </span>
                      )
                      if (fu?.anywhere) {
                        pieces.push(
                          <span key="fua" className="text-gray-700">
                            {" "}| <span className="font-semibold">First Use Anywhere:</span>{" "}
                            <span className="tabular-nums">{formatDate(fu.anywhere)}</span>
                          </span>
                        )
                      }
                      if (fu?.commerce) {
                        pieces.push(
                          <span key="fuc" className="text-gray-700">
                            {" "}| <span className="font-semibold">First Use in Commerce:</span>{" "}
                            <span className="tabular-nums">{formatDate(fu.commerce)}</span>
                          </span>
                        )
                      }
                      return (
                        <p key={i} className="text-[13px] text-gray-700 leading-relaxed">
                          {pieces}
                        </p>
                      )
                    })}
                  </div>
                </SectionCard>
              )}

              {/* Current owner */}
              {((d?.owners && d.owners.length > 0) || tm.owner_name) && (
                <SectionCard title="Current owner">
                  {d?.owners && d.owners.length > 0 ? (
                    <div className="space-y-8">
                      {d.owners.map((owner, i) => {
                        const addr = formatAddress(owner.address)
                        const organized = owner.state_of_organization ?? owner.organized_in ?? null
                        return (
                          <dl key={i} className="grid grid-cols-2 gap-x-10 gap-y-5">
                            <Field label="Name">
                              <span className="font-medium text-gray-900">{owner.name}</span>
                            </Field>
                            <Field label="Address">
                              {addr ? (
                                <span className="whitespace-pre-line leading-relaxed">{addr}</span>
                              ) : null}
                            </Field>
                            <Field label="Entity type">
                              {owner.entity_type ? (
                                <span className="uppercase">{owner.entity_type}</span>
                              ) : null}
                            </Field>
                            <Field label="Organized">
                              {organized ? (
                                <span className="uppercase">{organized}</span>
                              ) : owner.country_code ? (
                                <span className="uppercase">{owner.country_code}</span>
                              ) : null}
                            </Field>
                            <Field label="Role">{owner.role}</Field>
                          </dl>
                        )
                      })}
                    </div>
                  ) : (
                    <dl className="grid grid-cols-2 gap-x-10 gap-y-5">
                      <Field label="Name">{tm.owner_name}</Field>
                    </dl>
                  )}
                </SectionCard>
              )}

              {/* Mark information */}
              <SectionCard title="Mark information">
                <dl className="grid grid-cols-2 gap-x-10 gap-y-5">
                  <Field label="Mark literal element">
                    <span className="font-medium text-gray-900">{tm.mark_text}</span>
                  </Field>
                  <Field label="Standard character claim">{standardCharacterClaim}</Field>
                  <Field label="Mark type">
                    {tm.right_kind ? <span className="uppercase">{tm.right_kind}</span> : null}
                  </Field>
                  <Field label="Mark drawing code">{markDrawingCode}</Field>
                  <Field label="Filing route">{tm.filing_route?.replace(/_/g, " ")}</Field>
                  <Field label="Scope">{tm.scope_kind}</Field>
                  <Field label="Description" className="col-span-2">
                    {description ? <span className="leading-relaxed">{description}</span> : null}
                  </Field>
                  <Field label="Translation">{translation}</Field>
                  <Field label="Transliteration">{transliteration}</Field>
                  <Field label="Disclaimer" className="col-span-2">
                    {disclaimer ? <span className="leading-relaxed">{disclaimer}</span> : null}
                  </Field>
                  {colorClaim && (
                    <Field label="Color claim" className="col-span-2">
                      <span className="leading-relaxed">{colorClaim}</span>
                    </Field>
                  )}
                </dl>
              </SectionCard>

              {/* Design codes */}
              {d?.design_codes && d.design_codes.length > 0 && (
                <SectionCard title="Design codes">
                  <div className="flex flex-wrap gap-2">
                    {d.design_codes.map((dc, i) => (
                      <div
                        key={i}
                        className="inline-flex items-center gap-2 rounded-md border border-gray-200 bg-gray-50 px-2.5 py-1"
                      >
                        <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
                          {dc.code_system}
                        </span>
                        <span className="text-[13px] font-mono tabular-nums text-gray-900">
                          {dc.code_value}
                        </span>
                        {dc.edition && (
                          <span className="text-[11px] text-gray-400">ed. {dc.edition}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </SectionCard>
              )}

              {/* Basis information */}
              {d?.filing_bases && d.filing_bases.length > 0 && (
                <SectionCard title="Basis information">
                  <div className="space-y-4">
                    {d.filing_bases.map((fb, i) => (
                      <dl key={i} className="grid grid-cols-2 sm:grid-cols-3 gap-x-10 gap-y-5">
                        <Field label="Basis">
                          <span className="uppercase">{fb.basis_type.replace(/_/g, " ")}</span>
                        </Field>
                        {fb.nice_class_number != null && (
                          <Field label="Class">
                            <span className="tabular-nums">
                              {String(fb.nice_class_number).padStart(3, "0")}
                            </span>
                          </Field>
                        )}
                        <Field label="First use">
                          <span className="tabular-nums">{formatDate(fb.first_use_date)}</span>
                        </Field>
                        <Field label="First use in commerce">
                          <span className="tabular-nums">
                            {formatDate(fb.first_use_in_commerce_date)}
                          </span>
                        </Field>
                        {fb.foreign_application_number && (
                          <Field label="Foreign application">
                            <span className="font-mono tabular-nums">
                              {fb.foreign_application_number}
                            </span>
                          </Field>
                        )}
                        {fb.foreign_country_code && (
                          <Field label="Foreign country">
                            <span className="uppercase">{fb.foreign_country_code}</span>
                          </Field>
                        )}
                      </dl>
                    ))}
                  </div>
                </SectionCard>
              )}

              {/* Attorney / correspondent */}
              {d?.attorneys && d.attorneys.length > 0 && (
                <SectionCard title="Attorney / correspondent">
                  <div className="space-y-8">
                    {d.attorneys.map((att, i) => {
                      const addr = formatAddress(att.address)
                      return (
                        <dl key={i} className="grid grid-cols-2 gap-x-10 gap-y-5">
                          <Field label="Name">
                            <span className="font-medium text-gray-900">{att.name}</span>
                          </Field>
                          <Field label="Firm">{att.firm_name}</Field>
                          <Field label="Role">
                            {att.role ? <span className="capitalize">{att.role}</span> : null}
                          </Field>
                          <Field label="Email">
                            {att.email ? (
                              <a
                                href={`mailto:${att.email}`}
                                className="text-[#295E9F] hover:text-[#1F4A7F]"
                              >
                                {att.email}
                              </a>
                            ) : null}
                          </Field>
                          <Field label="Phone">{att.phone}</Field>
                          <Field label="Docket number">
                            {att.docket_number ? (
                              <span className="font-mono tabular-nums">{att.docket_number}</span>
                            ) : null}
                          </Field>
                          <Field label="Address" className="col-span-2">
                            {addr ? (
                              <span className="whitespace-pre-line leading-relaxed">{addr}</span>
                            ) : null}
                          </Field>
                        </dl>
                      )
                    })}
                  </div>
                </SectionCard>
              )}

              {/* Maintenance information */}
              {(deadlines.length > 0 || declarationEvents.length > 0) && (
                <SectionCard title="Maintenance information">
                  <dl className="grid grid-cols-2 gap-x-10 gap-y-5">
                    {declarationEvents.length > 0 && (
                      <Field label="Declarations" className="col-span-2">
                        <ul className="space-y-1">
                          {declarationEvents.slice(0, 8).map((e, i) => (
                            <li key={i} className="flex items-baseline gap-3">
                              <span className="text-[12px] tabular-nums text-gray-500 w-20">
                                {formatDate(e.event_date)}
                              </span>
                              <span className="text-[13px] text-gray-700">
                                {e.raw?.label ?? e.description ?? e.event_type.replace(/_/g, " ")}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </Field>
                    )}
                    {nextForm && (
                      <Field label="Next form to file">
                        <span className="text-gray-700">{nextForm.name}</span>
                      </Field>
                    )}
                    {renewalDeadline && (
                      <>
                        <Field label="Earliest renewal date">
                          <span className="tabular-nums">{formatDate(renewalDeadline.window_opens)}</span>
                        </Field>
                        <Field label="Latest renewal date without additional fee">
                          <span className="tabular-nums">{formatDate(renewalDeadline.due_date)}</span>
                        </Field>
                        <Field label="Latest renewal date with additional fee">
                          <span className="tabular-nums">{formatDate(renewalDeadline.grace_expiry)}</span>
                        </Field>
                      </>
                    )}
                  </dl>

                  {maintenanceDeadlines.length > 0 && (
                    <div className="mt-6 pt-5 border-t border-gray-100">
                      <h4 className="text-[11px] font-semibold uppercase tracking-wide text-gray-500 mb-3">
                        Upcoming deadlines
                      </h4>
                      <div className="space-y-2.5">
                        {maintenanceDeadlines.map((dl, i) => {
                          const urgent = dl.urgency === "critical" || dl.urgency === "in_grace" || dl.urgency === "missed"
                          const warning = dl.urgency === "upcoming"
                          const borderColor = urgent
                            ? "border-red-200 bg-red-50/40"
                            : warning
                              ? "border-amber-200 bg-amber-50/40"
                              : "border-gray-200 bg-white"
                          return (
                            <div key={i} className={`rounded-lg border ${borderColor} px-4 py-3`}>
                              <div className="flex items-start justify-between gap-3 mb-2">
                                <div className="min-w-0">
                                  <p className="text-[13px] font-semibold text-gray-900">{dl.name}</p>
                                  <p className="text-[11px] text-gray-500 mt-0.5 capitalize">
                                    {dl.type.replace(/_/g, " ")}
                                  </p>
                                </div>
                                <Badge
                                  variant={urgent ? "destructive" : "secondary"}
                                  className="text-[10px] shrink-0 capitalize"
                                >
                                  {dl.urgency}
                                </Badge>
                              </div>
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[12px] pt-1">
                                <div>
                                  <div className="text-[11px] text-gray-500 font-semibold mb-0.5">Due</div>
                                  <div className="text-gray-900 tabular-nums">{formatDate(dl.due_date)}</div>
                                </div>
                                <div>
                                  <div className="text-[11px] text-gray-500 font-semibold mb-0.5">Grace</div>
                                  <div className="text-gray-700 tabular-nums">
                                    {formatDate(dl.grace_expiry) ?? <span className="text-gray-300">—</span>}
                                  </div>
                                </div>
                                <div>
                                  <div className="text-[11px] text-gray-500 font-semibold mb-0.5">Window opens</div>
                                  <div className="text-gray-700 tabular-nums">
                                    {formatDate(dl.window_opens) ?? <span className="text-gray-300">—</span>}
                                  </div>
                                </div>
                                <div>
                                  <div className="text-[11px] text-gray-500 font-semibold mb-0.5">Days left</div>
                                  <div className="text-gray-900 tabular-nums">{dl.days_until_due}</div>
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </SectionCard>
              )}

              {/* Publications */}
              {d?.publications && d.publications.length > 0 && (
                <SectionCard title="Publications">
                  <div className="space-y-4">
                    {d.publications.map((pub, i) => (
                      <dl key={i} className="grid grid-cols-2 gap-x-10 gap-y-5">
                        <Field label="Type">{pub.publication_type.replace(/_/g, " ")}</Field>
                        <Field label="Date">
                          <span className="tabular-nums">{formatDate(pub.publication_date)}</span>
                        </Field>
                        {pub.bulletin_number && <Field label="Bulletin">{pub.bulletin_number}</Field>}
                      </dl>
                    ))}
                  </div>
                </SectionCard>
              )}

              {/* Proceedings */}
              {proceedings.length > 0 && (
                <SectionCard title="Proceedings">
                  <div className="space-y-3">
                    {proceedings.map((pr) => (
                      <div
                        key={pr.id}
                        className="rounded-lg border border-gray-200 bg-white px-4 py-3"
                      >
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div className="min-w-0">
                            <p className="text-[13px] font-semibold text-gray-900 capitalize">
                              {pr.proceeding_type.replace(/_/g, " ")}
                              {pr.proceeding_number && (
                                <span className="ml-2 font-mono tabular-nums text-gray-500 font-normal">
                                  #{pr.proceeding_number}
                                </span>
                              )}
                            </p>
                            {pr.description && (
                              <p className="text-[12px] text-gray-600 mt-1 leading-relaxed">
                                {pr.description}
                              </p>
                            )}
                          </div>
                          {pr.status && (
                            <Badge variant="secondary" className="text-[10px] shrink-0 capitalize">
                              {pr.status.replace(/_/g, " ")}
                            </Badge>
                          )}
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[12px] pt-1">
                          <div>
                            <div className="text-[11px] text-gray-500 font-semibold mb-0.5">Filed</div>
                            <div className="text-gray-700 tabular-nums">
                              {formatDate(pr.filed_date) ?? <span className="text-gray-300">—</span>}
                            </div>
                          </div>
                          <div>
                            <div className="text-[11px] text-gray-500 font-semibold mb-0.5">Decision</div>
                            <div className="text-gray-700 tabular-nums">
                              {formatDate(pr.decision_date) ?? <span className="text-gray-300">—</span>}
                            </div>
                          </div>
                          {pr.decision_outcome && (
                            <div>
                              <div className="text-[11px] text-gray-500 font-semibold mb-0.5">Outcome</div>
                              <div className="text-gray-700 capitalize">
                                {pr.decision_outcome.replace(/_/g, " ")}
                              </div>
                            </div>
                          )}
                          {pr.contested_classes && pr.contested_classes.length > 0 && (
                            <div>
                              <div className="text-[11px] text-gray-500 font-semibold mb-0.5">Classes</div>
                              <div className="text-gray-700 tabular-nums">
                                {pr.contested_classes.map((c) => String(c).padStart(3, "0")).join(", ")}
                              </div>
                            </div>
                          )}
                        </div>
                        {pr.parties && pr.parties.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-gray-100">
                            <div className="text-[11px] text-gray-500 font-semibold mb-1.5 uppercase tracking-wide">
                              Parties
                            </div>
                            <ul className="space-y-0.5">
                              {pr.parties.map((p, i) => (
                                <li key={i} className="text-[12px] text-gray-700">
                                  <span className="text-gray-500 capitalize mr-2">
                                    {p.role?.replace(/_/g, " ") ?? "—"}:
                                  </span>
                                  {p.name ?? "—"}
                                  {p.country_code && (
                                    <span className="text-gray-400 ml-1.5 uppercase">
                                      ({p.country_code})
                                    </span>
                                  )}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </SectionCard>
              )}

              {/* Prosecution history */}
              {events.length > 0 && (
                <SectionCard title="Prosecution history">
                  <ol className="relative">
                    {/* Line: 1px wide, centered on dot (dot center = x=5) */}
                    <div className="absolute left-[5px] top-[10px] bottom-[10px] w-px bg-gray-200" aria-hidden="true" />
                    {events.map((e) => (
                      <li key={e.id} className="relative grid grid-cols-[88px_1fr] gap-4 py-2.5 first:pt-0 last:pb-0">
                        {/* Date column */}
                        <div className="relative pl-6 text-[12px] tabular-nums text-gray-500 leading-[22px]">
                          {/* Dot: 11px (odd for pixel-aligned 1px line), center at x=5 */}
                          <div className="absolute left-0 top-[5px] h-[11px] w-[11px] rounded-full bg-white ring-[1.5px] ring-gray-300" aria-hidden="true" />
                          {formatDate(e.event_date) ?? <span className="text-gray-300">—</span>}
                        </div>
                        {/* Content column */}
                        <div className="min-w-0">
                          <p className="text-[13px] text-gray-900 leading-[22px]">
                            {e.raw?.label ?? e.description ?? e.event_type.replace(/_/g, " ")}
                          </p>
                          {e.description && e.raw?.label && e.description !== e.raw.label && (
                            <p className="text-[12px] text-gray-500 mt-0.5 leading-relaxed">
                              {e.description}
                            </p>
                          )}
                        </div>
                      </li>
                    ))}
                  </ol>
                </SectionCard>
              )}
            </>
          )}
        </div>

      </DialogContent>
    </Dialog>
  )
}
