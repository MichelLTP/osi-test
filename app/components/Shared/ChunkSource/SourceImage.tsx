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
import { useThumbnailScroll } from "@/hooks/use-thumbnail-scroll"
import { useCarouselSync } from "@/hooks/use-carousel-sync"

import { LoadingComponent } from "@/components/Layout/LoadingComponent/LoadingComponent"
import { SourceImageProps } from "./types"
import { CarouselImage } from "./carousel-image"
import { FullscreenOverlay } from "./fullscreen-overlay"
import { ThumbnailNavigation } from "./thumbnail-navigation"

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
  }

  const carouselContent = (
    <Carousel setApi={setApi} opts={{ startIndex: currentImageIndex }}>
      <CarouselContent>
        {sourceState.images?.map((image, index) => (
          <CarouselItem key={index}>
            <CarouselImage
              src={image}
              alt={`Image ${index + 1}`}
              index={index}
              isFullscreen={fullscreen}
              onClick={handleImageClick}
            />
          </CarouselItem>
        ))}
      </CarouselContent>

      <CarouselPrevious className="left-2 top-[42%] text-secondary bg-white/50 border-none rounded py-5 h-8 w-8" />
      <CarouselNext className="right-2 top-[42%] text-secondary bg-white/50 border-none rounded py-5 h-8 w-8" />
    </Carousel>
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
