import React from "react"
import { Link } from "@remix-run/react"
import { faBookmark as faBookmarkSolid } from "@fortawesome/free-solid-svg-icons"
import { faBookmark as faBookmarkRegular } from "@fortawesome/free-regular-svg-icons"
import { IconProp } from "@fortawesome/fontawesome-svg-core"
import { RelatedDocBoxProps } from "./types"
import { Button } from "@/components/ui/Button/Button"

const RelatedDocBox: React.FC<RelatedDocBoxProps> = ({
  title,
  detail,
  isBookmarked,
  onBookmarkClick,
  docId,
}) => (
  <Link
    to={`/searchSi/semanticSearch/response?source_id=${docId}&loadpdf=yes`}
    className="min-h-[128px] border border-secondary/20 dark:border-third/20 p-7 rounded-xs w-full relative flex flex-col gap-4 hover:border-primary dark:hover:border-primary transition-border duration-300"
    prefetch="intent"
  >
    <Button
      variant={"ghostIcon"}
      icon={
        isBookmarked
          ? (faBookmarkSolid as IconProp)
          : (faBookmarkRegular as IconProp)
      }
      className="text-secondary dark:text-third absolute right-2 top-3 opacity-80 cursor-pointer text-xl hover:text-primary"
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        onBookmarkClick(e)
      }}
    />
    <h6 className={"max-w-[96%] text-pretty line-clamp-3 overflow-hidden"}>
      {title}
    </h6>
    <p className="line-clamp-2 text-sm text-secondary dark:text-white">
      {detail}
    </p>
  </Link>
)

export default RelatedDocBox
