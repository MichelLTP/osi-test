import React from "react"
import { TrendingTopicBoxProps } from "./types"
import { Button } from "@/components/ui/Button/Button"
import { AnimatePresence, motion } from "framer-motion"

const TrendingTopicBox: React.FC<TrendingTopicBoxProps> = ({
  title,
  description,
  totalMentionedDocs,
  totalDocs,
}) => {
  const [showDescription, setShowDescription] = React.useState(false)

  const percentage = totalMentionedDocs
    ? parseFloat(((totalMentionedDocs / totalDocs) * 100).toFixed(1)).toString()
    : "0"
  return (
    <article className="border border-secondary/20 dark:border-third/20 p-7 rounded-xs w-full relative flex flex-col gap-4">
      <header
        className={
          "flex gap-4 flex-wrap lg:flex-nowrap items-start justify-between"
        }
      >
        <h6 className="font-bold">{title}</h6>
        <aside className="flex flex-col gap-2 items-center justify-end bg-third dark:bg-secondary-dark py-2 px-3 rounded-xs min-w-32">
          <small className="ml-auto text-xs">mentioned in</small>
          <p className="-mt-3 text-secondary/20 dark:text-third/20 space-x-1">
            <span className="text-primary text-smbold">{percentage}%</span> |
            <span className="text-primary text-xxsbold">
              {totalMentionedDocs}/{totalDocs} docs
            </span>
          </p>
        </aside>
      </header>

      <AnimatePresence>
        {showDescription && description && (
          <motion.div
            key="description"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <p className="text-sm text-secondary dark:text-white">
              {description}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {description && (
        <Button
          variant="underline"
          className="ml-auto text-xs text-secondary dark:text-white hover:text-primary dark:hover:text-primary"
          onClick={() => setShowDescription(!showDescription)}
        >
          {showDescription ? "Show less" : "Show more"}
        </Button>
      )}
    </article>
  )
}

export default TrendingTopicBox
