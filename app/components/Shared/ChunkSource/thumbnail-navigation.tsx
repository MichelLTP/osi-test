import type React from "react"

import { cn } from "@/lib/utils"

interface ThumbnailNavigationProps {
  images: string[]
  currentIndex: number
  onThumbnailClick: (index: number) => void
  containerRef: React.RefObject<HTMLDivElement>
}

export function ThumbnailNavigation({
  images,
  currentIndex,
  onThumbnailClick,
  containerRef,
}: ThumbnailNavigationProps) {
  return (
    <div
      ref={containerRef}
      className="flex items-center gap-2 overflow-x-hidden"
    >
      {images.map((image, index) => (
        <button
          key={index}
          onClick={() => onThumbnailClick(index)}
          className={cn(
            "relative w-[77px] h-[45px] flex-shrink-0 rounded-[10px] overflow-hidden border-2 transition-all",
            currentIndex === index ? "border-primary" : "border-transparent"
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
  )
}
