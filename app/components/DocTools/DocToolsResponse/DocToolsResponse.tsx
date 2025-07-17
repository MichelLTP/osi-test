import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faBarsStaggered } from "@fortawesome/free-solid-svg-icons"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/Accordion/Accordion"
import { IDocToolsProps, IDocToolsResponseProps, MessageObject } from "./type"
import React, { useEffect, useMemo, useState } from "react"
import SocialButtons from "@/components/Layout/SocialButtons/SocialButtons"
import { parseMessages } from "@/utils/sse/parseMessages"
import useStreamingAnimation from "@/hooks/useStreamingAnimation"
import StreamingResponse from "@/components/Shared/StreamingResponse/StreamingResponse"
import { useLocation } from "@remix-run/react"

const AnswerSection: React.FC<{
  parsedMessages: MessageObject[]
  isLoading: boolean
  setCompleted: () => void
  completed: boolean
  response: IDocToolsResponseProps
}> = ({ parsedMessages, isLoading, completed, setCompleted, response }) => {
  const location = useLocation()
  const searchParams = new URLSearchParams(location.search)
  const jobID = searchParams.get("job_id")
  const responseIds = [{ name: "job_id", value: jobID || "" }]

  const [currentStatus, streamingResponse, outputResponse] =
    useStreamingAnimation({
      responseChunks: parsedMessages,
      isCompleted: completed,
      handleCompleted: setCompleted,
    })

  return (
    <>
      <div className="flex items-center gap-x-2">
        <FontAwesomeIcon icon={faBarsStaggered} />
        <h3 className="text-xl font-bold">Answer</h3>
      </div>
      <div className="w-full flex flex-col gap-2 -mt-2">
        <StreamingResponse
          currentStatus={currentStatus}
          streamingText={streamingResponse}
          completeResponse={outputResponse}
          isCompleted={completed}
        />
        {!isLoading && parsedMessages.some((msg) => msg.type === "end") && (
          <SocialButtons response={response} responseIds={responseIds} />
        )}
      </div>
    </>
  )
}

function flattenArrayStructure<T>(structure: T[][]): T[] {
  return structure.reduce((acc, subarray) => acc.concat(subarray), [])
}

const DocToolsResponse: React.FC<IDocToolsProps> = ({
  promptResponse,
  prompt,
}) => {
  const [collapsed, setCollapsed] = useState<number>(1)
  let parsedMessages: any[] = []
  const [completed, setCompleted] = React.useState<boolean[]>([false])

  const toggleCompleted = (index: number) => {
    const newCompleted = [...completed]
    newCompleted[index] = !newCompleted[index]
    setCompleted(newCompleted)
  }

  const parsedResponse = useMemo(() => {
    if (promptResponse.length === 0) {
      return []
    }
    return promptResponse.map((response: IDocToolsResponseProps) => {
      return parseMessages(response.messages)
    })
  }, [promptResponse])

  if (promptResponse.length !== 0) {
    parsedMessages = parsedResponse.map((message) =>
      flattenArrayStructure(message as any)
    )
  }

  useEffect(() => {
    setCollapsed(promptResponse.length)
  }, [promptResponse])

  return (
    <Accordion
      type="single"
      collapsible
      className="w-full"
      value={`${collapsed}`}
      onValueChange={(value: string) => setCollapsed(Number(value))}
    >
      {promptResponse.length !== 0 &&
        promptResponse.map(
          (response: IDocToolsResponseProps, index: number) => {
            return (
              <AccordionItem value={`${index + 1}`} key={index}>
                <AccordionTrigger>
                  <div className="flex flex-col items-start">
                    <h3 className="text-2xlbold">{prompt[index]}</h3>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="flex flex-col gap-y-5">
                    <AnswerSection
                      parsedMessages={parsedMessages[index]}
                      isLoading={
                        parsedMessages[index].length > 0 &&
                        parsedMessages[index][parsedMessages[index].length - 1]
                          .type === "status"
                      }
                      completed={completed[index] || false}
                      setCompleted={() => toggleCompleted(index)}
                      response={response}
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>
            )
          }
        )}
    </Accordion>
  )
}

export default DocToolsResponse
