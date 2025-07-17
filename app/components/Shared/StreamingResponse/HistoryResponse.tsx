import React from "react"
import { HistoryResponseProps } from "./types"
import ResponseContent from "./ResponseContent"

const HistoryResponse: React.FC<HistoryResponseProps> = ({
  completeResponse,
  handleSourceClick,
}) => {
  return (
    <div className="h-auto flex flex-col gap-y-3 text-black dark:text-white">
      <ResponseContent
        completeResponse={completeResponse}
        streamingText={completeResponse.map((msg) =>
          msg.type === "text" && typeof msg.body === "string" ? msg.body : ""
        )}
        isCompleted={true}
        isClickable={true}
        isHistory={true}
        handleSourceClick={handleSourceClick}
      />
    </div>
  )
}

export default HistoryResponse
