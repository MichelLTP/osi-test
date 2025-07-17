import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/Accordion/Accordion"
import { IChatSiProps, IChatSiResponseProps, MessageObject } from "./type"
import React, { useEffect, useMemo, useState, useRef } from "react"

import WhileYouWait from "../WhileYouWait/WhileYouWait"
import RelatedQuestions from "../RelatedQuestions/RelatedQuestions"
import { AnswerSection } from "./AnswerSection"
import { parseMessages } from "@/utils/sse/parseMessages"
import { hasActiveFilters } from "@/utils/filters"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  faBarsStaggered,
  faCircleCheck,
  faLayerGroup,
} from "@fortawesome/free-solid-svg-icons"
import Sources from "../Sources/Sources"
import TaskSection from "./TaskSection"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/NewTabs/tabs"

function flattenArrayStructure<T>(structure: T[][]): T[] {
  return structure.reduce((acc, subarray) => acc.concat(subarray), [])
}

const ChatSiResponse: React.FC<IChatSiProps> = ({
  promptResponse,
  prompt,
  whileYouWait,
  routerId,
}) => {
  const [completed, setCompleted] = React.useState<boolean[]>([false])
  const [currentTabIndexes, setCurrentTabIndexes] = useState<string[]>([])

  // Track which tabs have been manually changed by the user
  const userModifiedTabs = useRef<Set<number>>(new Set())

  // Track the last processed message count for each response to avoid redundant updates
  const lastProcessedMessageCounts = useRef<number[]>([])

  const toggleCompleted = (index: number) => {
    const newCompleted = [...completed]
    newCompleted[index] = !newCompleted[index]
    setCompleted(newCompleted)
  }

  const parsedMessages: MessageObject[][] = useMemo(() => {
    if (promptResponse.length === 0) {
      return []
    }

    const parsedResponse = promptResponse.map(
      (response: IChatSiResponseProps) => parseMessages(response.messages)
    )

    return parsedResponse.map((message) =>
      flattenArrayStructure(message as any)
    )
  }, [promptResponse])

  const getTabLabel = (icon: any, text: string) => {
    return (
      <div className="flex items-center gap-x-2 transition-none">
        <FontAwesomeIcon icon={icon} />
        <h3>{text}</h3>
      </div>
    )
  }

  // Initialize tab indexes when promptResponse changes
  useEffect(() => {
    if (
      promptResponse.length > 0 &&
      currentTabIndexes.length !== promptResponse.length
    ) {
      setCurrentTabIndexes((prev) => {
        const newIndexes = [...prev]
        newIndexes[promptResponse.length - 1] = "tasks"
        return newIndexes
      }) // Reset user modification tracking when responses change
      userModifiedTabs.current = new Set()
      lastProcessedMessageCounts.current = new Array(
        promptResponse.length
      ).fill(0)
    }
  }, [promptResponse.length])

  // Only auto-switch tabs if the user hasn't manually changed them
  useEffect(() => {
    if (parsedMessages.length > 0) {
      const newTabIndexes = [...currentTabIndexes]
      let hasChanges = false

      parsedMessages.forEach((messages, index) => {
        // Skip if user has manually modified this tab
        if (userModifiedTabs.current.has(index)) {
          return
        }

        // Only process if we have new messages (avoid redundant processing)
        const currentMessageCount = messages.length
        const lastProcessedCount =
          lastProcessedMessageCounts.current[index] || 0

        if (currentMessageCount <= lastProcessedCount) {
          return
        }

        const statusMessage = messages.find(
          (message) => message.type === "text"
        )

        // Auto-switch to answer tab when text message appears
        if (statusMessage && newTabIndexes[index] !== "answer") {
          newTabIndexes[index] = "answer"
          hasChanges = true
        }

        // Update the last processed count
        lastProcessedMessageCounts.current[index] = currentMessageCount
      })

      if (hasChanges) {
        setCurrentTabIndexes(newTabIndexes)
      }
    }
  }, [parsedMessages, currentTabIndexes])

  // Handle manual tab changes
  const handleTabChange = (tabId: string, responseIndex: number) => {
    // Mark this tab as user-modified to prevent auto-switching
    userModifiedTabs.current.add(responseIndex)

    setCurrentTabIndexes((prev) => {
      const newIndexes = [...prev]
      newIndexes[responseIndex] = tabId
      return newIndexes
    })
  }

  return (
    <Accordion
      type="multiple"
      className="w-full h-full"
      variant="expandLastOnly"
    >
      {promptResponse.length !== 0 &&
        parsedMessages.length !== 0 &&
        promptResponse.map((response: IChatSiResponseProps, index: number) => {
          const documentSources = parsedMessages[index].find(
            (messageObject) => messageObject.type === "document_sources"
          )

          const tabs = [
            {
              label: getTabLabel(faBarsStaggered, "Answer"),
              children: (
                <AnswerSection
                  completed={
                    completed[index] ||
                    !promptResponse[index].isStreaming ||
                    false
                  }
                  setCompleted={() => toggleCompleted(index)}
                  parsedMessages={parsedMessages[index]}
                  response={response}
                />
              ),
              id: "answer",
            },
            {
              label: getTabLabel(faCircleCheck, "Tasks"),
              children: <TaskSection parsedMessages={parsedMessages[index]} />,
              id: "tasks",
            },
            ...(documentSources
              ? [
                  {
                    label: getTabLabel(faLayerGroup, "Sources"),
                    children: <Sources sources={documentSources.body} />,
                    id: "sources",
                  },
                ]
              : []),
          ]
          return (
            <AccordionItem
              value={`${index + 1}`}
              key={index}
              isLastItem={index === promptResponse.length - 1}
            >
              <AccordionTrigger
                showRouterDocs={response.router}
                showMetadataFilters={
                  response?.filters && hasActiveFilters(response)
                }
              >
                <h3 className="text-2xlbold whitespace-pre-wrap leading-[1.3] text-left w-full lg:max-w-[822px] text-black dark:text-white mr-6 lg:mr-[10.5rem]">
                  {prompt[index]}
                </h3>
              </AccordionTrigger>
              <AccordionContent className="h-full">
                {response.isStreaming && (
                  <div className="lg:hidden">
                    <WhileYouWait
                      inputText={whileYouWait && whileYouWait[index + 1]}
                    />
                  </div>
                )}
                <div className="flex gap-x-5">
                  <div className="w-full lg:max-w-[822px] flex flex-col gap-y-5 lg:mt-5">
                    <Tabs
                      value={currentTabIndexes[index] || "tasks"}
                      onValueChange={(value) => handleTabChange(value, index)}
                    >
                      <TabsList
                        currentValue={currentTabIndexes[index] || "tasks"}
                        onValueChange={(value) => handleTabChange(value, index)}
                      >
                        {tabs.map((tab) => (
                          <TabsTrigger key={tab.id} value={tab.id}>
                            {tab.label}
                          </TabsTrigger>
                        ))}
                      </TabsList>
                      {tabs.map((tab) => {
                        return (
                          <TabsContent
                            key={tab.id}
                            value={tab.id}
                            className={
                              currentTabIndexes[index] !== tab.id
                                ? "hidden"
                                : ""
                            }
                            forceMount
                          >
                            {tab.children}
                          </TabsContent>
                        )
                      })}
                    </Tabs>
                  </div>

                  <div
                    className={`basis-4/12 min-w-[275px] flex-col gap-y-5 hidden mt-[60px] lg:flex`}
                  >
                    {response.isStreaming && (
                      <WhileYouWait
                        inputText={whileYouWait && whileYouWait[index + 1]}
                      />
                    )}
                    <RelatedQuestions
                      routerId={routerId}
                      parsedMessages={parsedMessages[index]}
                      isStreaming={response.isStreaming}
                      isLoading={
                        parsedMessages[index].length === 0 ||
                        !parsedMessages[index].some(
                          (message: MessageObject) =>
                            message.type === "related_questions" ||
                            message.type === "end"
                        )
                      }
                    />
                  </div>
                </div>
                <div className="lg:hidden grid mt-10">
                  <RelatedQuestions
                    routerId={routerId}
                    parsedMessages={parsedMessages[index]}
                    isLoading={
                      parsedMessages[index]?.length === 0 ||
                      !parsedMessages[index]?.some(
                        (message: MessageObject) =>
                          message.type === "related_questions" ||
                          message.type === "end"
                      )
                    }
                  />
                </div>
              </AccordionContent>
            </AccordionItem>
          )
        })}
    </Accordion>
  )
}

export default ChatSiResponse
