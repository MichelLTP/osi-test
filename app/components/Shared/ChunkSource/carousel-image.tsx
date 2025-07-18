import type React from "react"
import { useRef } from "react"
import { cn } from "@/lib/utils"

interface CarouselImageProps {
  src: string
  alt: string
  index: number
  isFullscreen: boolean
  onClick: (index: number) => void
}

export function CarouselImage({
  src,
  alt,
  index,
  isFullscreen,
  onClick,
}: CarouselImageProps) {
  const dragStartRef = useRef<{ x: number; y: number } | null>(null)
  const isDraggingRef = useRef(false)

  const handleMouseDown = (e: React.MouseEvent) => {
    dragStartRef.current = { x: e.clientX, y: e.clientY }
    isDraggingRef.current = false
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragStartRef.current) return

    const deltaX = Math.abs(e.clientX - dragStartRef.current.x)
    const deltaY = Math.abs(e.clientY - dragStartRef.current.y)

    // If mouse moved more than 5px, consider it a drag
    if (deltaX > 5 || deltaY > 5) {
      isDraggingRef.current = true
    }
  }

  const handleClick = (e: React.MouseEvent) => {
    // Prevent click if we detected dragging
    if (isDraggingRef.current) {
      e.preventDefault()
      return
    }
    onClick(index)
  }

  const handleMouseUp = () => {
    dragStartRef.current = null
    // Reset drag state after a short delay to prevent immediate clicks
    setTimeout(() => {
      isDraggingRef.current = false
    }, 50)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") onClick(index)
  }

  // Touch events for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0]
    dragStartRef.current = { x: touch.clientX, y: touch.clientY }
    isDraggingRef.current = false
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!dragStartRef.current) return

    const touch = e.touches[0]
    const deltaX = Math.abs(touch.clientX - dragStartRef.current.x)
    const deltaY = Math.abs(touch.clientY - dragStartRef.current.y)

    if (deltaX > 5 || deltaY > 5) {
      isDraggingRef.current = true
    }
  }

  const handleTouchEnd = () => {
    dragStartRef.current = null
    setTimeout(() => {
      isDraggingRef.current = false
    }, 50)
  }

  return (
    <div
      className={cn(
        "flex justify-center items-center relative rounded-xs overflow-hidden bg-secondary/10 dark:bg-secondary-dark/35",
        isFullscreen
          ? "w-full h-full max-w-[90vw] max-h-[90vh] cursor-auto bg-white dark:bg-secondary"
          : "h-[284px] w-full cursor-pointer"
      )}
      onClick={handleClick}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onKeyDown={!isFullscreen ? handleKeyDown : undefined}
      role={!isFullscreen ? "button" : undefined}
      tabIndex={!isFullscreen ? 0 : undefined}
    >
      <img
        src={src || "/placeholder.svg"}
        alt={alt}
        className={cn(
          "py-2 pointer-events-none", // Prevent image from interfering with drag detection
          isFullscreen
            ? "max-w-full max-h-full object-contain"
            : "max-h-full w-full object-contain"
        )}
        draggable={false} // Prevent native image dragging
      />
    </div>
  )
}
