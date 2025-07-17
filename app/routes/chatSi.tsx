import Header from "@/components/Layout/Header/Header"
import Main from "@/components/Layout/Main/Main"
import Sidebar from "@/components/Layout/Sidebar/Sidebar"
import { useHistorybar, useCloseSidebar, useLoadingState } from "@/store/layout"
import type {
  ActionFunctionArgs,
  LoaderFunction,
  LoaderFunctionArgs,
} from "@remix-run/node"
import {
  json,
  Outlet,
  redirect,
  ShouldRevalidateFunction,
  useFetcher,
  useLoaderData,
} from "@remix-run/react"
import {
  DeleteChatSiHistory,
  deleteChatSiSingleHistory,
  fetchChatsiHistory,
  fetchChatsiHistoryResponse,
  fetchExampleQuestions,
  fetchInternalLink,
  fetchSourceImages,
  fetchWhileYouWaitFacts,
  setUserFeedback,
} from "@/data/chatsi/chatsi.server"
import ExampleQuestions from "@/components/ChatSi/ExampleQuestions/ExampleQuestions"
import { useCallback, useEffect, useRef, useState } from "react"
import {
  FetcherData,
  IChatSiResponseProps,
} from "@/components/ChatSi/ChatSiResponse/type"
import { QuestionProps } from "@/components/ChatSi/ExampleQuestions/type"
import HistoryButton from "@/components/Layout/HistoryButton/HistoryButton"
import Footer from "@/components/Layout/Footer/Footer"
import Historybar from "@/components/Layout/Historybar/Historybar"
import { Bubble } from "@/components/Layout/Historybar/HistoryBubble/type"
import { Toaster } from "@/components/ui/Toast/Toaster"
import { useToast } from "@/hooks/useToast"
import { LoadingComponent } from "@/components/Layout/LoadingComponent/LoadingComponent"
import { askChatSI, processChatResponse } from "@/utils/sse/sseRender"
import { clsx } from "clsx"
import MobileMenu from "@/components/Layout/MobileMenu/MobileMenu"
import ChatSiResponse from "@/components/ChatSi/ChatSiResponse/ChatSiResponse"
import ChatbarArea from "@/components/Layout/ChatbarArea/ChatbarArea"
import { extractIds } from "@/utils/chatSi"
import {
  useSearchMethod,
  useRouterID,
  useSelectedRouter,
  useSSE,
  usePreDefinedPrompt,
} from "@/store/chatsi"
import {
  createMetadataSearchFilters,
  fetchMetadataFilters,
} from "@/data/searchsi/searchSi.server"
import { createMetadataSearchFilters_BEStructure } from "@/utils/metadataFilters"
import { requiredUserSession } from "@/data/auth/session.server"
import { ErrorBoundaryComponent } from "@/components/ui/ErrorBoundaryComponent/ErrorBoundaryComponent"
import { useFiltersStore } from "@/store/filters"
import { Filters } from "@/components/Shared/Filters/Filters"
import { getMenuVariables } from "@/data/menuvariables/menuvariables.server"
import { extractFilenameFromDisposition } from "@/utils/sharedFunctions"
import OpenningTitle from "@/components/Shared/OpenningTitle/OpenningTitle"
import {
  faArrowsSplitUpAndLeft,
  faChartColumn,
} from "@fortawesome/free-solid-svg-icons"
import { SearchOption } from "@/components/Shared/SearchType/types"

