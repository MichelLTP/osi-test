import { useEffect, useRef } from "react"

export function useThumbnailScroll(
  currentIndex: number,
  totalImages: number,
  isFullscreen: boolean
) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isFullscreen || !containerRef.current) return

    const container = containerRef.current
    const thumbnailWidth = container.scrollWidth / totalImages

    container.scrollTo({
      left: thumbnailWidth * Math.max(0, currentIndex - 2),
      behavior: "smooth",
    })
  }, [currentIndex, totalImages, isFullscreen])

  return containerRef
}
