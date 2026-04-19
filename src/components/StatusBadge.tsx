import { Badge, badgeVariants } from "@/components/ui/badge"
import type { VariantProps } from "class-variance-authority"

type BadgeVariant = NonNullable<VariantProps<typeof badgeVariants>["variant"]>

const VARIANT_MAP: Record<string, BadgeVariant> = {
  // Primary
  active: "success",
  inactive: "destructive-solid",
  pending: "secondary",
  unknown: "outline",
  // Stages
  registered: "success-outline",
  published: "secondary",
  examining: "secondary",
  cancelled: "destructive",
  abandoned: "secondary",
  expired: "secondary",
  filed: "secondary",
  refused: "destructive",
  allowed: "success-outline",
  pending_issuance: "secondary",
  pending_opposition: "secondary",
}

const LABELS: Record<string, string> = {
  active: "Live",
  inactive: "Dead",
  pending: "Pending",
  unknown: "Unknown",
  pending_issuance: "Pending issuance",
  pending_opposition: "Pending opposition",
}

export function StatusBadge({
  value,
  type,
}: {
  value: string
  type: "primary" | "stage"
}) {
  const label =
    type === "primary"
      ? LABELS[value] ?? value
      : LABELS[value] ?? value.charAt(0).toUpperCase() + value.slice(1).replace(/_/g, " ")

  const variant = VARIANT_MAP[value] ?? "secondary"

  return (
    <Badge variant={variant} className="text-[11px]">
      {label}
    </Badge>
  )
}
