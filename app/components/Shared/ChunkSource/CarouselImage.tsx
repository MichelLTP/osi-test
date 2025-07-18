import type React from "react"
import { useRef, useState, useCallback } from "react"
import { cn } from "@/lib/utils"

interface CarouselImageProps {
  src: string
  alt: string
  index: number
  isFullscreen: boolean
  onClick: (index: number) => void
  onZoomChange?: (isZoomed: boolean) => void
}

export function CarouselImage({
  src,
  alt,
  index,
  isFullscreen,
  onClick,
  onZoomChange,
}: CarouselImageProps) {
  const dragStartRef = useRef<{ x: number; y: number } | null>(null)
  const isDraggingRef = useRef(false)
  const imageContainerRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)
  const [isZoomed, setIsZoomed] = useState(false)
  const [zoomOrigin, setZoomOrigin] = useState({ x: 50, y: 50 })
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 })
  const [isPanning, setIsPanning] = useState(false)
  const panStartRef = useRef<{
    x: number
    y: number
    offsetX: number
    offsetY: number
  } | null>(null)

  // Calculate pan bounds to keep image within view
  const calculatePanBounds = useCallback(() => {
    if (!imageContainerRef.current || !isZoomed)
      return { minX: 0, maxX: 0, minY: 0, maxY: 0 }

    const container = imageContainerRef.current
    const containerRect = container.getBoundingClientRect()

    // With 1.5x zoom, the image is 50% larger
    const zoomScale = 1.5
    const scaledWidth = containerRect.width * zoomScale
    const scaledHeight = containerRect.height * zoomScale

    // Calculate how much we can pan in each direction
    // The image should always touch the container edges
    const maxPanX = (scaledWidth - containerRect.width) / 2
    const maxPanY = (scaledHeight - containerRect.height) / 2

    return {
      minX: -maxPanX,
      maxX: maxPanX,
      minY: -maxPanY,
      maxY: maxPanY,
    }
  }, [isZoomed])

  // Clamp pan offset within bounds
  const clampPanOffset = useCallback(
    (offset: { x: number; y: number }) => {
      const bounds = calculatePanBounds()
      return {
        x: Math.max(bounds.minX, Math.min(bounds.maxX, offset.x)),
        y: Math.max(bounds.minY, Math.min(bounds.maxY, offset.y)),
      }
    },
    [calculatePanBounds]
  )

  const handleMouseDown = (e: React.MouseEvent) => {
    // Prevent text selection during drag
    e.preventDefault()

    dragStartRef.current = { x: e.clientX, y: e.clientY }
    isDraggingRef.current = false

    // If zoomed in, prepare for panning
    if (isZoomed && isFullscreen) {
      setIsPanning(true)
      panStartRef.current = {
        x: e.clientX,
        y: e.clientY,
        offsetX: panOffset.x,
        offsetY: panOffset.y,
      }
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragStartRef.current) return

    const deltaX = Math.abs(e.clientX - dragStartRef.current.x)
    const deltaY = Math.abs(e.clientY - dragStartRef.current.y)

    // If mouse moved more than 5px, consider it a drag
    if (deltaX > 5 || deltaY > 5) {
      isDraggingRef.current = true
    }

    // Handle panning when zoomed
    if (isPanning && panStartRef.current && isZoomed && isFullscreen) {
      const deltaX = e.clientX - panStartRef.current.x
      const deltaY = e.clientY - panStartRef.current.y

      const newOffset = {
        x: panStartRef.current.offsetX + deltaX,
        y: panStartRef.current.offsetY + deltaY,
      }

      // Apply bounds to keep image in view
      const clampedOffset = clampPanOffset(newOffset)
      setPanOffset(clampedOffset)
    }
  }

  const handleClick = (e: React.MouseEvent) => {
    // Prevent click if we detected dragging
    if (isDraggingRef.current) {
      e.preventDefault()
      return
    }

    if (isFullscreen) {
      if (isZoomed) {
        // Zoom out - reset pan offset
        setIsZoomed(false)
        setPanOffset({ x: 0, y: 0 })
        onZoomChange?.(false)
      } else {
        // Calculate click position relative to the image container
        if (imageContainerRef.current) {
          const rect = imageContainerRef.current.getBoundingClientRect()
          const x = ((e.clientX - rect.left) / rect.width) * 100
          const y = ((e.clientY - rect.top) / rect.height) * 100

          // Clamp values between 0 and 100
          const clampedX = Math.max(0, Math.min(100, x))
          const clampedY = Math.max(0, Math.min(100, y))

          setZoomOrigin({ x: clampedX, y: clampedY })
        }

        // Zoom in
        setIsZoomed(true)
        onZoomChange?.(true)
      }
    } else {
      onClick(index)
    }
  }

  const handleMouseUp = () => {
    dragStartRef.current = null
    setIsPanning(false)
    panStartRef.current = null

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
    // Prevent default touch behavior that might cause selection
    e.preventDefault()

    const touch = e.touches[0]
    dragStartRef.current = { x: touch.clientX, y: touch.clientY }
    isDraggingRef.current = false

    // If zoomed in, prepare for panning
    if (isZoomed && isFullscreen) {
      setIsPanning(true)
      panStartRef.current = {
        x: touch.clientX,
        y: touch.clientY,
        offsetX: panOffset.x,
        offsetY: panOffset.y,
      }
    }
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!dragStartRef.current) return

    const touch = e.touches[0]
    const deltaX = Math.abs(touch.clientX - dragStartRef.current.x)
    const deltaY = Math.abs(touch.clientY - dragStartRef.current.y)

    if (deltaX > 5 || deltaY > 5) {
      isDraggingRef.current = true
    }

    // Handle panning when zoomed
    if (isPanning && panStartRef.current && isZoomed && isFullscreen) {
      const deltaX = touch.clientX - panStartRef.current.x
      const deltaY = touch.clientY - panStartRef.current.y

      const newOffset = {
        x: panStartRef.current.offsetX + deltaX,
        y: panStartRef.current.offsetY + deltaY,
      }

      // Apply bounds to keep image in view
      const clampedOffset = clampPanOffset(newOffset)
      setPanOffset(clampedOffset)
    }
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    // Handle touch click for zoom on mobile
    if (isFullscreen && !isDraggingRef.current && e.changedTouches.length > 0) {
      const touch = e.changedTouches[0]

      if (isZoomed) {
        // Zoom out - reset pan offset
        setIsZoomed(false)
        setPanOffset({ x: 0, y: 0 })
        onZoomChange?.(false)
      } else if (imageContainerRef.current) {
        const rect = imageContainerRef.current.getBoundingClientRect()
        const x = ((touch.clientX - rect.left) / rect.width) * 100
        const y = ((touch.clientY - rect.top) / rect.height) * 100

        const clampedX = Math.max(0, Math.min(100, x))
        const clampedY = Math.max(0, Math.min(100, y))

        setZoomOrigin({ x: clampedX, y: clampedY })
        setIsZoomed(true)
        onZoomChange?.(true)
      }
    }

    dragStartRef.current = null
    setIsPanning(false)
    panStartRef.current = null
    setTimeout(() => {
      isDraggingRef.current = false
    }, 50)
  }

  return (
    <div
      ref={imageContainerRef}
      className={cn(
        "flex justify-center items-center relative rounded-xs overflow-hidden bg-secondary/10 dark:bg-secondary-dark/35",
        // Add user-select-none to prevent text selection
        "select-none",
        isFullscreen
          ? `w-full h-full max-w-[90vw] max-h-[90vh] bg-white dark:bg-secondary ${
              isZoomed ? "overflow-hidden cursor-grab" : "cursor-auto"
            } ${isPanning ? "cursor-grabbing" : ""}`
          : "h-[284px] w-full cursor-pointer"
      )}
      onClick={handleClick}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp} // Reset if mouse leaves the element
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onKeyDown={!isFullscreen ? handleKeyDown : undefined}
      role={!isFullscreen ? "button" : undefined}
      tabIndex={!isFullscreen ? 0 : undefined}
      // Additional CSS properties to prevent selection
      style={{
        WebkitUserSelect: "none",
        MozUserSelect: "none",
        msUserSelect: "none",
        userSelect: "none",
        WebkitTouchCallout: "none",
        WebkitTapHighlightColor: "transparent",
      }}
    >
      <img
        ref={imageRef}
        src={src || "/placeholder.svg"}
        alt={alt}
        className={cn(
          "py-2 pointer-events-none transition-transform duration-300 ease-in-out",
          // Add select-none to image as well
          "select-none",
          isFullscreen
            ? `max-w-full max-h-full object-contain ${isZoomed ? "scale-150" : ""}`
            : "max-h-full w-full object-contain"
        )}
        style={
          isFullscreen && isZoomed
            ? {
                transformOrigin: `${zoomOrigin.x}% ${zoomOrigin.y}%`,
                transform: `scale(1.5) translate(${panOffset.x}px, ${panOffset.y}px)`,
              }
            : undefined
        }
        draggable={false} // Prevent native image dragging
      />
    </div>
  )
}
