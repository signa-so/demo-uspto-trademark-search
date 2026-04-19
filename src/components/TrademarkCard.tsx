import { StatusBadge } from "./StatusBadge"
import { TrademarkImage } from "./TrademarkImage"
import type { TrademarkSummary } from "@/types"

interface TrademarkCardProps {
  trademark: TrademarkSummary
}

function ClassList({ classes }: { classes: number[] }) {
  if (classes.length === 0) return <span>—</span>
  const MAX_SHOW = 4
  const shown = classes.slice(0, MAX_SHOW)
  const overflow = classes.length - MAX_SHOW
  return (
    <span className="tabular-nums">
      {shown.map((c) => String(c).padStart(3, "0")).join(", ")}
      {overflow > 0 && <span className="text-gray-300 ml-0.5">(+{overflow})</span>}
    </span>
  )
}

export function TrademarkCard({ trademark }: TrademarkCardProps) {
  const gs = trademark.classifications
    .map((c) => {
      const prefix = `IC ${String(c.nice_class).padStart(3, "0")}`
      return c.goods_services_text ? `${prefix}: ${c.goods_services_text}` : prefix
    })
    .join("; ")

  const truncatedGs = gs && gs.length > 100 ? gs.slice(0, 100) + "..." : gs

  return (
    <div className="group h-full flex flex-col bg-white rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-lg shadow-sm transition-all duration-200 overflow-hidden">
      <TrademarkImage
        src={trademark.primary_image_url}
        hasMedia={trademark.has_media}
        markText={trademark.mark_text}
        className="h-28 shrink-0 px-5 bg-gray-50/50 group-hover:bg-gray-50 transition-colors"
        imgClassName="max-h-20 max-w-full object-contain"
        fallbackClassName="text-base font-bold text-gray-800"
      />

      <div className="flex-1 flex flex-col px-4 py-3 border-t border-gray-100">
        <span className="text-sm font-semibold text-gray-900 truncate">
          {trademark.mark_text ?? "—"}
        </span>

        <div className="flex items-center gap-1.5 mt-1">
          <StatusBadge value={trademark.status.primary} type="primary" />
          {trademark.status.stage && (
            <StatusBadge value={trademark.status.stage} type="stage" />
          )}
        </div>

        <p className="mt-2 text-[12px] text-gray-500 leading-relaxed line-clamp-2 min-h-[2.5em]">
          {truncatedGs || "\u00A0"}
        </p>

        <div className="flex-1" />

        <div className="flex items-center gap-3 pt-2 mt-2 border-t border-gray-50 text-[11px] text-gray-400">
          <ClassList classes={trademark.classifications.map((c) => c.nice_class)} />
          <span className="text-gray-200">|</span>
          <span className="tabular-nums">{trademark.application_number ?? "—"}</span>
        </div>

        <p className="mt-1.5 text-[11px] text-gray-400 truncate">
          {trademark.owner_name ?? "—"}
        </p>
      </div>
    </div>
  )
}
