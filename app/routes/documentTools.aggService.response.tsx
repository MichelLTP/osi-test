import { ErrorBoundaryComponent } from "@/components/ui/ErrorBoundaryComponent/ErrorBoundaryComponent"
import AggServiceResponse from "@/components/DocTools/AggService/AggServiceResponse"
import useAggServiceStore, {
  AggregatorData,
  DisplayDocument,
  DisplayTopic,
  TopicMetaAnalysis,
} from "@/store/AggregatorService/aggregatorservice"
import { askAggService, processOpenStoryResponse } from "@/utils/sse/sseRender"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useToast } from "@/hooks/useToast"
import {
  ShouldRevalidateFunction,
  useFetcher,
  useLoaderData,
  useNavigate,
} from "@remix-run/react"
import AggServiceMetaResponse from "@/components/DocTools/AggService/AggServiceMetaResponse"
import {
  FinalResult,
  OutputSectionResponse,
} from "@/components/LitePaper/Output/types"
import LoadingStatus from "@/components/Shared/LoadingStatus/LoadingStatus"
import { Skeleton } from "@/components/ui/Skeleton/Skeleton"
import { Button } from "@/components/ui/Button/Button"
import { faEdit } from "@fortawesome/free-solid-svg-icons"
import useLocalDBFilesStore from "@/store/localDB"
import {
  ActionFunctionArgs,
  json,
  LoaderFunction,
  LoaderFunctionArgs,
  redirect,
} from "@remix-run/node"
import { requiredUserSession } from "@/data/auth/session.server"
import {
  deleteAggHistory,
  deleteAggSingleHistory,
  fetchAggHistory,
  getAggResult,
} from "@/data/documenttools/documenttools.server"
import { useCloseSidebar, useHistorybar } from "@/store/layout"
import { Bubble } from "@/components/Layout/Historybar/HistoryBubble/type"
import Historybar from "@/components/Layout/Historybar/Historybar"
import Footer from "@/components/Layout/Footer/Footer"
import HistoryButton from "@/components/Layout/HistoryButton/HistoryButton"
import { Toaster } from "@/components/ui/Toast/Toaster"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/NewTabs/tabs"
import UseCaseTitle from "@/components/Shared/UseCaseTitle/UseCaseTitle"
import { clsx } from "clsx"

