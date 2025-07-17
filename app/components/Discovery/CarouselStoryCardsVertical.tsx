import React, { useEffect, useState } from "react"
import {
  CarouselStoryCardsVerticalProps,
  StoryCardProps,
} from "@/components/Discovery/types"
import StoryCard from "@/components/Discovery/StoryCard"

import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/Carousel/Carousel"
import { WheelGesturesPlugin } from "embla-carousel-wheel-gestures"
import ClassNames from "embla-carousel-class-names"
import { colors } from "@/routes/discovery._index"

const CarouselStoryCardsVertical: React.FC<CarouselStoryCardsVerticalProps> = ({
  storiesLength,
  stories,
}) => {
  const [api, setApi] = useState<CarouselApi>()

  const preventEdgeScrolling = (embla: CarouselApi) => {
    if (!embla) return () => {}
    const {
      limit,
      target,
      location,
      offsetLocation,
      scrollTo,
      translate,
      scrollBody,
    } = embla.internalEngine()
    return () => {
      let edge: number | null = null

      if (location.get() >= limit.max) edge = limit.max
      if (location.get() <= limit.min) edge = limit.min
      if (edge !== null) {
        offsetLocation.set(edge)
        location.set(edge)
        target.set(edge)
        translate.to(edge)
        translate.toggleActive(false)
        scrollBody.useDuration(0).useFriction(0)
        scrollTo.distance(0, false)
      } else {
        translate.toggleActive(true)
      }
    }
  }

  useEffect(() => {
    if (!api) return
    api.on("scroll", preventEdgeScrolling(api))
    return () => {
      api.off("scroll", preventEdgeScrolling(api))
    }
  }, [api, preventEdgeScrolling])

  return (
    <Carousel
      opts={{
        align: "start",
      }}
      setApi={setApi}
      orientation="vertical"
      plugins={[WheelGesturesPlugin({ forceWheelAxis: "y" }), ClassNames()]}
      className="w-full mb-3"
    >
      <CarouselContent className="-mt-1 max-h-[80vh]">
        {storiesLength > 0 &&
          stories?.map((story: StoryCardProps, index: number) => (
            <CarouselItem key={index} className="pt-1 basis-2/3">
              <div className="p-1 pb-2 h-full transition-opacity duration-300 ease-in-out data-[active]:opacity-100 data-[active=false]:opacity-50">
                <StoryCard
                  key={story.id}
                  color={colors[index] ? colors[index] : colors[0]}
                  {...story}
                />
              </div>
            </CarouselItem>
          ))}
      </CarouselContent>
    </Carousel>
  )
}

export default CarouselStoryCardsVertical
