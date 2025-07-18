import React, { useEffect } from "react"
import { useSource } from "@/store/sources"
import { StreamingContentProps } from "./types"
import LiveResponse from "./LiveResponse"
import HistoryResponse from "./HistoryResponse"
import { useFetcher } from "@remix-run/react"
import { FetcherData } from "../ChunkSource/types"
import { motion, AnimatePresence } from "framer-motion"

const StreamingResponse: React.FC<StreamingContentProps> = ({
  streamingText,
  completeResponse,
  isCompleted,
  isStreaming = true,
  currentStatus,
}) => {
  const {
    allSourcesState,
    sourceState,
    setSourceState,
    setIsSourceImagesLoading,
    setIsSourceModalOpen,
    setCurrentImageIndex,
  } = useSource()
  const fetcher = useFetcher<FetcherData>()
  const sourceImagesResponse = fetcher.data?.sourceImagesResponse

  useEffect(() => {
    if (sourceImagesResponse) {
      setSourceState({
        ...sourceState,
        images: sourceImagesResponse,
      })
      setIsSourceImagesLoading(false)
    }
  }, [sourceImagesResponse])

  const handleSourceClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const sourceRef = (e.target as HTMLElement).getAttribute("sourceRef")

    if (sourceRef) {
      const source = allSourcesState.find(
        (source) => source.ref.toString() === sourceRef
      )
      if (source) {
        setIsSourceImagesLoading(true)
        if (source.images && sourceImagesResponse) {
          setSourceState({ ...source, images: sourceImagesResponse })
        } else {
          setSourceState(source)
        }
        document.body.style.overflowY = "hidden"
        setIsSourceModalOpen(true)
        setCurrentImageIndex(0)

        if (source.images && source.images.length > 0) {
          fetcher.submit(
            { sourceImages: source.images },
            {
              method: "post",
              action: `?sourceImages=${source.images}`,
              encType: "multipart/form-data",
            }
          )
        }
      }
    }
  }

  return (
    <AnimatePresence mode="wait">
      {!isStreaming ? (
        <motion.div
          key="history"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <HistoryResponse
            completeResponse={completeResponse}
            streamingText={streamingText}
            isCompleted={isCompleted}
            handleSourceClick={handleSourceClick}
          />
        </motion.div>
      ) : (
        <motion.div
          key="live"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <LiveResponse
            {...(currentStatus ? { currentStatus } : {})}
            completeResponse={completeResponse}
            streamingText={streamingText}
            isCompleted={isCompleted}
            handleSourceClick={handleSourceClick}
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default StreamingResponse
