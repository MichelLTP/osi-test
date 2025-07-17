import { Button } from "@/components/ui/Button/Button"
import { SVGIcon } from "@/components/ui/SvgIcons/SVGIcon"
import { useContentID } from "@/store/copytoclipboard"
import { useSource } from "@/store/sources"
import { copyAccordionToClipboard, copyToClipboard } from "@/utils/clipboard"
import { cn } from "@/utils/shadcn/utils"
import { faCheck, faClose } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { motion } from "framer-motion"
import { useCallback, useState } from "react"

export default function CopyToClipboard({
  onClick,
  variant = "default",
  accordionItems = [],
  className,
}: {
  onClick?: () => void
  variant?: string
  accordionItems?: { title: string; description: string; content: string }[]
  className?: string
}) {
  const [isCopied, setIsCopied] = useState<boolean>(false)
  const [hasFailed, setHasFailed] = useState<boolean>(false)
  const { contentID } = useContentID()
  const { allSourcesState } = useSource()
  const handleCopyToClipboard = useCallback(async () => {
    let result
    setHasFailed(false)

    try {
      if (variant === "accordions" && accordionItems.length > 0) {
        result = await copyAccordionToClipboard(accordionItems, {
          includeDescription: true,
          titleTag: "h3",
          renderMarkdown: true,
        })
      } else if (contentID) {
        result = await copyToClipboard(contentID, onClick, allSourcesState)
      }
    } catch (error) {
      console.error("Copy failed:", error)
      result = "Failed to copy!"
    }

    if (result?.includes("Failed")) {
      setHasFailed(true)
      setTimeout(() => setHasFailed(false), 2000)
    } else if (result?.includes("Copied")) {
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000)
    }
  }, [contentID, onClick, accordionItems, variant])

  return (
    <div
      className={cn(
        "flex items-center justify-center flex-row gap-x-3 w-10",
        className
      )}
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <Button
          variant="ghost"
          disabled={isCopied || hasFailed}
          onClick={handleCopyToClipboard}
          className="group"
        >
          {hasFailed ? (
            <FontAwesomeIcon icon={faClose} className="text-red-500" />
          ) : isCopied ? (
            <FontAwesomeIcon icon={faCheck} />
          ) : (
            <SVGIcon
              width={17}
              className="group-hover:stroke-primary transition-colors duration-300"
              variant="Copy"
            />
          )}
        </Button>
      </motion.div>
    </div>
  )
}
