"use client"

import type React from "react"
import { useRef, useState, useCallback, useEffect } from "react"
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

  // Touch tap detection
  const touchStartTimeRef = useRef<number>(0)
  const touchStartPosRef = useRef<{ x: number; y: number } | null>(null)
  const TAP_THRESHOLD = 10 // pixels
  const TAP_TIME_THRESHOLD = 300 // milliseconds

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

  // Handle tap logic for both zoom and navigation
  const handleTap = useCallback(
    (clientX: number, clientY: number) => {
      if (isFullscreen) {
        if (isZoomed) {
          // Zoom out - reset pan offset
          setIsZoomed(false)
          setPanOffset({ x: 0, y: 0 })
          onZoomChange?.(false)
        } else {
          // Calculate tap position relative to the image container
          if (imageContainerRef.current) {
            const rect = imageContainerRef.current.getBoundingClientRect()
            const x = ((clientX - rect.left) / rect.width) * 100
            const y = ((clientY - rect.top) / rect.height) * 100

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
    },
    [isFullscreen, isZoomed, onZoomChange, onClick, index]
  )

  // Add passive event listeners for touch events
  useEffect(() => {
    const container = imageContainerRef.current
    if (!container) return

    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0]
      const currentTime = Date.now()

      touchStartTimeRef.current = currentTime
      touchStartPosRef.current = { x: touch.clientX, y: touch.clientY }
      dragStartRef.current = { x: touch.clientX, y: touch.clientY }
      isDraggingRef.current = false

      // If zoomed in, prepare for panning
      if (isZoomed && isFullscreen) {
        e.preventDefault() // This works in non-passive listeners
        setIsPanning(true)
        panStartRef.current = {
          x: touch.clientX,
          y: touch.clientY,
          offsetX: panOffset.x,
          offsetY: panOffset.y,
        }
      }
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (!dragStartRef.current || !touchStartPosRef.current) return

      const touch = e.touches[0]
      const deltaX = Math.abs(touch.clientX - dragStartRef.current.x)
      const deltaY = Math.abs(touch.clientY - dragStartRef.current.y)

      // Check if movement exceeds tap threshold
      const tapDeltaX = Math.abs(touch.clientX - touchStartPosRef.current.x)
      const tapDeltaY = Math.abs(touch.clientY - touchStartPosRef.current.y)

      if (tapDeltaX > TAP_THRESHOLD || tapDeltaY > TAP_THRESHOLD) {
        // This is a drag, not a tap
        touchStartPosRef.current = null
      }

      if (deltaX > 5 || deltaY > 5) {
        isDraggingRef.current = true
      }

      // Handle panning when zoomed
      if (isPanning && panStartRef.current && isZoomed && isFullscreen) {
        e.preventDefault() // Prevent scrolling while panning
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

    const handleTouchEnd = (e: TouchEvent) => {
      const currentTime = Date.now()
      const touchDuration = currentTime - touchStartTimeRef.current

      // Check if this was a valid tap
      if (
        touchStartPosRef.current &&
        touchDuration <= TAP_TIME_THRESHOLD &&
        !isDraggingRef.current &&
        e.changedTouches.length > 0
      ) {
        const touch = e.changedTouches[0]
        const tapDeltaX = Math.abs(touch.clientX - touchStartPosRef.current.x)
        const tapDeltaY = Math.abs(touch.clientY - touchStartPosRef.current.y)

        if (tapDeltaX <= TAP_THRESHOLD && tapDeltaY <= TAP_THRESHOLD) {
          // This is a valid tap!
          handleTap(touch.clientX, touch.clientY)
        }
      }

      // Reset all touch tracking
      touchStartTimeRef.current = 0
      touchStartPosRef.current = null
      dragStartRef.current = null
      setIsPanning(false)
      panStartRef.current = null
      setTimeout(() => {
        isDraggingRef.current = false
      }, 50)
    }

    // Add event listeners with proper passive/non-passive settings
    container.addEventListener("touchstart", handleTouchStart, {
      passive: false,
    })
    container.addEventListener("touchmove", handleTouchMove, { passive: false })
    container.addEventListener("touchend", handleTouchEnd, { passive: true })

    return () => {
      container.removeEventListener("touchstart", handleTouchStart)
      container.removeEventListener("touchmove", handleTouchMove)
      container.removeEventListener("touchend", handleTouchEnd)
    }
  }, [
    isZoomed,
    isFullscreen,
    isPanning,
    panOffset,
    onZoomChange,
    handleTap,
    clampPanOffset,
  ])

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

    // Use the same tap logic for mouse clicks
    handleTap(e.clientX, e.clientY)
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
        touchAction: isZoomed && isFullscreen ? "none" : "auto", // Prevent default touch behaviors when zoomed
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
