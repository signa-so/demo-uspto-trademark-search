import { Dialog as DialogPrimitive } from "@base-ui/react/dialog"
import { X } from "lucide-react"

interface MobileFilterSheetProps {
  open: boolean
  onClose: () => void
  children: React.ReactNode
}

export function MobileFilterSheet({ open, onClose, children }: MobileFilterSheetProps) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={(o) => { if (!o) onClose() }}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Backdrop className="fixed inset-0 z-50 bg-black/30 md:hidden data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0" />
        <DialogPrimitive.Popup
          className="fixed inset-y-0 left-0 z-50 w-[85vw] max-w-sm bg-white shadow-xl md:hidden flex flex-col data-open:animate-in data-open:slide-in-from-left data-closed:animate-out data-closed:slide-out-to-left outline-none"
        >
          <div className="flex items-center justify-between px-4 h-14 border-b">
            <DialogPrimitive.Title className="text-sm font-semibold text-gray-900">
              Filters
            </DialogPrimitive.Title>
            <DialogPrimitive.Close
              className="h-8 w-8 flex items-center justify-center rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
              aria-label="Close filters"
            >
              <X className="h-4 w-4" />
            </DialogPrimitive.Close>
          </div>
          <div className="flex-1 overflow-y-auto px-4 py-4">
            {children}
          </div>
        </DialogPrimitive.Popup>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}