export default function ChatSi() {
  const fetcher = useFetcher<FetcherData>()
  const chatSiHistory =
    fetcher.data &&
    fetcher.data.chatSiHistory &&
    fetcher.data.chatSiHistory.length > 0
      ? fetcher.data.chatSiHistory
      : null

  const { chatSiHistoryResponse } =
    (useLoaderData() as { chatSiHistoryResponse: IChatSiResponseProps[] }) || {}

  const close = useCloseSidebar((state) => state.close)
  const { toast } = useToast()
  const { setLoadingState } = useLoadingState()
  const { searchMethod } = useSearchMethod()
  const { setStoreHandlerSubmit } = useSSE()
  const { routerID } = useRouterID()
  const { preDefinedPrompt, SetPreDefinedPrompt } = usePreDefinedPrompt()
  const { selectedRouter } = useSelectedRouter()
  const { setIsHistorybarOpen } = useHistorybar()
  const {
    filters,
    initialFiltersData,
    setUpdatedFilterData,
    updatedFilterData,
    setInitialFiltersData,
  } = useFiltersStore()

  const latestSessionIdRef = useRef<string | null>(null)

  const [showFilters, setShowFilters] = useState(false)
  const [whileYouWait, setWhileYouWait] = useState<string[]>([""])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [messages, setMessages] = useState<IChatSiResponseProps[]>([])
  const [exampleQuestions, setExampleQuestions] = useState<QuestionProps[]>([])
  const [userPrompt, setUserPrompt] = useState<string[]>([])
  const setSidebarClose = useCloseSidebar.getState().setClose
  const [currentRouter, setCurrentRouter] = useState<string>("")
  const [isFirstLoad, setIsFirstLoad] = useState(true)
  const [isDocumentRouter, setIsDocumentRouter] = useState(true)
  const { setSearchMethod } = useSearchMethod()
  const [placeholderText, setPlaceholderText] = useState(
    "What would you like to explore today?"
  )
  const [selectedOption, setSelectedOption] = useState<SearchOption | null>(
    null
  )

  const documentsRouter: string[] = [
    "docs",
    "grrp",
    "strategic_insights",
    "euromonitor",
    "ploom",
    "corporate_strategy",
    "global_ms",
    "commercial_strategy",
    "incidence_tracker",
    "performance",
    "regulatory",
    "public",
    "competitive_intelligence",
  ]

  const apiRouter: string[] = [
    "gpt4",
    "wikipedia",
    "duckduckgo",
    "arxiv",
    "pubmed",
  ]

  const showSearchType = !apiRouter.includes(selectedRouter?.id)

  const handleStream = useCallback((messageChunk: string) => {
    setMessages((prevMessages) => {
      if (prevMessages.length === 0) {
        // Initialize the first session
        return [
          {
            messages: [{ message: messageChunk }],
            isStreaming: true,
          },
        ]
      } else {
        // Append new message to the last session
        const lastSessionIndex = prevMessages.length - 1

        const updatedMessages = prevMessages.map((session, index) => {
          if (index === lastSessionIndex) {
            // Return a new object with a copy of the messages array
            return {
              ...session,
              isStreaming: true,
              messages: [...session.messages, { message: messageChunk }],
            }
          }
          return session
        })

        if (
          typeof messageChunk === "string" &&
          messageChunk.length > 0 &&
          messageChunk.includes("session_id")
        ) {
          const { sessionId, jobId } = extractIds(messageChunk)

          if (sessionId && jobId) {
            latestSessionIdRef.current = sessionId
            updatedMessages[lastSessionIndex].jobID = jobId
            updatedMessages[lastSessionIndex].sessionID = sessionId
          } else {
            console.log("Failed to extract session ID and job ID")
          }
        }
        return updatedMessages
      }
    })
  }, [])

  const handlePromptSubmit = async (
    prompt: string,
    routerIdFromEQ?: string
  ) => {
    fetcher.load(`?request=${true}`)
    setUserPrompt((prev) => [...prev, prompt])
    SetPreDefinedPrompt("")
    const currentSessionId = latestSessionIdRef.current

    setMessages((prevMessages) => [
      ...prevMessages,
      {
        messages: [],
        jobID: "",
        sessionID: currentSessionId || "",
        router: routerIdFromEQ || routerID,
        filters: filters,
        method: searchMethod,
        feedback: "NEUTRAL",
      },
    ])
    try {
      setIsLoading(true)
      let response

      const baseRequest = {
        prompt: prompt,
        router: routerIdFromEQ || routerID,
        method: searchMethod,
        session_id: currentSessionId,
      }

      if (
        (routerIdFromEQ && routerIdFromEQ === "docs") ||
        (!routerIdFromEQ && routerID === "docs")
      ) {
        response = await askChatSI({
          ...baseRequest,
          docs_filters: filters || [],
        })
      } else {
        response = await askChatSI(baseRequest)
      }

      if (!response) return
      processChatResponse({
        response,
        onChunk: handleStream,
      })

      setIsLoading(false)
      setCurrentRouter(routerIdFromEQ || routerID)
    } catch (err) {
      toast({
        title: "Something went wrong",
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "error",
      })
    }
  }

  useEffect(() => {
    if (fetcher.data?.whileYouWait) {
      setWhileYouWait((prev) => [
        ...prev,
        ...(fetcher.data?.whileYouWait ? [fetcher.data.whileYouWait] : []),
      ])
    }
    if (fetcher.data?.chatsi_ExampleQuestions) {
      setExampleQuestions(fetcher.data?.chatsi_ExampleQuestions)
    }
  }, [fetcher.data])

  useEffect(() => {
    if (chatSiHistoryResponse && chatSiHistoryResponse.length > 0) {
      const reversedHistory = [...chatSiHistoryResponse].reverse()

      const allPrompts = reversedHistory.map((item) => item?.prompt)
      setUserPrompt(allPrompts)

      const formattedHistory = reversedHistory.map((historyItem) => ({
        ...historyItem,
        isStreaming: false,
        messages: historyItem.messages.map((msg) => ({
          message: msg,
        })),
      }))

      setMessages(formattedHistory)

      latestSessionIdRef.current =
        reversedHistory[reversedHistory.length - 1]?.session_id
    }
  }, [chatSiHistoryResponse])

  const handleHistoryButton = () => {
    if (!close) {
      setSidebarClose(false)
    }
    setIsHistorybarOpen(true)
    fetcher.load(`/chatSi?intent=history`)
  }

  const handleNewChatClean = () => {
    setMessages([])
    setUserPrompt([])
    latestSessionIdRef.current = undefined
  }

  useEffect(() => {
    if (fetcher.state === "loading") {
      setLoadingState(true)
    } else if (fetcher.data?.filters) {
      setUpdatedFilterData(fetcher.data?.filters)
      setInitialFiltersData(fetcher.data?.filters)
      setLoadingState(false)
    } else {
      setLoadingState(false)
    }
  }, [fetcher.state, fetcher.data?.filters])

  const handleShowFilters = (value: boolean) => {
    setShowFilters(value)

    if (
      initialFiltersData === null ||
      Object.keys(initialFiltersData).length === 0
    )
      fetcher.load("?intent=filter")
  }
  useEffect(() => {
    if (exampleQuestions.length === 0) {
      setStoreHandlerSubmit(handlePromptSubmit)
      fetcher.load(`?intent=example_questions`)
    }
  }, [exampleQuestions])

  // Update router type and placeholder
  useEffect(() => {
    setIsDocumentRouter(documentsRouter.includes(selectedRouter?.id))
    if (isFirstLoad) {
      setIsFirstLoad(false)
    } else {
      setPlaceholderText(`Now chatting with ${selectedRouter?.title}`)
    }
  }, [selectedRouter])

  // Set default option based on router type
  useEffect(() => {
    if (isDocumentRouter) {
      setSelectedOption({
        id: "auto",
        icon: faArrowsSplitUpAndLeft,
        title: "Auto Search",
        description: "Chat SI will select between Quick or Advanced Search",
        disabled: false,
      })
      setSearchMethod("auto")
    } else {
      setSelectedOption({
        id: "detailed",
        icon: faChartColumn,
        title: "Detailed",
        description: "More verbose and added visuals",
        disabled: false,
      })
      setSearchMethod("detailed")
    }
  }, [isDocumentRouter])

  return (
    <>
      <MobileMenu />
      <Sidebar />
      <div
        className={clsx(
          "transition-[padding] duration-300 w-full p-0 m-0 h-full",
          close ? "md:pl-sidebarClosed" : "md:pl-sidebarOpen"
        )}
      >
        <Header />
        <Main hasMobileMenu hasFooter>
          {messages.length === 0 ? (
            <div className="min-h-[calc(100vh-200px)] w-full flex flex-col items-center justify-center transition-[width,transform] duration-300">
              <OpenningTitle
                primaryText="Knowledge"
                secondaryText="at your fingertips."
                // videoLink={"https://www.youtube.com/embed/EfrXh4QWqMA"}
              />
              {exampleQuestions.length === 0 ? (
                <LoadingComponent variant={"Example Questions"} />
              ) : (
                <ExampleQuestions
                  questions={exampleQuestions}
                  handlePromptSubmit={handlePromptSubmit}
                  hasRefresh
                  hasLineClamp
                  hasLimit
                />
              )}
            </div>
          ) : (
            <ChatSiResponse
              promptResponse={messages}
              routerId={currentRouter}
              prompt={userPrompt}
              whileYouWait={whileYouWait}
            />
          )}
          {showFilters && (
            <Filters
              filterData={updatedFilterData}
              setShowFilters={setShowFilters}
            />
          )}
          <Toaster />
        </Main>
        <Footer>
          {exampleQuestions.length !== 0 && (
            <>
              <div className={"flex fadeIn relative"}>
                <div
                  className={clsx(
                    "absolute right-0 top-4 lg:static",
                    close ? "" : "lg:absolute xl:static top-0 lg:right-5"
                  )}
                >
                  <HistoryButton handleHistoryClick={handleHistoryButton} />
                </div>
                <ChatbarArea
                  handlerClickFilters={() => handleShowFilters(true)}
                  handlePromptSubmit={handlePromptSubmit}
                  disabled={isLoading}
                  placeholder={placeholderText}
                  preDefinedPrompt={preDefinedPrompt || undefined}
                  hasFilters={selectedRouter?.id === "docs"}
                  hasRouters
                  hasInfo
                  hasOptions
                  hasSearchType={showSearchType}
                  direction="column"
                  isResponseRendered={messages.length > 0}
                  isDocumentRouter={isDocumentRouter}
                  selectedOption={selectedOption}
                  onOptionSelect={setSelectedOption}
                />
                {messages.length > 0 && (
                  <div className="lg:ml-5 xl:ml-6 lg:min-w-[275px]" />
                )}
              </div>
            </>
          )}
        </Footer>
        <Outlet />
      </div>
      <Historybar
        bubbles={chatSiHistory}
        variant="chat si"
        handleNewChatClean={handleNewChatClean}
      />
    </>
  )
}

