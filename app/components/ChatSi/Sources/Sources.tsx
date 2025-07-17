import React, { useState } from "react"
import { SourceItemProps, SourcesProps } from "./types"
import { motion } from "framer-motion"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/Carousel/Carousel"
import { cn } from "@/utils/shadcn/utils"
import clsx from "clsx"
import { Link } from "@remix-run/react"

const SourceItem = ({
  title,
  author,
  variant,
  publisher,
  doc_id,
  url,
  publication_date,
}: SourceItemProps) => {
  const [isHovered, setIsHovered] = useState(false)

  // Determine if we should use external link or internal link
  const hasExternalUrl =
    url && (url.startsWith("http://") || url.startsWith("https://"))
  const hasInternalDocId = doc_id && !hasExternalUrl

  const shouldDisableLink =
    variant === "discovery" || (!hasExternalUrl && !hasInternalDocId)

  const linkClassName = clsx(
    "flex flex-row justify-between items-center sm:flex-col w-full border rounded-xl p-4 sm:items-start gap-x-2 gap-y-3 md:gap-x-5 dark:bg-secondary-dark text-black dark:text-white transition-colors duration-200 ease-in-out",
    isHovered
      ? "border-primary dark:border-primary"
      : "border-secondary dark:border-white",
    variant === "discovery"
      ? "flex-col text-left sm:w-[159px] pointer-events-none" //While we don't receive doc_id on Discovery, disable the link to SearchSi so it doesn't break
      : "sm:basis-1/4",
    shouldDisableLink && "pointer-events-none"
  )

  const linkContent = (
    <div className="flex flex-col gap-y-2">
      <p
        className={clsx(
          "text-xs line-clamp-2 min-h-10",
          isHovered
            ? "text-primary transition-colors duration-200 ease-in-out"
            : ""
        )}
      >
        {title}
      </p>
      <p className="text-xs font-bold ">{author || publisher}</p>
      <p className="text-xxs">{publication_date}</p>
    </div>
  )

  // Return external link
  if (hasExternalUrl) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className={linkClassName}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {linkContent}
      </a>
    )
  }

  // Return internal link or disabled element
  return (
    <Link
      to={
        hasInternalDocId
          ? `/searchSi/semanticSearch/response?source_id=${doc_id}`
          : ""
      }
      className={linkClassName}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {linkContent}
    </Link>
  )
}

const Sources: React.FC<SourcesProps> = ({ sources, variant = "default" }) => {
  const parsedSources = JSON.parse(sources)
  const shouldScroll = parsedSources.length > 16
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className={clsx(variant === "discovery" ? "flex" : "sm:hidden")}>
        <Carousel
          className={clsx(
            "flex flex-col",
            variant === "discovery" &&
              "mx-auto max-w-[80vw] sm:w-[220px] lg:w-[260px] justify-center"
          )}
          opts={{
            align: "start",
            loop: variant === "discovery",
          }}
        >
          <CarouselContent className={`${cn("ml-0 ")} w-full`}>
            {parsedSources.map((source: SourceItemProps, index: number) => (
              <CarouselItem
                key={index}
                className={`${cn("px-1")} flex justify-center ${
                  variant === "discovery"
                    ? "basis-1/3 sm:basis-auto"
                    : "sm:basis-auto"
                }`}
              >
                <SourceItem key={index} {...source} variant={variant} />
              </CarouselItem>
            ))}
          </CarouselContent>

          <div className="flex justify-center h-7 mt-2">
            <CarouselPrevious
              variant="ghost"
              className={cn(
                "!p-0 mr-8 text-secondary border-secondary h-9 w-5"
              )}
            />
            <CarouselNext
              variant="ghost"
              className={cn(
                "!p-0 ml-8 text-secondary border-secondary h-9 w-5"
              )}
            />
          </div>
        </Carousel>
      </div>
      <div
        className={clsx(
          "gap-6 hidden",
          shouldScroll && "max-h-[525px] overflow-y-auto styled-scrollbar pr-2",
          variant === "discovery"
            ? "flex flex-row sm:hidden"
            : "sm:grid grid-cols-4 mb-6"
        )}
      >
        {parsedSources.map((source: SourceItemProps, index: number) => (
          <SourceItem key={index} {...source} variant={variant} />
        ))}
      </div>
    </motion.div>
  )
}
export default Sources
