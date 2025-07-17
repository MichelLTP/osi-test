import React from "react"
import { LiveResponseProps } from "./types"
import ResponseContent from "./ResponseContent"
import LoadingStatus from "@/components/Shared/LoadingStatus/LoadingStatus"

const LiveResponse: React.FC<LiveResponseProps> = ({
  completeResponse,
  streamingText,
  isCompleted,
  handleSourceClick,
  currentStatus,
}) => {
  return (
    <>
      {currentStatus && !isCompleted ? (
        <LoadingStatus statusMessage={currentStatus} />
      ) : null}
      <div className="h-auto flex flex-col gap-y-3 text-black dark:text-white">
        <ResponseContent
          completeResponse={completeResponse}
          streamingText={streamingText}
          isCompleted={isCompleted}
          handleSourceClick={handleSourceClick}
          isClickable={true}
          isHistory={false}
        />
      </div>
    </>
  )
}

export default LiveResponse