export const loader: LoaderFunction = async ({
  request,
}: LoaderFunctionArgs) => {
  const token = await requiredUserSession(request)

  const url = new URL(request.url)
  const params = new URLSearchParams(url.search)
  const while_you_wait = params.get("request")
  const intent = params.get("intent")
  const session_id = params.get("session_id")

  const envVar = await getMenuVariables()

  if (while_you_wait) {
    const response = await fetchWhileYouWaitFacts(token)
    return json({
      whileYouWait: response.fact,
      envVar,
    })
  } else if (intent === "filter") {
    const chatSIFilters = await fetchMetadataFilters(token)
    return json({
      filters: chatSIFilters,
      envVar,
    })
  } else if (intent === "example_questions") {
    const chatsi_ExampleQuestions = await fetchExampleQuestions(token)
    return json({
      chatsi_ExampleQuestions: chatsi_ExampleQuestions,
      envVar,
    })
  } else if (intent === "history") {
    const chatSiHistory = await fetchChatsiHistory(token)
    const firstElements = chatSiHistory.slice(0, 15)

    let transformedBubbles

    if (firstElements.length === 0) {
      transformedBubbles = [
        {
          title: "History is empty",
          session_id: "",
        },
      ]
    } else {
      transformedBubbles = firstElements.map((item: Bubble) => ({
        title: item.title,
        session_id: item.session_id,
      }))
    }
    return json({
      chatSiHistory: transformedBubbles,
      envVar,
    })
  } else if (intent === "history_response" && session_id) {
    const historyData = await fetchChatsiHistoryResponse(token, session_id)
    return json({
      chatSiHistoryResponse: historyData,
      envVar,
    })
  }
  return { envVar }
}

