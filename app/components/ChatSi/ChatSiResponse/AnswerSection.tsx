import { IChatSiResponseProps, MessageObject } from "./type"
import React, { useEffect } from "react"
import SocialButtons from "@/components/Layout/SocialButtons/SocialButtons"
import useStreamingAnimation from "@/hooks/useStreamingAnimation"
import StreamingResponse from "@/components/Shared/StreamingResponse/StreamingResponse"
import { useChatSiStreamingComplete } from "@/store/chatsi"
import { useContentID } from "@/store/copytoclipboard"
import CopyToClipboard from "@/components/Shared/CopyToClipboard/CopyToClipboard"

export const AnswerSection: React.FC<{
  parsedMessages: MessageObject[]
  response: IChatSiResponseProps
  completed: boolean
  setCompleted: () => void
}> = ({ parsedMessages, response, completed, setCompleted }) => {
  const [currentStatus, streamingResponse, completeResponse] =
    useStreamingAnimation({
      responseChunks: parsedMessages,
      isCompleted: completed,
      handleCompleted: setCompleted,
    })
  const { setContentID } = useContentID()
  const answerId = `answer-section`
  const responseIds = [
    {
      name: "session_id",
      value: response?.sessionID || response?.session_id,
    },
    {
      name: "job_id",
      value: response?.jobID || response?.exchange_id,
    },
  ]

  const { setIsChatSiStreamingComplete } = useChatSiStreamingComplete()

  useEffect(() => {
    setIsChatSiStreamingComplete(completed)
  }, [completed])

  useEffect(() => {
    setContentID(answerId)
  }, [])

  return (
    <>
      <div id={answerId}>
        <StreamingResponse
          streamingText={streamingResponse}
          completeResponse={completeResponse}
          isCompleted={completed}
          isStreaming={response.isStreaming}
        />
      </div>
      <div className="flex justify-end mt-2 mb-10">
        {completed && parsedMessages.some((msg) => msg.type === "end") && (
          <>
            <SocialButtons response={response} responseIds={responseIds} />
            <CopyToClipboard />
          </>
        )}
      </div>
    </>
  )
}
