import { requiredUserSession } from "@/data/auth/session.server"
import { getMenuVariables } from "@/data/menuvariables/menuvariables.server"
import type { LoaderFunctionArgs } from "@remix-run/node"
import { useNavigate, useLoaderData } from "@remix-run/react"
import { ErrorBoundaryComponent } from "@/components/ui/ErrorBoundaryComponent/ErrorBoundaryComponent"
import { Button } from "@/components/ui/Button/Button"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faComment } from "@fortawesome/free-regular-svg-icons"
import React, { useState, useEffect, useRef, useMemo } from "react"
import { faCommentDots } from "@fortawesome/free-regular-svg-icons"
import ChatbarArea from "@/components/Layout/ChatbarArea/ChatbarArea"
import ChatBubble from "@/components/OMM/Chat/ChatBubble/ChatBubble"
import Modal from "@/components/Shared/Modal/Modal"
import useOmmChat from "@/hooks/useOmmChat"
import { v4 as uuidv4 } from "uuid"
import ChatLoading from "@/components/OMM/Chat/ChatLoading/ChatLoading"
import { useScenarioTableStore } from "@/store/omm"
import { fetchMarket } from "@/data/omm/omm.server"
import { CountryFlag } from "@/components/OMM/CountryFlag/CountryFlag"

const transposeArray = (data: any[][]) => {
  return data[0].map((_, colIndex) => data.map((row) => row[colIndex]))
}

const transformDataForTable = (data: any, columnOrder: (string | number)[]) => {
  if (!data || data.length === 0 || !columnOrder || columnOrder.length === 0)
    return []

  const categoryColumn = columnOrder[0]
  const categoryRow = data.map((row: any) => row[categoryColumn])
  const valueRows = columnOrder
    .slice(1)
    .map((column: string | number) => data.map((row) => row[column] ?? null))

  return [categoryRow, ...valueRows]
}

