import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/Carousel/Carousel"
import { Button } from "@/components/ui/Button/Button"
import { useSource } from "@/store/sources"
import { useState, useEffect, useRef } from "react"
import { faClose } from "@fortawesome/free-solid-svg-icons"
import { SourceImageProps } from "./types"
import { cn } from "@/utils/shadcn/utils"
import { LoadingComponent } from "@/components/Layout/LoadingComponent/LoadingComponent"

export default function SourceImage({ fullscreen = false }: SourceImageProps) {
  const {
    sourceState,
    isSourceImagesLoading,
    isSourceImageFullScreen,
    setIsSourceImageFullScreen,
    currentImageIndex,
    setCurrentImageIndex,
  } = useSource()

  const [api, setApi] = useState<CarouselApi>()
  const [current, setCurrent] = useState(0)
  const [zoomLevel, setZoomLevel] = useState(1)
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 })

  const thumbnailsContainerRef = useRef<HTMLDivElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const MIN_ZOOM = 0.5
  const MAX_ZOOM = 5
  const ZOOM_STEP = 0.5

  useEffect(() => {
    if (!api) return

    const onSelect = () => {
      setCurrent(api.selectedScrollSnap())
      // Reset zoom and position when changing images
      setZoomLevel(1)
      setImagePosition({ x: 0, y: 0 })
    }

    api.on("select", onSelect)
    return () => {
      api.off("select", onSelect)
    }
  }, [api])

  // Set initial image for fullscreen mode
  useEffect(() => {
    if (api && fullscreen && currentImageIndex !== undefined) {
      setCurrent(currentImageIndex)
    }
  }, [api, fullscreen, currentImageIndex])

  // Scroll thumbnail into view when current changes
  useEffect(() => {
    if (fullscreen || !thumbnailsContainerRef.current) return

    const container = thumbnailsContainerRef.current
    const thumbnailWidth =
      container.scrollWidth / (sourceState.images?.length || 1)

    container.scrollTo({
      left: thumbnailWidth * Math.max(0, current - 2),
      behavior: "smooth",
    })
  }, [current, sourceState.images?.length, fullscreen])

  // Focus overlay in fullscreen mode
  useEffect(() => {
    if (fullscreen && overlayRef.current) {
      overlayRef.current.focus()
    }
  }, [fullscreen])

  const handleMouseMove = (e: React.MouseEvent) => {
    if (
      !fullscreen ||
      zoomLevel <= 1 ||
      !containerRef.current ||
      !imageRef.current
    )
      return

    const container = containerRef.current
    const img = imageRef.current

    // Get container dimensions and position
    const containerRect = container.getBoundingClientRect()
    const containerCenterX = containerRect.width / 2
    const containerCenterY = containerRect.height / 2

    // Calculate mouse position relative to container center
    const mouseX = e.clientX - containerRect.left - containerCenterX
    const mouseY = e.clientY - containerRect.top - containerCenterY

    // Calculate maximum allowed translation based on zoom level
    const maxX = (img.naturalWidth * zoomLevel - containerRect.width) / 2
    const maxY = (img.naturalHeight * zoomLevel - containerRect.height) / 2

    // Only translate if image is larger than container
    if (maxX > 0) {
      const translateX = Math.min(Math.max(-maxX, mouseX * 0.5), maxX)
      setImagePosition((prev) => ({ ...prev, x: -translateX }))
    }

    if (maxY > 0) {
      const translateY = Math.min(Math.max(-maxY, mouseY * 0.5), maxY)
      setImagePosition((prev) => ({ ...prev, y: -translateY }))
    }
  }

  // Don't render fullscreen if conditions aren't true or if we don't have the image index yet
  if (
    fullscreen &&
    (!isSourceImageFullScreen ||
      !sourceState.images?.length ||
      currentImageIndex === undefined)
  ) {
    return null
  }

  const closeFullscreen = () => {
    setIsSourceImageFullScreen(false)
    setZoomLevel(1)
    setImagePosition({ x: 0, y: 0 })
  }

  const handleImageClick = (index: number) => {
    if (!fullscreen) {
      setIsSourceImageFullScreen(true)
      setCurrentImageIndex(index)
    }
  }

  const handleThumbnailClick = (index: number) => {
    api?.scrollTo(index)
  }

  const handleWheel = (e: React.WheelEvent) => {
    if (!fullscreen) return

    e.preventDefault()
    const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP
    const newZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, zoomLevel + delta))

    setZoomLevel(newZoom)
    if (newZoom <= 1) {
      setImagePosition({ x: 0, y: 0 })
    }
  }

  const handleContainerClick = fullscreen ? closeFullscreen : undefined

  const handleContainerKeyDown = fullscreen
    ? (e: React.KeyboardEvent) => {
        if (e.key === "Escape") {
          e.preventDefault()
          closeFullscreen()
        }
      }
    : undefined

  const handleCarouselWrapperClick = fullscreen
    ? (e: React.MouseEvent) => e.stopPropagation()
    : undefined

  return (
    <div
      ref={fullscreen ? overlayRef : undefined}
      className={cn(
        fullscreen
          ? "fixed inset-0 bg-black/90 z-50 flex items-center justify-center cursor-auto"
          : "mt-4 mb-6"
      )}
      onClick={handleContainerClick}
      onKeyDown={handleContainerKeyDown}
      onWheel={handleWheel}
      onMouseMove={handleMouseMove}
      role={fullscreen ? "button" : undefined}
      tabIndex={fullscreen ? 0 : undefined}
    >
      {isSourceImagesLoading ? (
        <LoadingComponent variant="source-images" />
      ) : (
        <div className="flex flex-col gap-3">
          <div
            ref={containerRef}
            className={cn(
              fullscreen
                ? "w-full h-full max-w-[90vw] max-h-[90vh] cursor-auto flex items-center justify-center overflow-hidden"
                : ""
            )}
            onClick={handleCarouselWrapperClick}
            onKeyDown={() => {}}
            role={fullscreen ? "button" : undefined}
            tabIndex={fullscreen ? 0 : undefined}
          >
            <Carousel
              setApi={setApi}
              opts={
                fullscreen
                  ? {
                      startIndex: currentImageIndex || 0,
                    }
                  : undefined
              }
            >
              <CarouselContent>
                {sourceState.images?.map((image, index) => (
                  <CarouselItem key={index}>
                    <div
                      className={cn(
                        fullscreen
                          ? "relative rounded-xs overflow-hidden bg-white dark:bg-secondary w-full h-full max-w-[90vw] max-h-[90vh] cursor-auto flex items-center justify-center"
                          : "flex justify-center items-center h-[284px] relative rounded-xs overflow-hidden w-full bg-secondary/10 dark:bg-secondary-dark/35 cursor-pointer"
                      )}
                      onClick={
                        !fullscreen ? () => handleImageClick(index) : undefined
                      }
                      onKeyDown={
                        !fullscreen
                          ? (e) => {
                              if (e.key === "Enter") {
                                handleImageClick(index)
                              }
                            }
                          : undefined
                      }
                      role={!fullscreen ? "button" : undefined}
                      tabIndex={!fullscreen ? 0 : undefined}
                    >
                      <img
                        ref={imageRef}
                        src={image || "/placeholder.svg"}
                        alt={`img ${index + 1}`}
                        className={cn(
                          fullscreen
                            ? "max-w-full max-h-full object-contain py-2 transition-transform duration-100"
                            : "max-h-full w-full object-contain py-2"
                        )}
                        style={
                          fullscreen
                            ? {
                                transform: `scale(${zoomLevel}) translate(${imagePosition.x}px, ${imagePosition.y}px)`,
                              }
                            : undefined
                        }
                        draggable={false}
                      />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious
                arrowSize="lg"
                className="left-2 top-[42%] text-secondary bg-white/50 border-none rounded py-5"
              />
              <CarouselNext
                arrowSize="lg"
                className="right-2 top-[42%] text-secondary bg-white/50 border-none rounded py-5"
              />
            </Carousel>
          </div>

          {/* Only show in non-fullscreen mode */}
          {!fullscreen && (
            <div
              ref={thumbnailsContainerRef}
              className="flex items-center gap-2 overflow-x-hidden"
            >
              {sourceState.images?.map((image, index) => (
                <button
                  key={index}
                  onClick={() => handleThumbnailClick(index)}
                  className={cn(
                    "relative w-[77px] h-[45px] flex-shrink-0 rounded-[10px] overflow-hidden border-2 transition-all",
                    current === index ? "border-primary" : "border-transparent"
                  )}
                >
                  <img
                    src={image || "/placeholder.svg"}
                    alt={`Thumbnail ${index + 1}`}
                    className="object-cover w-full h-full"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Only show in fullscreen mode */}
      {fullscreen && (
        <Button
          className="absolute top-4 right-4 text-2xl text-primary transition-colors bg-transparent hover:bg-transparent hover:text-white rounded-full border-none"
          onClick={closeFullscreen}
          icon={faClose}
          variant="outlineIcon"
        />
      )}
    </div>
  )
}
