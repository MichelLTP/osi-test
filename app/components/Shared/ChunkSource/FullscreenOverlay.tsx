import type React from "react"
import { Button } from "@/components/ui/Button/Button"
import { faClose } from "@fortawesome/free-solid-svg-icons"

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
      role="presentation"
    >
      <Button
        className="absolute top-4 right-4 text-2xl text-primary transition-colors bg-transparent hover:bg-transparent hover:text-white rounded-full border-none"
        onClick={onClose}
        icon={faClose}
        variant="outlineIcon"
      />

      <div
        className="w-full h-full max-w-[90vw] max-h-[90vh] cursor-auto flex items-center justify-center overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        role="presentation"
      >
        {children}
      </div>
    </div>
  )
}
