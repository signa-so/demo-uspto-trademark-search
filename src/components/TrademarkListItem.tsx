import { StatusBadge } from "./StatusBadge"
import { TrademarkImage } from "./TrademarkImage"
import type { TrademarkSummary } from "@/types"

interface TrademarkListItemProps {
  trademark: TrademarkSummary
}

function ClassList({ classes }: { classes: number[] }) {
  if (classes.length === 0) return <span>—</span>
  const MAX_SHOW = 4
  const shown = classes.slice(0, MAX_SHOW)
  const overflow = classes.length - MAX_SHOW
  return (
    <span>
      Class {shown.map((c) => String(c).padStart(3, "0")).join(", ")}
      {overflow > 0 && <span className="text-gray-300"> (+{overflow})</span>}
    </span>
  )
}

export function TrademarkListItem({ trademark }: TrademarkListItemProps) {
  const gs = trademark.classifications
    .map((c) => {
      const prefix = `IC ${String(c.nice_class).padStart(3, "0")}`
      return c.goods_services_text ? `${prefix}: ${c.goods_services_text}` : prefix
    })
    .join("; ")

  const truncatedGs = gs && gs.length > 150 ? gs.slice(0, 150) + "..." : gs

  return (
    <div className="group flex items-stretch bg-white rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-md shadow-sm transition-all duration-200 overflow-hidden">
      <TrademarkImage
        src={trademark.primary_image_url}
        hasMedia={trademark.has_media}
        markText={trademark.mark_text}
        className="w-28 shrink-0 bg-gray-50/50 border-r border-gray-100 px-3"
        imgClassName="max-h-12 max-w-full object-contain"
        fallbackClassName="text-xs font-bold text-gray-700"
      />

      <div className="flex-1 min-w-0 px-4 py-3 space-y-1.5">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-gray-900 truncate">
            {trademark.mark_text ?? "—"}
          </span>
          <StatusBadge value={trademark.status.primary} type="primary" />
          {trademark.status.stage && (
            <StatusBadge value={trademark.status.stage} type="stage" />
          )}
        </div>

        {truncatedGs && (
          <p className="text-[12px] text-gray-500 leading-relaxed line-clamp-1">
            {truncatedGs}
          </p>
        )}

        <div className="flex items-center gap-4 text-[11px] text-gray-400">
          <ClassList classes={trademark.classifications.map((c) => c.nice_class)} />
          <span>Serial {trademark.application_number ?? "—"}</span>
          <span className="truncate">{trademark.owner_name ?? "—"}</span>
        </div>
      </div>
    </div>
  )
}
