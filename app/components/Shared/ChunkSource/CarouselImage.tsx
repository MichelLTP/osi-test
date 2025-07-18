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

  // Pinch-to-zoom state
  const [zoomScale, setZoomScale] = useState(1)
  const pinchStartRef = useRef<{
    distance: number
    scale: number
    centerX: number
    centerY: number
  } | null>(null)
  const isPinchingRef = useRef(false)

  // Calculate distance between two touch points
  const getTouchDistance = (touches: TouchList) => {
    if (touches.length < 2) return 0
    const touch1 = touches[0]
    const touch2 = touches[1]
    return Math.sqrt(
      Math.pow(touch2.clientX - touch1.clientX, 2) +
        Math.pow(touch2.clientY - touch1.clientY, 2)
    )
  }

  // Calculate center point between two touches
  const getTouchCenter = (touches: TouchList) => {
    if (touches.length < 2) return { x: 0, y: 0 }
    const touch1 = touches[0]
    const touch2 = touches[1]
    return {
      x: (touch1.clientX + touch2.clientX) / 2,
      y: (touch1.clientY + touch2.clientY) / 2,
    }
  }

  // Calculate pan bounds to keep image within view
  const calculatePanBounds = useCallback(() => {
    if (!imageContainerRef.current || zoomScale <= 1)
      return { minX: 0, maxX: 0, minY: 0, maxY: 0 }

    const container = imageContainerRef.current
    const containerRect = container.getBoundingClientRect()

    // Calculate scaled dimensions
    const scaledWidth = containerRect.width * zoomScale
    const scaledHeight = containerRect.height * zoomScale

    // Calculate how much we can pan in each direction
    const maxPanX = (scaledWidth - containerRect.width) / 2
    const maxPanY = (scaledHeight - containerRect.height) / 2

    return {
      minX: -maxPanX,
      maxX: maxPanX,
      minY: -maxPanY,
      maxY: maxPanY,
    }
  }, [zoomScale])

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

  // Update zoom state based on scale
  useEffect(() => {
    const wasZoomed = isZoomed
    const nowZoomed = zoomScale > 1.1

    if (wasZoomed !== nowZoomed) {
      setIsZoomed(nowZoomed)
      onZoomChange?.(nowZoomed)

      // Reset pan when zooming out completely
      if (!nowZoomed) {
        setPanOffset({ x: 0, y: 0 })
      }
    }
  }, [zoomScale, isZoomed, onZoomChange])

  // Add passive event listeners for touch events
  useEffect(() => {
    const container = imageContainerRef.current
    if (!container) return

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        // Two finger pinch start
        isPinchingRef.current = true
        const distance = getTouchDistance(e.touches)
        const center = getTouchCenter(e.touches)

        if (imageContainerRef.current) {
          const rect = imageContainerRef.current.getBoundingClientRect()
          const x = ((center.x - rect.left) / rect.width) * 100
          const y = ((center.y - rect.top) / rect.height) * 100

          setZoomOrigin({
            x: Math.max(0, Math.min(100, x)),
            y: Math.max(0, Math.min(100, y)),
          })
        }

        pinchStartRef.current = {
          distance,
          scale: zoomScale,
          centerX: center.x,
          centerY: center.y,
        }

        e.preventDefault()
      } else if (e.touches.length === 1) {
        // Single finger touch
        const touch = e.touches[0]
        dragStartRef.current = { x: touch.clientX, y: touch.clientY }
        isDraggingRef.current = false

        // If zoomed in, prepare for panning
        if (zoomScale > 1.1 && isFullscreen) {
          setIsPanning(true)
          panStartRef.current = {
            x: touch.clientX,
            y: touch.clientY,
            offsetX: panOffset.x,
            offsetY: panOffset.y,
          }
        }
      }
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (
        e.touches.length === 2 &&
        isPinchingRef.current &&
        pinchStartRef.current
      ) {
        // Handle pinch zoom
        e.preventDefault()
        const currentDistance = getTouchDistance(e.touches)
        const scaleChange = currentDistance / pinchStartRef.current.distance
        const newScale = Math.max(
          1,
          Math.min(3, pinchStartRef.current.scale * scaleChange)
        )

        setZoomScale(newScale)
      } else if (e.touches.length === 1 && !isPinchingRef.current) {
        // Handle single finger pan
        if (!dragStartRef.current) return

        const touch = e.touches[0]
        const deltaX = Math.abs(touch.clientX - dragStartRef.current.x)
        const deltaY = Math.abs(touch.clientY - dragStartRef.current.y)

        if (deltaX > 5 || deltaY > 5) {
          isDraggingRef.current = true
        }

        // Handle panning when zoomed
        if (
          isPanning &&
          panStartRef.current &&
          zoomScale > 1.1 &&
          isFullscreen
        ) {
          e.preventDefault()
          const deltaX = touch.clientX - panStartRef.current.x
          const deltaY = touch.clientY - panStartRef.current.y

          const newOffset = {
            x: panStartRef.current.offsetX + deltaX,
            y: panStartRef.current.offsetY + deltaY,
          }

          const clampedOffset = clampPanOffset(newOffset)
          setPanOffset(clampedOffset)
        }
      }
    }

    const handleTouchEnd = (e: TouchEvent) => {
      if (isPinchingRef.current) {
        // End pinch gesture
        isPinchingRef.current = false
        pinchStartRef.current = null
      } else {
        // Handle single touch end - only for desktop-style click zoom
        if (
          isFullscreen &&
          !isDraggingRef.current &&
          e.changedTouches.length > 0
        ) {
          const touch = e.changedTouches[0]

          // Only do click zoom on desktop or when not using pinch
          if (!("ontouchstart" in window) || zoomScale <= 1) {
            if (zoomScale > 1.1) {
              // Zoom out
              setZoomScale(1)
              setPanOffset({ x: 0, y: 0 })
            } else if (imageContainerRef.current) {
              // Zoom in
              const rect = imageContainerRef.current.getBoundingClientRect()
              const x = ((touch.clientX - rect.left) / rect.width) * 100
              const y = ((touch.clientY - rect.top) / rect.height) * 100

              const clampedX = Math.max(0, Math.min(100, x))
              const clampedY = Math.max(0, Math.min(100, y))

              setZoomOrigin({ x: clampedX, y: clampedY })
              setZoomScale(1.5)
            }
          }
        }
      }

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
    zoomScale,
    isFullscreen,
    isPanning,
    panOffset,
    onZoomChange,
    clampPanOffset,
  ])

  const handleMouseDown = (e: React.MouseEvent) => {
    // Prevent text selection during drag
    e.preventDefault()

    dragStartRef.current = { x: e.clientX, y: e.clientY }
    isDraggingRef.current = false

    // If zoomed in, prepare for panning
    if (zoomScale > 1.1 && isFullscreen) {
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
    if (isPanning && panStartRef.current && zoomScale > 1.1 && isFullscreen) {
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
      if (zoomScale > 1.1) {
        // Zoom out - reset scale and pan
        setZoomScale(1)
        setPanOffset({ x: 0, y: 0 })
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
        setZoomScale(1.5)
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

  return (
    <div
      ref={imageContainerRef}
      className={cn(
        "flex justify-center items-center relative rounded-xs overflow-hidden bg-secondary/10 dark:bg-secondary-dark/35",
        // Add user-select-none to prevent text selection
        "select-none",
        isFullscreen
          ? `w-full h-full max-w-[90vw] max-h-[90vh] bg-white dark:bg-secondary ${
              zoomScale > 1.1 ? "overflow-hidden cursor-grab" : "cursor-auto"
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
        touchAction: zoomScale > 1.1 && isFullscreen ? "none" : "auto",
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
            ? `max-w-full max-h-full object-contain`
            : "max-h-full w-full object-contain"
        )}
        style={
          isFullscreen && zoomScale > 1
            ? {
                transformOrigin: `${zoomOrigin.x}% ${zoomOrigin.y}%`,
                transform: `scale(${zoomScale}) translate(${panOffset.x}px, ${panOffset.y}px)`,
              }
            : undefined
        }
        draggable={false} // Prevent native image dragging
      />
    </div>
  )
}
