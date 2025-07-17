import React, { useEffect, useState } from "react"
import { MessageObject } from "@/components/ChatSi/ChatSiResponse/type"
import CodeSnippet from "@/components/ui/CodeSnippet/CodeSnippet"
import DynamicDataTable from "@/components/ui/DynamicDataTable/DynamicDataTable"
import PlotlyThemeWrapper from "@/components/ui/PlotlyWrapper/PlotlyThemeWrapper"
import PlotlyWrapper from "@/components/ui/PlotlyWrapper/PlotlyWrapper"
import { useTheme } from "@/utils/darkTheme/theme-provider"
import { useSource } from "@/store/sources"
import { InternalLink } from "@/components/ChatSi/InternalLink/InternalLink"
import { SourceType } from "@/components/Shared/ChunkSource/types"

type UseStreamingAnimationProps = {
  responseChunks: MessageObject[]
  isCompleted: boolean
  handleCompleted: () => void
  typingSpeed?: number
}

type UseStreamingAnimationReturn = [
  MessageObject | null,
  string[],
  { type: string; body: React.ReactNode | string }[],
]

const useStreamingAnimation = ({
  responseChunks,
  isCompleted,
  handleCompleted,
  typingSpeed = 20,
}: UseStreamingAnimationProps): UseStreamingAnimationReturn => {
  const [theme] = useTheme()
  const { setAllSourcesState } = useSource()
  const [completeResponse, setCompleteResponse] = useState<
    { type: string; body: React.ReactNode | string }[]
  >([])
  const [streamingResponse, setStreamingResponse] = useState([""])
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0)
  const [currentWordIndex, setCurrentWordIndex] = useState(0)

  const currentStatus =
    [...responseChunks]
      .reverse()
      .find((message) => message.type === "status") || null

  useEffect(() => {
    if (responseChunks.length > 0) {
      let textBlock = ""
      const allSources: SourceType[] = []
      const currentResponse: {
        type: string
        body: React.ReactNode | string
      }[] = []

      responseChunks.forEach((messageObject: MessageObject) => {
        if (messageObject.type === "status") {
          return
        }

        if (messageObject.type === "text") {
          textBlock +=
            messageObject.body ||
            messageObject?.dark?.body ||
            messageObject?.light?.body ||
            ""
        } else if (messageObject.type === "chunk_source") {
          const source = messageObject.body

          const isUnique = !allSources.some(
            (existingSource) => existingSource.ref === source.ref
          )

          if (isUnique) {
            allSources.push(source)
          }

          textBlock += `<span class="source-trigger" sourceRef="${source.ref}">${source.ref}</span>`
        } else {
          if (textBlock) {
            currentResponse.push({ type: "text", body: textBlock })
            textBlock = ""
          }
          if (
            ["plotly", "table", "code", "pygwalker", "internal_link"].includes(
              messageObject.type
            )
          ) {
            currentResponse.push({
              type: messageObject.type,
              body: renderContent(messageObject),
            })
          }
        }
      })

      if (textBlock) {
        currentResponse.push({ type: "text", body: textBlock })
      }

      setCompleteResponse(currentResponse)
      setAllSourcesState(allSources)
    }
  }, [responseChunks])

  const renderContent = (messageObject: MessageObject) => {
    if (messageObject.type === "status") {
      return null
    }
    switch (messageObject.type) {
      case "code":
        return (
          <div className="code-response my-2">
            <CodeSnippet
              codeString={messageObject?.body?.dark || messageObject?.body}
              variant={"chatsi"}
            />
          </div>
        )
      case "table":
        return (
          <div className="plotly-response">
            <DynamicDataTable tableData={messageObject} />
          </div>
        )
      case "plotly":
        return (
          <div
            className={`${
              messageObject.type === "plotly" && "min-h-[300px]"
            } my-4`}
          >
            {messageObject.body?.light ? (
              <PlotlyThemeWrapper
                index={crypto.getRandomValues(new Uint32Array(1))[0]}
                lightContent={messageObject.body?.light}
                darkContent={messageObject.body?.dark}
                theme={theme}
              />
            ) : (
              <PlotlyWrapper
                index={crypto.getRandomValues(new Uint32Array(1))[0]}
                content={JSON.parse(messageObject?.body)}
              />
            )}
          </div>
        )
      case "pygwalker":
        return (
          <div
            dangerouslySetInnerHTML={{
              __html: messageObject?.body,
            }}
          />
        )
      case "internal_link":
        return (
          <InternalLink
            message={messageObject.body.message}
            link={messageObject.body.link}
          />
        )
      default:
        return null
    }
  }

  useEffect(() => {
    if (isCompleted) {
      setStreamingResponse([""])
      setCurrentWordIndex(0)
      setCurrentMessageIndex(0)
      return
    }

    if (
      !isCompleted &&
      completeResponse.length > 0 &&
      currentMessageIndex < completeResponse.length
    ) {
      const message = completeResponse[currentMessageIndex]
      const { type, body } = message

      if (type === "text" && typeof body === "string") {
        const words = body.split(" ")
        const intervalId = setInterval(() => {
          if (currentWordIndex < words.length) {
            setStreamingResponse((prev) => {
              const updatedText = [...prev]
              updatedText[currentMessageIndex] =
                (updatedText[currentMessageIndex] || "") +
                (currentWordIndex > 0 ? " " : "") +
                words[currentWordIndex]
              return updatedText
            })
            setCurrentWordIndex((prev) => prev + 1)
          } else {
            clearInterval(intervalId)
            setCurrentMessageIndex((prev) => prev + 1)
            setCurrentWordIndex(0)
          }
        }, typingSpeed)
        return () => clearInterval(intervalId)
      } else {
        setCurrentMessageIndex((prev) => prev + 1)
        setCurrentWordIndex(0)
      }
    }

    if (
      !isCompleted &&
      currentMessageIndex === completeResponse.length &&
      currentMessageIndex > 0
    ) {
      handleCompleted()
    }
  }, [
    completeResponse,
    isCompleted,
    currentMessageIndex,
    currentWordIndex,
    typingSpeed,
  ])

  return [currentStatus, streamingResponse, completeResponse]
}

export default useStreamingAnimation
