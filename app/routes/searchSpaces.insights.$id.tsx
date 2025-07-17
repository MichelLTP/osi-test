import {
  json,
  useFetcher,
  useLoaderData,
  useNavigate,
  useParams,
} from "@remix-run/react"
import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import Main from "@/components/Layout/Main/Main"
import { ErrorBoundaryComponent } from "@/components/ui/ErrorBoundaryComponent/ErrorBoundaryComponent"
import { useCallback, useEffect, useRef, useState } from "react"
import { Toaster } from "@/components/ui/Toast/Toaster"
import { requiredUserSession } from "@/data/auth/session.server"
import { getMenuVariables } from "@/data/menuvariables/menuvariables.server"
import { IconProp } from "@fortawesome/fontawesome-svg-core"
import { useCloseSidebar } from "@/store/layout"
import { MarkdownRenderer } from "@/components/Shared/MarkdownRender/MarkdownRender"
import TrendingTopicBox from "@/components/SearchSpaces/TrendingTopicBox/TrendingTopicBox"
import RelatedDocBox from "@/components/SearchSpaces/RelatedDocBox/RelatedDocBox"
import { faBinoculars } from "@fortawesome/free-solid-svg-icons/faBinoculars"
import SearchSpaceActions from "@/components/SearchSpaces/SearchSpaceActions/SearchSpaceActions"
import { toast } from "@/hooks/useToast"
import {
  editSpace,
  getSpaceById,
  sendFeedbackToSpaces,
} from "@/data/searchspaces/searchSpaces.server"
import { Skeleton } from "@/components/ui/Skeleton/Skeleton"
import {
  processSearchSpaces,
  runSearchSpaceInsights,
} from "@/utils/sse/sseRender"
import {
  CreateSpaceData,
  RenderedStreamBlock,
  ResultStream,
  SectionDefinition,
  SpaceInsightsStream,
  StreamResult,
  StreamSectionKey,
} from "@/data/searchspaces/types"
import {
  getInsightSectionFromId,
  mapInsightIds,
} from "@/utils/searchSpaces/searchSpaces"
import Modal from "@/components/Shared/Modal/Modal"
import BackButton from "@/components/ui/BackButton/BackButton"
import { useContentID } from "@/store/copytoclipboard"
import { FeedbackState } from "@/components/Layout/SocialButtons/type"
import InsightTabContent from "@/components/SearchSpaces/InsightTabContent/InsightTabContent"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/Carousel/Carousel"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/NewTabs/tabs"
import ExampleQuestions from "@/components/ChatSi/ExampleQuestions/ExampleQuestions"
import { QuestionProps } from "@/components/ChatSi/ExampleQuestions/type"
import LoadingStatus from "@/components/Shared/LoadingStatus/LoadingStatus"
import { usePreDefinedPrompt, useRouterID } from "@/store/chatsi"
import { LoadingComponent } from "@/components/Layout/LoadingComponent/LoadingComponent"
import { useFiltersStore } from "@/store/filters"

