import { StatusBadge } from "./StatusBadge"
import { TrademarkImage } from "./TrademarkImage"
import type { TrademarkSummary } from "@/types"

interface TrademarkTableProps {
  results: TrademarkSummary[]
  onSelect: (trademark: TrademarkSummary) => void
  pageOffset: number
}

export function TrademarkTable({ results, onSelect, pageOffset }: TrademarkTableProps) {
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            <th className="text-left py-2.5 px-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider w-14">
              #
            </th>
            <th className="text-left py-2.5 px-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider w-20">
              Image
            </th>
            <th className="text-left py-2.5 px-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
              Wordmark
            </th>
            <th className="text-left py-2.5 px-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider w-32">
              Class
            </th>
            <th className="text-left py-2.5 px-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider w-24">
              Serial
            </th>
            <th className="text-left py-2.5 px-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider w-56">
              Owner
            </th>
            <th className="text-left py-2.5 px-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider w-40">
              Status
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {results.map((tm, idx) => {
            return (
              <tr
                key={tm.id}
                role="button"
                tabIndex={0}
                aria-label={`Open details for ${tm.mark_text ?? "trademark"}`}
                className="hover:bg-gray-50/80 cursor-pointer transition-colors focus:outline-none focus-visible:bg-gray-100"
                onClick={() => onSelect(tm)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault()
                    onSelect(tm)
                  }
                }}
              >
                <td className="py-2.5 px-3 text-gray-400 tabular-nums text-xs">
                  {pageOffset + idx + 1}
                </td>
                <td className="py-2.5 px-3">
                  <TrademarkImage
                    src={tm.primary_image_url}
                    hasMedia={tm.has_media}
                    markText={tm.mark_text}
                    className="w-14 h-10 bg-gray-50 rounded border border-gray-100"
                    imgClassName="max-h-8 max-w-12 object-contain"
                    fallbackClassName="text-[9px] font-bold text-gray-400"
                    fallbackMaxChars={6}
                  />
                </td>
                <td className="py-2.5 px-3">
                  <span className="text-gray-900 font-medium text-[13px]">
                    {tm.mark_text ?? "—"}
                  </span>
                </td>
                <td className="py-2.5 px-3 text-gray-600 text-xs tabular-nums">
                  {(() => {
                    const cls = tm.classifications.map((c) => c.nice_class)
                    if (cls.length === 0) return "—"
                    const MAX = 4
                    const shown = cls.slice(0, MAX).map((c) => String(c).padStart(3, "0")).join(", ")
                    const overflow = cls.length - MAX
                    return overflow > 0 ? `${shown} (+${overflow})` : shown
                  })()}
                </td>
                <td className="py-2.5 px-3 text-gray-600 text-xs tabular-nums">
                  {tm.application_number ?? "—"}
                </td>
                <td className="py-2.5 px-3 text-gray-600 text-xs">
                  <span className="block truncate" title={tm.owner_name ?? undefined}>
                    {tm.owner_name ?? "—"}
                  </span>
                </td>
                <td className="py-2.5 px-3">
                  <div className="flex items-center gap-1.5">
                    <StatusBadge value={tm.status.primary} type="primary" />
                    {tm.status.stage && (
                      <StatusBadge value={tm.status.stage} type="stage" />
                    )}
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
