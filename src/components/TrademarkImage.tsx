import { useState } from "react"
import { cn } from "@/lib/utils"

interface TrademarkImageProps {
  src: string | null | undefined
  hasMedia: boolean
  markText: string | null
  className?: string
  imgClassName?: string
  fallbackClassName?: string
  fallbackText?: string
  /** Maximum characters of markText to show in the fallback. */
  fallbackMaxChars?: number
}

/**
 * Renders a trademark image with a graceful text fallback when the image
 * is missing, fails to load, or when `hasMedia` is false.
 */
export function TrademarkImage({
  src,
  hasMedia,
  markText,
  className,
  imgClassName,
  fallbackClassName,
  fallbackText,
  fallbackMaxChars,
}: TrademarkImageProps) {
  const [errored, setErrored] = useState(false)
  const showImage = hasMedia && !!src && !errored

  const rawFallback = fallbackText ?? markText ?? "—"
  const label =
    fallbackMaxChars && rawFallback.length > fallbackMaxChars
      ? rawFallback.slice(0, fallbackMaxChars)
      : rawFallback

  return (
    <div className={cn("flex items-center justify-center", className)}>
      {showImage ? (
        <img
          src={src}
          alt={markText ?? "Trademark image"}
          className={imgClassName}
          onError={() => setErrored(true)}
        />
      ) : (
        <span className={cn("text-center leading-tight", fallbackClassName)}>{label}</span>
      )}
    </div>
  )
}
