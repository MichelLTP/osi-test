import React, { useMemo } from "react"
import { MessageObject, ResponseContentProps } from "./types"
import ChunkSource from "../ChunkSource/ChunkSource"
import { motion } from "framer-motion"
import ChartSkeleton from "../ChartSkeleton/ChartSkeleton"
import TableSkeleton from "../TableSkeleton/TableSkeleton"
import { LoadingComponent } from "@/components/Layout/LoadingComponent/LoadingComponent"
import "katex/dist/katex.min.css"
import { MarkdownRenderer } from "../MarkdownRender/MarkdownRender"

const ResponseContent: React.FC<
  ResponseContentProps & { isHistory: boolean }
> = ({
  completeResponse,
  streamingText,
  isCompleted,
  handleSourceClick,
  isClickable = false,
  isHistory,
}) => {
  // Track text chunk progression
  const chunkIndex = useMemo(() => {
    const indices: number[] = []
    let currentIndex = 0
    completeResponse.forEach((chunk, index) => {
      indices[index] = currentIndex
      if (chunk.type !== "table" || chunk.type !== "plotly") currentIndex++
    })
    return indices
  }, [completeResponse])

  const shouldDisplay = (index: number): boolean => {
    if (isCompleted || isHistory) return true
    return chunkIndex[index] < streamingText.length
  }

  const renderContent = (chunk: MessageObject, index: number) => {
    // Handle text content
    if (chunk.type === "text") {
      const content = isCompleted ? chunk.body : streamingText[index] || ""

      return (
        <div
          className={isClickable ? "cursor-auto" : ""}
          role={isClickable ? "button" : undefined}
          onClick={isClickable ? handleSourceClick : undefined}
          onKeyDown={
            isClickable
              ? (e: React.KeyboardEvent<HTMLDivElement>) => {
                  if (e.key === "Enter" || e.key === " ") {
                    handleSourceClick?.(
                      e as unknown as React.MouseEvent<HTMLDivElement>
                    )
                  }
                }
              : undefined
          }
        >
          <div className="markdown-container">
            <MarkdownRenderer value={content} />
          </div>
          <ChunkSource />
        </div>
      )
    }

    // Handle delayed content types
    if (
      ["plotly", "table", "pygwalker", "internal_link"].includes(chunk.type)
    ) {
      if (!shouldDisplay(index)) {
        return !isHistory ? (
          <motion.div
            key={`skeleton-${index}`}
            initial={{ opacity: 1 }}
            className={`${
              chunk.type === "plotly"
                ? "min-h-[300px]"
                : chunk.type === "table"
                  ? "min-h-[110px]"
                  : ""
            } my-4`}
          >
            {chunk.type === "plotly" && <ChartSkeleton />}
            {(chunk.type === "table" || chunk.type === "pygwalker") && (
              <TableSkeleton rows={5} />
            )}
          </motion.div>
        ) : null
      }
      return chunk.body || null
    }

    // Immediately show other non-text types
    return chunk.body
  }

  if (!completeResponse.length) {
    return isHistory ? null : (
      <div>
        <LoadingComponent />
      </div>
    )
  }

  return (
    <>
      {completeResponse.map((chunk, index) => (
        <React.Fragment key={`${index}-${isCompleted}`}>
          {renderContent(chunk, index)}
        </React.Fragment>
      ))}
    </>
  )
}

export default ResponseContent
