import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/Carousel/Carousel"
import { useSource } from "@/store/sources"
import { useState } from "react"
import { LoadingComponent } from "@/components/Layout/LoadingComponent/LoadingComponent"
import { SourceImageProps } from "./types"
import { useThumbnailScroll } from "@/hooks/useThumbnailScroll"
import { useCarouselSync } from "@/hooks/useCarouselSync"
import { CarouselImage } from "./CarouselImage"
import { FullscreenOverlay } from "./FullscreenOverlay"
import { ThumbnailNavigation } from "./ThumbnailNavigation"

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
  const [isImageZoomed, setIsImageZoomed] = useState(false)

  const thumbnailsContainerRef = useThumbnailScroll(
    currentImageIndex,
    sourceState.images?.length || 0,
    fullscreen
  )

  useCarouselSync({
    api,
    currentIndex: currentImageIndex,
    onIndexChange: setCurrentImageIndex,
    isFullscreen: fullscreen,
  })

  // Early returns for invalid states
  if (fullscreen && (!isSourceImageFullScreen || !sourceState.images?.length)) {
    return null
  }

  if (isSourceImagesLoading) {
    return <LoadingComponent variant="source-images" />
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

  const closeFullscreen = () => {
    setIsSourceImageFullScreen(false)
    setIsImageZoomed(false) // Reset zoom state when closing fullscreen
  }

  const handleZoomChange = (isZoomed: boolean) => {
    setIsImageZoomed(isZoomed)
  }

  const carouselOptions = {
    startIndex: currentImageIndex,
    dragFree: false,
    // Disable dragging when image is zoomed
    watchDrag: !isImageZoomed,
  }

  const carouselContent = (
    <div className="relative">
      <Carousel setApi={setApi} opts={carouselOptions} className="w-full">
        <CarouselContent className="-ml-0">
          {sourceState.images?.map((image, index) => (
            <CarouselItem key={index} className="pl-0">
              <CarouselImage
                src={image}
                alt={`Image ${index + 1}`}
                index={index}
                isFullscreen={fullscreen}
                onClick={handleImageClick}
                onZoomChange={handleZoomChange}
              />
            </CarouselItem>
          ))}
        </CarouselContent>

        <CarouselPrevious className="left-2 top-[42%] text-secondary bg-white/50 hover:bg-white/70 border-none rounded py-5 h-8 w-8 transition-all duration-200 ease-out" />
        <CarouselNext className="right-2 top-[42%] text-secondary bg-white/50 hover:bg-white/70 border-none rounded py-5 h-8 w-8 transition-all duration-200 ease-out" />
      </Carousel>
    </div>
  )

  if (fullscreen) {
    return (
      <FullscreenOverlay
        isOpen={isSourceImageFullScreen}
        onClose={closeFullscreen}
      >
        {carouselContent}
      </FullscreenOverlay>
    )
  }

  return (
    <div className="mt-4 mb-6">
      <div className="flex flex-col gap-3">
        <div>{carouselContent}</div>

        <ThumbnailNavigation
          images={sourceState.images || []}
          currentIndex={currentImageIndex}
          onThumbnailClick={handleThumbnailClick}
          containerRef={thumbnailsContainerRef}
        />
      </div>
    </div>
  )
}
