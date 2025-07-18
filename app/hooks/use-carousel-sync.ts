import { CarouselApi } from "@/components/ui/Carousel/Carousel"
import { useEffect } from "react"

interface UseCarouselSyncProps {
  api: CarouselApi | undefined
  currentIndex: number
  onIndexChange: (index: number) => void
  isFullscreen?: boolean
}

export function useCarouselSync({
  api,
  currentIndex,
  onIndexChange,
  isFullscreen,
}: UseCarouselSyncProps) {
  // Sync carousel selection with external state
  useEffect(() => {
    if (!api) return

    const handleSelect = () => {
      onIndexChange(api.selectedScrollSnap())
    }

    api.on("select", handleSelect)
    return () => {
      api.off("select", handleSelect)
    }
  }, [api, onIndexChange])

  // Initialize carousel position in fullscreen
  useEffect(() => {
    if (api && isFullscreen) {
      api.scrollTo(currentIndex)
    }
  }, [api, isFullscreen, currentIndex])
}
