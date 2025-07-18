import type React from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/Button/Button"

interface FullscreenOverlayProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
}

export function FullscreenOverlay({
  isOpen,
  onClose,
  children,
}: FullscreenOverlayProps) {
  if (!isOpen) return null

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") onClose()
  }

  return (
    <div
      className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center"
      onClick={handleOverlayClick}
      onKeyDown={handleKeyDown}
      role="dialog"
      tabIndex={0}
    >
      <Button
        className="absolute top-4 right-4 text-2xl text-white transition-colors bg-transparent hover:bg-white/20 rounded-full border-none"
        onClick={onClose}
        variant="ghost"
        size="icon"
      >
        <X className="h-6 w-6" />
      </Button>

      <div
        className="w-full h-full max-w-[90vw] max-h-[90vh] cursor-auto flex items-center justify-center overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  )
}