export default function SearchSpaces_Spaces_Insights() {
  const isSidebarClosed = useCloseSidebar((state) => state.close)
  const { setRouterID } = useRouterID()
  const { SetPreDefinedPrompt } = usePreDefinedPrompt()
  const navigate = useNavigate()
  const [results, setResults] = useState<StreamResult>({} as StreamResult)
  const params = useParams()
  const [allPrompts, setAllPrompts] = useState<QuestionProps[]>([])
  const hasRunSocket = useRef(false)
  const idMapRef = useRef<Record<StreamSectionKey, string>>({
    summary: "",
    trending_topics: "",
    key_insights: "",
    intents: "",
    entity_map: "",
    comparative_insights: "",
    key_data_statistics: "",
    related_documents: "",
    ai_dive: "",
    ai_dive_critique_prompts: "",
    ai_dive_explore_prompts: "",
    ai_dive_synthesize_prompts: "",
    ai_dive_hypothesize_prompts: "",
    ai_dive_lookforward_prompts: "",
    ai_dive_relate_prompts: "",
  })
  const { spaceData } = useLoaderData<typeof loader>()
  const fetcher = useFetcher<typeof action>()
  const {
    setFilters,
    setIsFiltersSelected,
    setPreventFiltersReset,
    emptyFilters,
  } = useFiltersStore()
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const { setContentID } = useContentID()
  const toastsRef = useRef({
    initialToast: false,
    finalToast: false,
  })

  const contentToBeCopied = "copy-content"
  useEffect(() => {
    setContentID(contentToBeCopied)
  }, [])

  const handleStream = useCallback((messageChunk: string) => {
    try {
      const parsedMessage: SpaceInsightsStream = JSON.parse(messageChunk)
      switch (parsedMessage.type) {
        case "Form": {
          idMapRef.current = mapInsightIds(parsedMessage)
          const insightsCompiler =
            parsedMessage.content?.layout?.insights_compiler || {}
          type InsightCompiler = typeof insightsCompiler
          type InsightKey = keyof InsightCompiler

          const results = Object.fromEntries(
            Object.entries(idMapRef.current).map(([key, uuid]) => {
              const typedKey = key as InsightKey
              const section = insightsCompiler[typedKey]
              return [
                key,
                {
                  uuid,
                  feedback: (section as SectionDefinition)?.feedback?.state,
                },
              ]
            })
          )

          setResults((prevResults) => ({
            ...prevResults,
            ...results,
          }))
          return
        }
        case "Result":
        case "Error": {
          const { content, uuid } = parsedMessage as ResultStream
          const parsedContent = content?.map((item) =>
            item.type === "Markdown"
              ? item.result
              : JSON.parse(item.result as string)
          )

          const reverseIdMap = getInsightSectionFromId(idMapRef.current)
          const targetKey = reverseIdMap[uuid]

          if (targetKey) {
            setResults((prevResults) => {
              const updatedResults = { ...prevResults }
              const existingContent = updatedResults[targetKey]?.content || []
              const newContent = parsedContent.filter(
                (item) =>
                  !existingContent.some(
                    (existingItem) =>
                      JSON.stringify(existingItem) === JSON.stringify(item)
                  )
              )
              updatedResults[targetKey] = {
                ...updatedResults[targetKey],
                content: [...existingContent, ...newContent],
                status: null,
              }
              return updatedResults
            })
          }

          return
        }
        case "Status": {
          const { content, uuid } = parsedMessage
          if (content && typeof content === "string" && uuid) {
            const reverseIdMap = getInsightSectionFromId(idMapRef.current)
            const targetKey = reverseIdMap[uuid]

            if (!toastsRef.current.initialToast) {
              toast({
                title: "Insights Compilation Started",
                description:
                  "The insights compilation process has begun. It might take a few minutes to complete.",
              })
              toastsRef.current.initialToast = true
            }
            if (targetKey) {
              setResults((prevResults) => {
                const updatedResults = { ...prevResults }
                const currentSection = updatedResults[targetKey] || {}
                updatedResults[targetKey] = {
                  ...currentSection,
                  status: { body: content },
                }
                return updatedResults
              })
            }
          } else {
            console.warn(
              "Unexpected content format in Status message:",
              content
            )
          }
          return
        }
        case "Completed": {
          if (!toastsRef.current.finalToast && toastsRef.current.initialToast) {
            toast({
              title: "Insights Compilation Completed",
              description: "All insights have been successfully compiled.",
              variant: "success",
            })
            toastsRef.current.finalToast = true
          }
          return
        }
        default: {
          console.warn("Unhandled message type:", parsedMessage)
          return
        }
      }
    } catch (error) {
      console.log("Error parsing message chunk:", error)
    }
  }, [])

  useEffect(() => {
    const loadData = async () => {
      if (!hasRunSocket.current) {
        hasRunSocket.current = true
        await handleData()
      }
    }

    loadData()
  }, [])

  const handleData = async () => {
    const response = await runSearchSpaceInsights(params.id)
    await processSearchSpaces({
      response,
      onChunk: handleStream,
    })
  }

  const updateResultField = <T extends keyof StreamResult>(
    sectionName: T,
    field: keyof StreamResult[T],
    value: any
  ) => {
    const reverseIdMap = getInsightSectionFromId(idMapRef.current)
    const sectionId = reverseIdMap[sectionName] as StreamSectionKey

    setResults((prevResults) => {
      const updatedResults = { ...prevResults }
      const section = updatedResults[sectionId]
      if (section) {
        section[field] = value
      }
      return updatedResults
    })
  }

  const handleFeedbackChange = (
    insightUuid: keyof StreamResult,
    feedbackState: FeedbackState
  ) => {
    updateResultField(insightUuid, "feedback", feedbackState)
  }

  const insightTabs = [
    { label: "Intents", key: "intents" },
    { label: "Key Insights", key: "key_insights" },
    // { label: "Entity Map", key: "entity_map" },
    { label: "Comparative Insights", key: "comparative_insights" },
    // { label: "Key Data & Statistics", key: "key_data_statistics" },
    { label: "AI Dive", key: "ai_dive" },
  ]

  const aiDiveTabs = [
    {
      label: "All",
      key: "all",
    },
    {
      label: "Explore",
      key: "ai_dive_explore_prompts",
    },
    {
      label: "Synthesize",
      key: "ai_dive_synthesize_prompts",
    },
    {
      label: "Hypothesize",
      key: "ai_dive_hypothesize_prompts",
    },
    {
      label: "Look Forward",
      key: "ai_dive_lookforward_prompts",
    },
    {
      label: "Relate",
      key: "ai_dive_relate_prompts",
    },
    {
      label: "Critique",
      key: "ai_dive_critique_prompts",
    },
  ] as const

  const [currentTab, setCurrentTab] = useState<string>(insightTabs[0].key)
  const [currentAiDiveTab, setCurrentAiDiveTab] = useState<string>(
    aiDiveTabs[0].key
  )

  const handleTabChange = (index: string) => {
    setCurrentTab(index)
  }

  const handleAiDiveTabChange = (index: string) => {
    setCurrentAiDiveTab(index)
  }

  const handlePromptSubmit = (prompt: string, router: string) => {
    setRouterID(router)
    SetPreDefinedPrompt(`${prompt}\n\n${spaceData.instructions}`)
    navigate(`/chatsi/`)
    if (router === "docs") {
      setPreventFiltersReset(true)
      setFilters({
        ...emptyFilters,
        document_title: spaceData?.doc_names || [],
      })
      setIsFiltersSelected(true)
    }

    toast({
      title: `AI Dive prompt is ready`,
      description: `You can now proceed with the request.`,
      variant: "success",
    })
  }

  useEffect(() => {
    const promptKeys = [
      "ai_dive_explore_prompts",
      "ai_dive_synthesize_prompts",
      "ai_dive_hypothesize_prompts",
      "ai_dive_lookforward_prompts",
      "ai_dive_relate_prompts",
      "ai_dive_critique_prompts",
    ]

    const collectedPrompts: QuestionProps[] = []

    promptKeys.forEach((key) => {
      const promptData = results?.[key as keyof StreamResult]
      if (promptData && Array.isArray(promptData?.content)) {
        collectedPrompts.push(...promptData.content)
      }
    })

    setAllPrompts(collectedPrompts.sort(() => Math.random() - 0.5))
  }, [results])

  const toggleBookmark = (docId: string) => {
    const newDocs = spaceData.doc_ids.includes(docId)
      ? spaceData.doc_ids.filter((id) => id !== docId)
      : [...spaceData.doc_ids, docId]

    fetcher.submit(
      {
        data: JSON.stringify({
          title: spaceData.title,
          doc_ids: newDocs,
          description: spaceData.description,
        }),
      },
      {
        method: "patch",
        action: `?intent=modifyDocs`,
      }
    )
  }

  const handleDeleteSpace = async () => {
    fetcher.submit(
      { intent: "delete" },
      {
        method: "delete",
        action: `/searchSpaces/spaces/${params.id}`,
      }
    )
  }

  useEffect(() => {
    if (
      fetcher.state === "idle" &&
      fetcher.data?.intent === "modifyDocs" &&
      fetcher.data?.status?.toString() === "200"
    ) {
      toast({
        title: "Space Edited",
        description: fetcher.data?.message,
        variant: "success",
      })
    }

    if (
      (fetcher.state === "idle" &&
        fetcher.data?.status?.toString() === "500") ||
      fetcher.data?.status?.toString() === "400"
    ) {
      toast({
        title: "Error",
        description: fetcher.data?.message || "An error has occurred",
        variant: "error",
      })
    }
  }, [fetcher.state])

  return (
    <Main>
      <Toaster />
      {deleteModalOpen && (
        <Modal
          title={"Delete Space"}
          hasCancel
          handleClose={() => setDeleteModalOpen(false)}
          size={"x-small"}
          variant={"confirmation"}
          confirmationProps={{
            actionText: "Delete",
            handleAction: () => {
              handleDeleteSpace().then()
              setDeleteModalOpen(false)
            },
          }}
        >
          <p className={"mb-6"}>Do you want to delete this Space?</p>
        </Modal>
      )}
      <BackButton customURL={`/searchSpaces/spaces/${params.id}`} />
      <div className={`grid gap-8 mt-8`}>
        <header
          className={
            "flex items-center justify-between gap-2 border-b-2 dark:border-third-dark pb-3"
          }
        >
          <div className={"flex gap-2 items-center"}>
            <FontAwesomeIcon icon={faBinoculars as IconProp} />
            <h1 className={"text-2xlbold"}>{spaceData.title} Insights</h1>
          </div>
          <SearchSpaceActions
            hideInsightButton
            searchSpaceId={params.id}
            docs={{
              doc_ids: spaceData.doc_ids,
              doc_names: spaceData.doc_names,
            }}
            onDelete={() => setDeleteModalOpen(true)}
          />
        </header>

        <section className={`bg-third dark:bg-secondary-dark p-8 rounded-xs`}>
          <header className={"text-xlbold mb-4"}>Space Summary</header>

          {results?.summary?.status && (
            <div className="mb-8">
              <LoadingStatus
                statusMessage={(results.summary as any).status}
              />{" "}
            </div>
          )}

          {results?.summary?.content ? (
            <MarkdownRenderer value={results.summary?.content?.[0]} />
          ) : (
            <>
              <Skeleton className="h-8 w-full mb-4" />
              <Skeleton className="h-8 w-full" />
            </>
          )}
        </section>
        <section
          className={`grid gap-8 ${isSidebarClosed ? "sm:grid-cols-[2.2fr_1fr]" : "xl:grid-cols-[2.2fr_1fr]"}`}
        >
          <div className="min-w-0 max-w-full overflow-hidden">
            <h2 className={"text-xlbold mt-8"}>Insights Compiler</h2>
            <Tabs value={currentTab} onValueChange={handleTabChange}>
              <TabsList
                currentValue={currentTab}
                onValueChange={handleTabChange}
                variant="result"
              >
                {insightTabs.map((tab) => (
                  <TabsTrigger key={tab.key} value={tab.key} variant="result">
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>
              {insightTabs.map((tab) => (
                <TabsContent key={tab.key} value={tab.key}>
                  {(results[tab.key as keyof StreamResult] as any)?.status && (
                    <div className="mb-8">
                      <LoadingStatus
                        statusMessage={
                          (results[tab.key as keyof StreamResult] as any).status
                        }
                      />{" "}
                    </div>
                  )}
                  {tab.key !== "ai_dive" ? (
                    <InsightTabContent
                      result={
                        results[
                          tab.key as keyof StreamResult
                        ] as RenderedStreamBlock<string[]>
                      }
                      handleFeedbackChange={handleFeedbackChange}
                      uuid={results[tab.key as keyof StreamResult]?.uuid}
                      contentToBeCopied={contentToBeCopied}
                    />
                  ) : (
                    <Tabs
                      value={currentAiDiveTab}
                      onValueChange={handleAiDiveTabChange}
                      orientation={"vertical"}
                      className={"-py-4"}
                    >
                      <div className="flex gap-4">
                        <TabsList
                          currentValue={currentAiDiveTab}
                          onValueChange={handleAiDiveTabChange}
                          orientation={"vertical"}
                        >
                          {aiDiveTabs.map((tab) => (
                            <TabsTrigger
                              key={tab.key}
                              value={tab.key}
                              orientation={"vertical"}
                            >
                              {tab.label}
                            </TabsTrigger>
                          ))}
                        </TabsList>
                        {aiDiveTabs.map((aiTab) => (
                          <TabsContent
                            key={aiTab.key}
                            value={aiTab.key}
                            className={"w-full grow"}
                          >
                            {aiTab.key === "all" &&
                              !aiDiveTabs
                                .filter((tabs) => tabs.key !== "all")
                                .every(
                                  (tab) =>
                                    results[tab.key as keyof StreamResult]
                                      ?.status === null
                                ) && (
                                <div className="mb-8">
                                  <LoadingStatus
                                    statusMessage={{
                                      body: "Generating prompts...",
                                    }}
                                  />
                                </div>
                              )}
                            {aiTab.key !== "all" &&
                              results[aiTab.key as keyof StreamResult]
                                ?.status && (
                                <div className="mb-8">
                                  <LoadingStatus
                                    statusMessage={
                                      results[aiTab.key as keyof StreamResult]
                                        .status
                                    }
                                  />
                                </div>
                              )}
                            {aiTab.key === "all" ? (
                              allPrompts.length > 0 && (
                                <div className="flex grow justify-center w-full mx-auto overflow-y-auto max-h-[500px] sm:max-h-[900px] styled-scrollbar pr-2">
                                  <ExampleQuestions
                                    key={allPrompts.length}
                                    questions={allPrompts}
                                    className={"!grid-cols-1 lg:!grid-cols-2"}
                                    handlePromptSubmit={handlePromptSubmit}
                                  />
                                </div>
                              )
                            ) : (
                              <div className="flex justify-center w-full mx-auto grow">
                                {results?.[aiTab.key] &&
                                  Array.isArray(
                                    results?.[aiTab.key]?.content
                                  ) && (
                                    <ExampleQuestions
                                      questions={results?.[aiTab.key]?.content}
                                      handlePromptSubmit={handlePromptSubmit}
                                      className={"!grid-cols-1 lg:!grid-cols-2"}
                                    />
                                  )}
                              </div>
                            )}
                            {aiTab.key !== "all" &&
                              !results[aiTab.key as keyof StreamResult]
                                ?.content && (
                                <>
                                  <Skeleton className="h-20 w-full mb-4" />
                                  <Skeleton className="h-20 w-full" />
                                </>
                              )}
                            {aiTab.key === "all" &&
                              !aiDiveTabs.some(
                                (tab) =>
                                  results[tab.key as keyof StreamResult]
                                    ?.content
                              ) && (
                                <>
                                  <Skeleton className="h-20 w-full mb-4" />
                                  <Skeleton className="h-20 w-full" />
                                </>
                              )}
                          </TabsContent>
                        ))}
                      </div>
                    </Tabs>
                  )}
                </TabsContent>
              ))}
            </Tabs>
          </div>
          <div className={"flex flex-col w-full"}>
            <h2 className={"text-xlbold my-8"}>Trending Topics</h2>
            {results?.trending_topics?.status && (
              <div className="mb-8">
                <LoadingStatus statusMessage={results.trending_topics.status} />
              </div>
            )}
            <section className="flex flex-col gap-4 w-full">
              {results && results?.trending_topics?.content ? (
                results?.trending_topics?.content
                  ?.slice(0, 4)
                  ?.map((item, index) => (
                    <TrendingTopicBox
                      title={item.name}
                      description={item.description}
                      totalDocs={spaceData.doc_ids.length}
                      totalMentionedDocs={item.mentioned_in.length}
                      key={index}
                    />
                  ))
              ) : (
                <>
                  <Skeleton className="h-28 w-full" />
                  <Skeleton className="h-28 w-full" />
                  <Skeleton className="h-28 w-full" />
                  <Skeleton className="h-28 w-full" />
                </>
              )}
            </section>
          </div>
        </section>
        <section className={"mb-32 sm:mb-16 grid grid-cols-1"}>
          <header className={"text-xlbold my-8"}>Related Documents</header>
          {results?.related_documents?.status && (
            <div className="mb-8">
              <LoadingStatus statusMessage={results.related_documents.status} />
            </div>
          )}
          {results && results.related_documents?.content ? (
            <Carousel
              className="flex flex-col"
              opts={{
                align: "start",
                loop: false,
              }}
            >
              <CarouselContent className="ml-0 w-full">
                {results.related_documents.content.map((doc, index) => (
                  <CarouselItem
                    key={doc.doc_id + "-" + index}
                    className={`px-1 ${isSidebarClosed ? "basis-1/2 md:basis-1/4" : "basis-1/2 lg:basis-1/4"}`}
                  >
                    <RelatedDocBox
                      title={doc.doc_name}
                      isBookmarked={spaceData.doc_ids.includes(doc.doc_id)}
                      onBookmarkClick={() => toggleBookmark(doc.doc_id)}
                      docId={doc.doc_id}
                    />
                  </CarouselItem>
                ))}
              </CarouselContent>
              <div className="flex justify-center h-7 mt-4">
                <CarouselPrevious
                  variant="ghost"
                  className="!p-0 mr-8 text-secondary border-secondary h-9 w-5"
                />
                <CarouselNext
                  variant="ghost"
                  className="!p-0 ml-8 text-secondary border-secondary h-9 w-5"
                />
              </div>
            </Carousel>
          ) : (
            <div
              className={`grid ${isSidebarClosed ? "sm:grid-cols-2 md:grid-cols-4" : "grid-cols-2 lg:grid-cols-4"} gap-4`}
            >
              <LoadingComponent variant="carousel" />
            </div>
          )}
        </section>
      </div>
    </Main>
  )
}

export async function loader({ request, params }: LoaderFunctionArgs) {
  const token = await requiredUserSession(request)
  const { id } = params
  const envVar = await getMenuVariables()

  if (!id) {
    throw new Response("Space ID is required", { status: 400 })
  }

  const spaceData = await getSpaceById(token, id)

  return json({
    envVar,
    spaceData,
  })
}

export async function action({ request, params }: ActionFunctionArgs) {
  const formData = await request.formData()
  const token = await requiredUserSession(request)
  const { id } = params
  const url = new URL(request.url)
  const urlParams = new URLSearchParams(url.search)
  const intent = urlParams.get("intent")

  if (!id) {
    return json({ status: 400, message: "Space ID is required", intent })
  }

  switch (intent) {
    case "modifyDocs": {
      const { data } = Object.fromEntries(formData)

      if (!data) {
        return json({ status: 400, message: "Space ID is required", intent })
      }
      const parsedData = JSON.parse(data as string) as CreateSpaceData
      const result = await editSpace(token, id, parsedData)
      if (result.status === 200) {
        return json({
          status: 200,
          intent,
          message: "Space updated successfully",
        })
      }
      return json({
        feedbackState: "",
        status: 500,
        message: "Failed to update space",
        intent,
      })
    }
    case "feedback": {
      const { feedbackState, report, sectionId } = Object.fromEntries(formData)
      const status = await sendFeedbackToSpaces(
        token,
        id,
        sectionId as string,
        feedbackState as FeedbackState,
        report as string
      )
      if (status.status === 200) {
        return json({
          feedbackState: status.data?.feedback.state,
          status: 200,
          message: "Feedback sent successfully",
          feedbackField: sectionId,
          intent,
        })
      }
      return json({
        feedbackState: "",
        status: 500,
        message: "Failed to delete space",
        intent: "delete",
      })
    }
    default: {
      return json({
        status: 400,
        message: "Invalid action",
        intent,
        feedbackState: "",
      })
    }
  }
}

export function ErrorBoundary() {
  return <ErrorBoundaryComponent isMainRoute={false} />
}
