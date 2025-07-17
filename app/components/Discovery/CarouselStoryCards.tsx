import StoryCard from "./StoryCard"
import { Swiper, SwiperRef, SwiperSlide } from "swiper/react"
import { Autoplay, Navigation } from "swiper/modules"
import "swiper/css"
import "swiper/css/autoplay"
import "swiper/css/navigation"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useCallback, useEffect, useRef } from "react"

import { StoriesProps, StoryCardProps } from "./types"
import { colors } from "@/routes/discovery._index"

const CarouselStoryCards = ({ stories }: { stories: StoriesProps[] }) => {
  const sliderRef = useRef<SwiperRef>(null)
  const handlePrev = useCallback(() => {
    if (!sliderRef.current) return
    sliderRef.current.swiper.slidePrev()
  }, [])

  const handleNext = useCallback(() => {
    if (!sliderRef.current) return
    sliderRef.current.swiper.slideNext()
  }, [])

  useEffect(() => {
    if (!sliderRef.current) return

    const timeoutId = setTimeout(() => {
      // The Swiper animation don't start until interaction. So here, we're "faking" a inital slide change
      if (!sliderRef.current) return
      sliderRef.current.swiper.slideNext()
    }, 1000)

    return () => clearTimeout(timeoutId)
  }, [])

  return (
    <Swiper
      ref={sliderRef}
      modules={[Navigation, Autoplay]}
      autoplay={{
        delay: 2000,
        disableOnInteraction: false,
        pauseOnMouseEnter: true,
      }}
      speed={500}
      slidesPerView={3}
      spaceBetween={20}
      breakpoints={{
        0: {
          slidesPerView: 1.7,
        },
        1024: {
          slidesPerView: 3,
          spaceBetween: 25,
        },
      }}
      loop={true}
      centeredSlides={true}
      className="w-full"
    >
      {stories.map((story: StoryCardProps, index) => {
        return (
          <SwiperSlide className="flex" key={index}>
            <StoryCard
              {...story}
              color={colors[index] ? colors[index] : colors[0]}
            />
          </SwiperSlide>
        )
      })}

      <div className="flex gap-6 justify-center items-center pt-8">
        <ChevronLeft
          className={
            "cursor-pointer text-slate-400 dark:text-white hover:text-primary transition-colors"
          }
          onClick={handlePrev}
        />
        <ChevronRight
          className={
            "cursor-pointer text-slate-400 dark:text-white hover:text-primary transition-colors"
          }
          onClick={handleNext}
        />
      </div>
    </Swiper>
  )
}

export default CarouselStoryCards