export async function action({ request }: ActionFunctionArgs) {
  // This line is for protecting the current route
  const token = await requiredUserSession(request)

  const formData = await request.formData()
  const intent = formData.get("intent") as string
  const historyIntent = formData.get("historyIntent") as string
  const url = new URL(request.url)
  const params = new URLSearchParams(url.search)
  const intentFeedback = params.get("intent")
  const intentFilter = url.searchParams.get("intent")
  const link = formData.get("link") as string
  const bubbleId = formData.get("bubble_id") as string
  const sourceImages = formData.get("sourceImages") as string

  if (intent === "clear") {
    const response = await DeleteChatSiHistory(token)
    if (response) {
      return redirect(`/chatSi`)
    } else {
      console.log("😭 History was not reset")
      return null
    }
  } else if (intentFeedback === "feedback") {
    const feedback = formData.get("feedbackState") as string
    const response = await setUserFeedback(token, formData)
    if (response) {
      return json({ feedbackState: feedback })
    } else {
      console.log("😭 feedback failed")
      return json({ feedbackState: "failed" })
    }
  } else if (intentFilter === "filter") {
    const submitFilters = await createMetadataSearchFilters(
      token,
      createMetadataSearchFilters_BEStructure(formData)
    )
    return json({ newFilters: submitFilters })
  } else if (intent === "download") {
    const response = await fetchInternalLink(token, link)

    const blob = await response.blob()
    const arrayBuffer = await blob.arrayBuffer()
    const file = Buffer.from(arrayBuffer).toString("base64")
    const fileType = response.headers.get("content-type")
    const disposition = response.headers.get("content-disposition")
    const fileName = extractFilenameFromDisposition(disposition ?? "")

    return { file, fileType, fileName }
  } else if (historyIntent === "delete_single_history") {
    const response = await deleteChatSiSingleHistory(token, bubbleId)
    if (response) {
      return json({ deleteSingleHistory: response })
    } else {
      console.log("😭 History was not reset")
      return null
    }
  } else if (
    sourceImages &&
    sourceImages !== null &&
    sourceImages !== undefined
  ) {
    const imagePaths = sourceImages?.split(",").filter(Boolean)
    try {
      const sourceImagesResponse = await Promise.all(
        imagePaths.map((path) => fetchSourceImages(token, path))
      )
      return json({ sourceImagesResponse })
    } catch (error) {
      console.error("Error fetching one or more images:", error)
      throw error
    }
  } else {
    return null
  }
}

export const shouldRevalidate: ShouldRevalidateFunction = ({
  currentParams,
  defaultShouldRevalidate,
  nextParams,
}) => {
  if (currentParams === nextParams) {
    return false
  }
  return defaultShouldRevalidate
}

export function ErrorBoundary() {
  return <ErrorBoundaryComponent isMainRoute={true} />
}