export default function OmmScenarioAssistant() {
  const threadId = useMemo(() => uuidv4(), [])
  const { marketId, scenarioID, market, marketCode, initialTimestamp } =
    useLoaderData<typeof loader>()
  const [currentScenarioID, setScenarioID] = useState<string>(scenarioID)
  const { handleScenarioSelection, scenarioData } = useScenarioTableStore()
  const navigate = useNavigate()

  const { messages, isLoading, error, generatedDataframes, sendMessage } =
    useOmmChat({
      threadId,
      marketID: marketId,
      scenarioID: currentScenarioID,
      scenarioName: scenarioData.scenario_name,
      setScenarioID,
    })

  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(scrollToBottom, [messages])

  useEffect(() => {
    const scenarioID = parseInt(currentScenarioID, 10)

    if (scenarioID > 0) {
      handleScenarioSelection(scenarioID, scenarioData.scenario_name)
    }
  }, [currentScenarioID])

  const handleSend = async (prompt: string) => {
    if (!prompt.trim()) return
    await sendMessage(prompt)
  }

  const handleModalClose = () => {
    if (currentScenarioID !== "0") {
      navigate("/omm/scenarios?scenario-id=" + currentScenarioID)
    } else {
      navigate("/omm/scenarios")
    }
  }

  const renderMessages = () => {
    const initialMessage = {
      id: "welcome-message",
      content: `**Welcome to the OMM Chat Assistant.**  \nHow can I assist with the market of ${market}?`,
      type: "ai",
      additional_kwargs: { timestamp: new Date(initialTimestamp) },
    }
    const examplePrompts = [
      "List all the market drivers",
      "Extract evolution of adult population",
      "Update Full VAT RSP",
      "Adjust yearly inflation",
    ]

    const allMessages = [initialMessage, ...messages]
    return (
      <>
        <ChatBubble
          message={initialMessage.content}
          timestamp={initialMessage.additional_kwargs.timestamp}
          variant={"ai"}
          initialMessage
        />
        {messages.map((message, index) => {
          const timestamp = new Date(message.additional_kwargs?.timestamp)
          if (message.type === "human") {
            return (
              <ChatBubble
                key={index}
                message={message.content}
                timestamp={timestamp}
                variant="user"
              />
            )
          } else if (message.type === "ai" && message.content) {
            return (
              <ChatBubble
                key={index}
                message={message.content}
                timestamp={timestamp}
                variant="ai"
              />
            )
          }

          // Handle tool calls (tables & Python)
          if (message.tool_calls && message.tool_calls.length > 0) {
            return message.tool_calls.map((toolCall, toolIndex) => {
              if (toolCall.name === "display_table_to_user") {
                const { columns, rows, caption } = toolCall.args?.input || {}
                if (columns && rows) {
                  const formattedData = {
                    header: columns,
                    values: transposeArray(rows),
                  }
                  return (
                    <ChatBubble
                      key={`${message.id}-${toolIndex}`}
                      message={caption}
                      timestamp={timestamp}
                      variant="ai"
                      type="table"
                      table_data={formattedData}
                    />
                  )
                }
              } else if (toolCall.name === "display_dataframe_to_user") {
                const dataframeID = toolCall.args?.input?.dataframe_id
                const caption = toolCall.args?.input?.caption
                const columnsOrdering = toolCall.args?.input?.columns_order

                if (!dataframeID || !generatedDataframes?.[dataframeID]) {
                  console.error(
                    "DataFrame ID missing or not found:",
                    dataframeID
                  )
                  return null
                }

                try {
                  const my_dataframe = generatedDataframes[dataframeID]
                  const jsonified_dataframe = JSON.parse(my_dataframe)

                  if (!Array.isArray(jsonified_dataframe)) {
                    console.error(
                      "Invalid DataFrame format:",
                      jsonified_dataframe
                    )
                    return null
                  }

                  const formattedData = {
                    header: columnsOrdering,
                    values: transformDataForTable(
                      jsonified_dataframe,
                      columnsOrdering
                    ),
                  }

                  return (
                    <ChatBubble
                      key={`${message.id}-${toolIndex}`}
                      message={caption}
                      timestamp={timestamp}
                      variant="ai"
                      type="table"
                      table_data={formattedData}
                    />
                  )
                } catch (error) {
                  console.error("Error parsing DataFrame:", error)
                  return null
                }
              }
              return null
            })
          }
          return null
        })}

        {messages.length === 0 && (
          <div className="flex flex-wrap gap-3 lg:max-w-[65%]">
            {examplePrompts.map((prompt, index) => (
              <Button
                className="p-3 items-center text-sm text-secondary dark:text-white rounded-md border-third dark:border-third-dark hover:border-primary dark:hover:border-primary hover:bg-opacity-5 dark:hover:bg-opacity-5 transition-border"
                variant="outline"
                onClick={() => sendMessage(prompt)}
                key={index + prompt}
              >
                <FontAwesomeIcon
                  icon={faComment}
                  size="lg"
                  className="text-primary mr-2"
                />
                <p>{prompt}</p>
              </Button>
            ))}
          </div>
        )}
      </>
    )
  }

  return (
    <Modal
      title="Scenario Changes Assistant"
      icon={faCommentDots}
      handleClose={handleModalClose}
    >
      {market && (
        <h6 className={"-mt-6 mb-6 opacity-50 flex gap-2 items-center"}>
          <CountryFlag
            rounded
            countryCode={marketCode}
            className={"!bg-cover"}
          />
          {market}
        </h6>
      )}
      <main className="h-[70vh] w-full overflow-y-auto custom-scrollbar dark-scrollbar -mr-2 pr-2">
        <section className="flex flex-col gap-2.5 mt-4 mb-8 p-4 w-full z-50">
          {renderMessages()}
          <div ref={messagesEndRef} />
        </section>
      </main>
      <div className="h-10 m-2 flex space-x-1 justify-start items-center">
        {isLoading && <ChatLoading />}
        {error && <p className="text-red-500 mt-2">Error: {error}</p>}
      </div>
      <ChatbarArea
        variant="omm"
        handlePromptSubmit={handleSend}
        disabled={isLoading}
      />
    </Modal>
  )
}

export async function loader({ request }: LoaderFunctionArgs) {
  const token = await requiredUserSession(request)
  const envVar = await getMenuVariables()
  const urlParams = new URL(request.url).searchParams
  const marketId = urlParams.get("market-id")
  const scenarioID = urlParams.get("scenario-id")

  if (!marketId) throw new Response("Missing Market ID", { status: 400 })
  if (!scenarioID) throw new Response("Missing Scenario ID", { status: 400 })

  const market_info = await fetchMarket(token, marketId)

  return {
    envVar,
    marketId: parseInt(marketId, 10),
    market: market_info.market,
    marketCode: market_info.code,
    scenarioID: scenarioID,
    initialTimestamp: new Date(Date.now()),
  }
}

export function ErrorBoundary() {
  return (
    <Modal title="Scenario Changes Assistant Error" icon={faCommentDots}>
      <ErrorBoundaryComponent isMainRoute={false} />
    </Modal>
  )
}