const AggService = () => {
  const hasRunSocket = useRef(false)
  const { toast } = useToast()
  const [loadedResponse, setLoadedResponse] = useState<boolean>(false)
  const [currentTabIndex, setCurrentTabIndex] = useState("no-documents")
  const loaderData = useLoaderData<typeof loader>()
  const navigate = useNavigate()
  const [history, setHistory] = useState<Bubble[]>()
  const setSidebarClose = useCloseSidebar.getState().setClose
  const { setIsHistorybarOpen } = useHistorybar()
  const close = useCloseSidebar((state) => state.close)
  const {
    data,
    display,
    setResults,
    setDisplay,
    addOutputSectionResponse,
    resetData,
    setData,
    resetDisplay,
    setAggId,
    aggId,
  } = useAggServiceStore()
  const { allDocs, setAllDocs } = useLocalDBFilesStore()
  const fetcher = useFetcher<{ history: Bubble[]; status: string }>()
  const tabsProps = useMemo(() => {
    // Default tabs in case display data is empty
    if (!display || !display.documents || display.documents.length === 0) {
      return {
        tabs: [
          {
            label: "Loading Tabs...",
            children: (
              <div>
                <LoadingStatus
                  statusMessage={{
                    body: "Preparing your documents aggregation...",
                  }}
                />

                <div className="flex flex-col mt-4">
                  <Skeleton className="h-[23px] w-full mb-2" />
                  <Skeleton className="h-[23px] w-full mb-2" />
                  <Skeleton className="h-[120px] w-full mb-2" />
                </div>
              </div>
            ),
            id: "no-documents",
          },
        ],
      }
    }

    const tabs = [
      ...display.documents.map((doc) => ({
        label: doc.filename,
        children: <AggServiceResponse topics={doc.topics} />,
        id: `document-${doc.id}`,
      })),
      // Overall meta analysis tab (if it exists)
      ...(display.meta_analysis && Object.keys(display.meta_analysis).length > 0
        ? [
            {
              label: "Meta Analysis",
              children: (
                <AggServiceMetaResponse meta_analysis={display.meta_analysis} />
              ),
              id: "overall-meta-analysis",
            },
          ]
        : []),
    ]

    return {
      tabs,
    }
  }, [display])

  const handleStream = useCallback(
    (messageChunk: string) => {
      try {
        const parsedMessage = JSON.parse(messageChunk)
        if (
          parsedMessage.type === "Form" &&
          parsedMessage.content &&
          parsedMessage.content?.workspace_id
        ) {
          setAggId(parsedMessage.content.workspace_id)
        } else if (parsedMessage.type === "Form" && parsedMessage.content) {
          const content = parsedMessage.content.form.display
          setDisplay(content)

          const resultStructure: FinalResult[] = []

          // Extract all topics from all documents
          if (content.documents && content.documents.length > 0) {
            // For each document, go through its topics
            content.documents.forEach((document: DisplayDocument) => {
              if (document.topics && document.topics.length > 0) {
                document.topics.forEach((topic: DisplayTopic) => {
                  // Add each topic to the resultStructure
                  resultStructure.push({
                    uuid: topic.response_uuid,
                    content: [
                      {
                        type: "Status",
                        result: "Waiting for the result",
                        completed: false,
                      },
                    ],
                  })
                })
              }
            })
            setResults(resultStructure)
          }

          // Add topic meta analyses
          if (
            content.meta_analysis &&
            content.meta_analysis.topic_meta_analysis
          ) {
            content.meta_analysis.topic_meta_analysis.forEach(
              (metaAnalysis: TopicMetaAnalysis) => {
                resultStructure.push({
                  uuid: metaAnalysis.uuid,
                  content: [
                    {
                      type: "Status",
                      result: "Waiting for meta analysis result",
                      completed: false,
                    },
                  ],
                  meta_type: "topic_meta",
                  topic_title: metaAnalysis.topic_title,
                })
              }
            )
          }

          // Add overall meta analysis
          if (
            content.meta_analysis &&
            content.meta_analysis.overall_meta_analysis
          ) {
            resultStructure.push({
              uuid: content.meta_analysis.overall_meta_analysis.uuid,
              content: [
                {
                  type: "Status",
                  result: "Waiting for overall analysis result",
                  completed: false,
                },
              ],
              meta_type: "overall_meta",
            })
          }
        } else if (parsedMessage.type === "Status" && parsedMessage.content) {
          addOutputSectionResponse(parsedMessage.uuid, {
            type: parsedMessage.type,
            result: parsedMessage.content,
            completed: false,
          })
        } else if (parsedMessage.type === "Error" && parsedMessage.content) {
          addOutputSectionResponse(parsedMessage.uuid, {
            type: parsedMessage.type,
            result: parsedMessage.content,
          })
        } else if (
          parsedMessage.type === "Result" &&
          parsedMessage.content &&
          parsedMessage.uuid
        ) {
          if (Array.isArray(parsedMessage.content)) {
            parsedMessage.content.forEach((item: OutputSectionResponse) => {
              addOutputSectionResponse(
                parsedMessage.uuid,
                item,
                parsedMessage.hash_id
              )
            })
          } else {
            addOutputSectionResponse(
              parsedMessage.uuid,
              parsedMessage.content,
              parsedMessage.hash_id
            )
          }
        } else {
          console.warn(`Unhandled progress type: ${parsedMessage.type}`)
        }
      } catch (error) {
        console.error("Error processing message chunk:", error)
      }
    },
    [setDisplay, setResults]
  )

  useEffect(() => {
    if (
      loadedResponse === false &&
      (allDocs.opensi_documents.length > 0 ||
        allDocs.private_documents.length > 0)
    ) {
      setLoadedResponse(true)
      if (!hasRunSocket.current) {
        handleRunAnalysis()
        hasRunSocket.current = true
      }
    } else if (loaderData && loaderData.aggResult) {
      setLoadedResponse(true)
      setResults([])
      resetDisplay()

      const newForm: AggregatorData = {
        type: "Aggregation",
        topics: loaderData.aggResult.form.form.topics.map((topic, index) => ({
          id: `${index + 1}`,
          title: topic.title,
          prompt: topic.prompt,
          meta_analysis: topic.meta_analysis,
        })),
        meta_analysis: loaderData.aggResult.form.form.meta_analysis,
      }
      const newDocs: any = {
        private_documents: loaderData.aggResult.form.form.private_documents,
        opensi_documents: loaderData.aggResult.form.form.opensi_documents,
      }
      setData(newForm)
      setAllDocs(newDocs)
      // we can also set the form and run the analysis
      if (!hasRunSocket.current) {
        handleRunAnalysis(newForm, newDocs)
        hasRunSocket.current = true
      }
    } else {
      resetData()
      resetDisplay()
      setResults([])
      navigate("/documentTools/aggService", {
        replace: true,
      })
    }
  }, [loaderData.aggResult])

  useEffect(() => {
    setCurrentTabIndex(tabsProps.tabs[0]?.id || "no-documents")
  }, [tabsProps.tabs, loaderData.history])

  const handleRunAnalysis = async (inputData = data, inputDocs = allDocs) => {
    const formData = new FormData()
    const urlParams = new URLSearchParams(window.location.search)
    const url_aggId = urlParams.get("aggId")
    const submitData = {
      form: {
        ...inputData,
        ...inputDocs,
      },
      ...(url_aggId && { workspace_id: url_aggId }),
    }

    formData.append("body", JSON.stringify(submitData))

    try {
      const response = await askAggService(formData)
      if (!response) return

      processOpenStoryResponse({
        response,
        onChunk: handleStream,
      })
    } catch (err) {
      toast({
        title: "Something went wrong",
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "error",
      })
    }
  }

  const handleEditClick = () => {
    const urlParams = new URLSearchParams(window.location.search)
    const url_aggId = urlParams.get("aggId")
    if (url_aggId) {
      navigate(`/documentTools/aggService?aggId=${url_aggId}`)
    } else {
      navigate(`/documentTools/aggService?aggId=${aggId}`)
    }
  }

  const handleHistoryButton = () => {
    if (!close) {
      setSidebarClose(false)
    }
    setIsHistorybarOpen(true)
    hasRunSocket.current = false
    fetcher.load(`?intent=history`)
  }

  const handleNewChatClick = () => {
    setAggId("")
    resetData()
    resetDisplay()
    setResults([])
    setAllDocs({
      private_documents: [],
      opensi_documents: [],
    })
    setIsHistorybarOpen(false)
  }

  useEffect(() => {
    if (fetcher.data) {
      const { history, status } = fetcher.data
      if (history) {
        setHistory(history)
      }
      if (status && status === "error deleting history") {
        toast({
          title: `Failed to delete aggregation history`,
          description: `aa`,
          variant: "error",
        })
      }
    }
  }, [fetcher.data])

  const handleTabChange = (tabId: string) => {
    setCurrentTabIndex(tabId)
  }

  return (
    <>
      <Toaster />
      <UseCaseTitle
        title="Aggregator Service"
        subtitle="Cross-document synthesis in a flash"
      />
      <h4 className="text-xlbold mb-10">Global Results</h4>
      <Tabs
        value={String(currentTabIndex)}
        onValueChange={(value) => handleTabChange(value)}
      >
        <TabsList
          currentValue={currentTabIndex}
          onValueChange={(value) => handleTabChange(value)}
        >
          {tabsProps.tabs.map((tab) => (
            <TabsTrigger key={tab.id} value={tab.id} variant="result">
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
        {tabsProps.tabs.map((tab) => (
          <TabsContent key={tab.id} value={tab.id}>
            {tab.children}
          </TabsContent>
        ))}
      </Tabs>
      <div className="flex justify-end mb-[100px] mt-4">
        <Button
          icon={faEdit}
          className={"font-normal"}
          variant={"borderGhost"}
          disabled={false}
          onClick={() => handleEditClick()}
        >
          edit aggregator
        </Button>
      </div>
      <Historybar
        bubbles={history || []}
        variant={"aggregator"}
        handleNewChatClean={handleNewChatClick}
      />
      <Footer hasBackground={false}>
        <HistoryButton
          handleHistoryClick={handleHistoryButton}
          className={clsx("right-4")}
        />
      </Footer>
    </>
  )
}

export default AggService

export const loader: LoaderFunction = async ({
  request,
}: LoaderFunctionArgs) => {
  const token = await requiredUserSession(request)

  const url = new URL(request.url)
  const params = new URLSearchParams(url.search)
  const intent = params.get("intent")
  const aggId = params.get("aggId")

  let transformedBubbles = [
    {
      title: "History is empty",
      session_id: "",
    },
  ]

  if (intent === "history") {
    const history = await fetchAggHistory(token)

    if (!history || history.length === 0) {
      transformedBubbles = [
        {
          title: "History is empty",
          session_id: "",
        },
      ]
    } else {
      transformedBubbles = history.slice(0, 15).map((item: Bubble) => ({
        title: item.title,
        session_id: item.workspace_id,
      }))
    }
  }

  if (aggId) {
    let aggResult = await getAggResult(token, aggId)
    if (aggResult.result) {
      return json({
        aggResult: aggResult,
        history: transformedBubbles,
        status: null,
      })
    }
    return json({
      aggResult: null,
      history: transformedBubbles,
      status: null,
    })
  } else {
    return json({
      aggResult: null,
      history: transformedBubbles,
      status: null,
    })
  }
}

export async function action({ request }: ActionFunctionArgs) {
  const token = await requiredUserSession(request)
  const url = new URL(request.url)
  const intent = url.searchParams.get("intent")
  const formData = await request.formData()
  const historyIntent = formData.get("historyIntent") as string
  const aggId = formData.get("bubble_id") as string

  if (intent === "clearHistory") {
    const response = await deleteAggHistory(token)
    if (response) {
      return redirect(`/documentTools/aggService`)
    } else {
      return json({
        receivedPersonalFiles: [],
        receivedDBFiles: [],
        status: "error deleting history",
        filters: null,
      })
    }
  } else if (historyIntent === "delete_single_history") {
    const response = await deleteAggSingleHistory(token, aggId)

    if (response) {
      return json({ deleteSingleHistory: response })
    }
  } else {
    return json({
      receivedPersonalFiles: [],
      receivedDBFiles: [],
      status: null,
      filters: null,
    })
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
  return <ErrorBoundaryComponent isMainRoute={false} />
}
