import DocToolsResponse from "@/components/DocTools/DocToolsResponse/DocToolsResponse"
import { IDocToolsResponseProps } from "@/components/DocTools/DocToolsResponse/type"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/Accordion/Accordion"
import { ErrorBoundaryComponent } from "@/components/ui/ErrorBoundaryComponent/ErrorBoundaryComponent"
import TextArea from "@/components/ui/TextArea/TextArea"
import { requiredUserSession } from "@/data/auth/session.server"
import {
  deletePrivateDocument,
  deleteQAHistory,
  deleteQASingleHistory,
  fetchQAHistory,
  fetchQAHistoryResponse,
  fetchQaJobSearch,
  setQAFeedback,
  UpdatePrivateLibrary,
  UploadPrivateDocument,
} from "@/data/documenttools/documenttools.server"
import { toast } from "@/hooks/useToast"
import { useDocumentQAStore } from "@/store/documenttools"
import { askDocumentToolsQA, processQAResponse } from "@/utils/sse/sseRender"
import { FileTypes } from "@/components/Shared/DocumentSelection/type"
import { handleFileType } from "@/utils/documentTools"

import {
  ActionFunctionArgs,
  LoaderFunction,
  LoaderFunctionArgs,
  redirect,
} from "@remix-run/node"
import {
  json,
  ShouldRevalidateFunction,
  useFetcher,
  useLoaderData,
} from "@remix-run/react"
import { useCallback, useEffect, useMemo, useState } from "react"
import { extractIds } from "@/utils/chatSi"
import Historybar from "@/components/Layout/Historybar/Historybar"
import Footer from "@/components/Layout/Footer/Footer"
import ChatbarArea from "@/components/Layout/ChatbarArea/ChatbarArea"
import HistoryButton from "@/components/Layout/HistoryButton/HistoryButton"
import { useCloseSidebar, useHistorybar, useLoadingState } from "@/store/layout"
import { Bubble } from "@/components/Layout/Historybar/HistoryBubble/type"
import { DBLoadState } from "@/components/Shared/LoadFromDB/type"
import { FilterData } from "@/components/Shared/Filters/types"
import {
  createMetadataSearchFilters,
  fetchMetadataFilters,
} from "@/data/searchsi/searchSi.server"
import { createMetadataSearchFilters_BEStructure } from "@/utils/metadataFilters"
import useLocalDBFilesStore from "@/store/localDB"
import { fetchSessionDocs } from "@/data/litepaper/litepaper.server"
import { useFiltersStore } from "@/store/filters"
import { Document } from "@/components/LitePaper/types"
import { Toaster } from "@/components/ui/Toast/Toaster"
import { Label } from "@/components/ui/Label/Label"
import DocumentSelectionV2 from "@/components/Shared/DocumentSelection/DocumentSelectionV2"
import { fetchSourceImages } from "@/data/chatsi/chatsi.server"
import UseCaseTitle from "@/components/Shared/UseCaseTitle/UseCaseTitle"
import { clsx } from "clsx"

export default function DocumentTools() {
  const [userPrompt, setUserPrompt] = useState<string[]>([])
  const [messages, setMessages] = useState<IDocToolsResponseProps[]>([])
  const [collapsed, setCollapsed] = useState<number>(1)
  const [filteredDBFiles, setFilteredDBFiles] = useState<Document[]>([])
  const [filteredPrivateFiles, setFilteredPrivateFiles] = useState<Document[]>(
    []
  )
  const [isChatbarActive, setIsChatbarActive] = useState(false)
  const [fileTypes, setFileTypes] = useState<FileTypes>("none")
  const setSidebarClose = useCloseSidebar.getState().setClose
  const { setIsHistorybarOpen } = useHistorybar()
  const close = useCloseSidebar((state) => state.close)

  const {
    prompt,
    writingStyle,
    setPrompt,
    setDocSessionID,
    docSessionID,
    setIsLoading,
    setWrittingStyle,
  } = useDocumentQAStore()

  const {
    localDBFiles,
    localPrivateFiles,
    setLocalDBFiles,
    setLocalPrivateFiles,
    dbLoad,
    privateLoad,
    setNeedLoadState,
    handleFileUpload,
    handleCancelUpload,
    setIsLoadingDocs,
    allDocs,
    resetAllDocs,
  } = useLocalDBFilesStore()

  const { setLoadingState } = useLoadingState()

  const {
    setUpdatedFilterData,
    updatedFilterData,
    setInitialFiltersData,
    setFilters,
    setIsFiltersSelected,
  } = useFiltersStore()

  const selectedDBFiles = useMemo(
    () => allDocs.opensi_documents || [],
    [allDocs.opensi_documents]
  )
  const selectedPrivateFiles = useMemo(
    () => allDocs.private_documents || [],
    [allDocs.private_documents]
  )

  const fetcher = useFetcher<{
    receivedPersonalFiles: Document[]
    receivedDBFiles: Document[]
    status: string
    filters: FilterData
  }>()
  const { session_id, qaHistoryResponse } = useLoaderData() as {
    jobSearch: string
    session_id: string
    qaHistoryResponse: {
      exchanges: { prompt: string; response: { message: string }[] }[]
    }
  }

  const history =
    fetcher.data && fetcher.data.history && fetcher.data.history.length > 0
      ? fetcher.data.history
      : null

  useEffect(() => {
    handleNewQA()
  }, [])

  useEffect(() => {
    if (isChatbarActive) {
      setIsChatbarActive(false)
    }
  }, [selectedDBFiles, selectedPrivateFiles])

  useEffect(() => {
    if (qaHistoryResponse !== undefined && session_id !== undefined) {
      const allPrompts = qaHistoryResponse?.exchanges
        .slice()
        .reverse()
        .map((exchange) => exchange.prompt)

      const formattedMessages = qaHistoryResponse?.exchanges
        .slice()
        .reverse()
        .map((exchange) => ({
          messages: exchange.response.map((msg) => ({
            message: JSON.stringify(msg),
          })),
        }))

      if (formattedMessages && formattedMessages.length > 0) {
        setMessages(formattedMessages)
      }

      if (allPrompts && allPrompts.length > 0) {
        setUserPrompt(allPrompts)
      }

      setCollapsed(0)
      resetAllDocs()
      setFilters({} as FilterData)
      setIsFiltersSelected(false)
      setUpdatedFilterData({} as FilterData)
      setInitialFiltersData({} as FilterData)
    }
  }, [qaHistoryResponse])

  const handleHistoryButton = () => {
    if (!close) {
      setSidebarClose(false)
    }
    setIsHistorybarOpen(true)

    fetcher.load(`/documentTools/QA?intent=history`)
  }

  useEffect(() => {
    if (fetcher.data?.filters) {
      setUpdatedFilterData(fetcher.data?.filters)
      setInitialFiltersData(fetcher.data?.filters)
      setLoadingState(false)
    }
  }, [fetcher.data?.filters])

  useEffect(() => {
    if (fetcher.data) {
      const { receivedPersonalFiles, receivedDBFiles, status } = fetcher.data

      if (receivedDBFiles.length > 0 && receivedDBFiles) {
        setLocalDBFiles(receivedDBFiles)
        setIsLoadingDocs(DBLoadState.DONE)
      }
      if (receivedPersonalFiles.length > 0 && receivedPersonalFiles) {
        setLocalPrivateFiles(receivedPersonalFiles)
        setIsLoadingDocs(DBLoadState.DONE)
      }
      if (status && status === "noFiles") {
        setIsLoadingDocs(DBLoadState.DONE)
      }
    }
  }, [fetcher.data])

  useEffect(() => {
    if (selectedDBFiles.length > 0) {
      const updatedLocalDBFiles = localDBFiles.filter((localFile) =>
        selectedDBFiles?.every((dbFile) => dbFile.id !== localFile.id)
      )
      setFilteredDBFiles(updatedLocalDBFiles)
    } else {
      setFilteredDBFiles(localDBFiles)
    }

    if (selectedPrivateFiles.length > 0) {
      const updatedLocalPrivateFiles = localPrivateFiles.filter((localFile) =>
        selectedPrivateFiles?.every(
          (privateFile) => privateFile.id !== localFile.id
        )
      )
      setFilteredPrivateFiles(updatedLocalPrivateFiles)
    } else {
      setFilteredPrivateFiles(localPrivateFiles)
    }
  }, [selectedPrivateFiles, selectedDBFiles, localDBFiles, localPrivateFiles])

  const handleShowFilters = () => {
    setLoadingState(true)
    fetcher.submit(null, {
      method: "post",
      action: `?intent=getFilters`,
    })
  }

  const handleNewQA = () => {
    setIsLoadingDocs(DBLoadState.DONE)
    setDocSessionID(null)
    setMessages([])
    setUserPrompt([])
    resetAllDocs()
    setFilters({} as FilterData)
    setIsFiltersSelected(false)
    setUpdatedFilterData({} as FilterData)
    setInitialFiltersData({} as FilterData)
    setWrittingStyle("")
    setCollapsed(1)
  }

  useEffect(() => {
    if (
      (dbLoad && localDBFiles?.length === 0) ||
      (privateLoad && localPrivateFiles?.length === 0)
    ) {
      const queryParams = new URLSearchParams()
      queryParams.append("intent", "loadDB")

      if (dbLoad && localDBFiles?.length === 0) {
        queryParams.append("OpenSI", "yes")
      }

      if (privateLoad && localPrivateFiles?.length === 0) {
        queryParams.append("Private", "yes")
      }
      setIsLoadingDocs(DBLoadState.LOADING)
      fetcher.load(`?${queryParams.toString()}`)
      setNeedLoadState(false, false)
    }
  }, [dbLoad, privateLoad])

  useEffect(() => {
    const type = handleFileType(selectedDBFiles, selectedPrivateFiles)
    setFileTypes(type)
  }, [selectedDBFiles, selectedPrivateFiles])

  const selectionHandlers = {
    shouldLoadDocs: setNeedLoadState,
    onFileUpload: handleFileUpload,
    onCancelUpload: handleCancelUpload,
    filters: updatedFilterData,
    handleShowFilters,
  }

  useEffect(() => {
    if (prompt !== "" && session_id !== "") {
      handlePromptSubmit(prompt)
    }
  }, [prompt])

  const handleStream = useCallback((messageChunk: string) => {
    setMessages((prevMessages) => {
      if (prevMessages.length === 0) {
        // Initialize the first session
        return [
          {
            messages: [{ message: messageChunk }],
          },
        ]
      } else {
        // Append new message to the last session
        const lastSessionIndex = prevMessages.length - 1

        // Make deep copy of the messages array inside the last session
        const updatedMessages = prevMessages.map((session, index) => {
          if (index === lastSessionIndex) {
            // Return a new object with a copy of the messages array
            return {
              ...session,
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
          const { sessionId } = extractIds(messageChunk)

          setDocSessionID(sessionId)

          if (sessionId) {
            updatedMessages[lastSessionIndex].sessionID = sessionId
          } else {
            console.log("Failed to extract session ID")
          }
        }
        return updatedMessages
      }
    })
  }, [])

  const handlePromptSubmit = async (prompt: string) => {
    setUserPrompt((prev) => [...prev, prompt])

    setMessages((prevMessages) => [
      ...prevMessages,
      {
        messages: [],
        sessionID: null,
      },
    ])

    try {
      setCollapsed(0)
      setIsLoading(true)
      const response = await askDocumentToolsQA({
        session_id: docSessionID,
        docs: [
          ...selectedDBFiles.map((file) => ({
            doc_id: file.id,
            doc_name: file.filename,
          })),
          ...selectedPrivateFiles.map((file) => ({
            doc_id: file.id,
            doc_name: file.filename,
          })),
        ],
        prompt: prompt,
        writing_style: writingStyle,
      })
      if (!response) return

      processQAResponse({
        response,
        onChunk: handleStream,
      })

      setPrompt("")
    } catch (err) {
      toast({
        title: "Something went wrong",
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "error",
      })
    }
  }

  return (
    <>
      <UseCaseTitle
        title="Document Q&A"
        subtitle="Chat with documents"
        description="In this module you can upload a document and ask specific questions
        about it. If you need a summary use the summarization module as it is
        better optimized for summarization."
      />

      <Accordion
        type="single"
        collapsible
        className="w-full"
        value={`${collapsed}`}
        defaultValue="1"
        onValueChange={(value) => setCollapsed(Number(value))}
      >
        <AccordionItem value="1" className="border-none">
          <AccordionTrigger
            showRouterDocs={false}
            showMetadataFilters={false}
            className="text-2xlbold mt-8 border-b border-secondary border-opacity-60 dark:border-third-dark"
          >
            Required inputs steps
          </AccordionTrigger>
          <AccordionContent>
            <div className="flex flex-col gap-y-16 mt-7">
              <div>
                <p className="text-base border-b border-secondary border-opacity-60 dark:border-third-dark justify-left pb-3">
                  Document Scope
                </p>
                <div className="w-full pt-8">
                  <DocumentSelectionV2
                    fileTypes={fileTypes}
                    openSiDocs={filteredDBFiles}
                    privateDocs={filteredPrivateFiles}
                    selectedOpenSiDocs={selectedDBFiles}
                    selectedPrivateDocs={selectedPrivateFiles}
                    {...selectionHandlers}
                  />
                </div>
              </div>
              <div className="space-y-8">
                <p className="text-base border-b border-secondary border-opacity-60 dark:border-third-dark justify-left pb-3">
                  Q&A settings
                </p>
                <div className="space-y-4">
                  <Label>Writting Style</Label>
                  <TextArea
                    id="description"
                    name="description"
                    placeholder="Write in a free-flow manner without being too verbose"
                    className="rounded-xs dark:bg-secondary-dark dark:text-white h-[150px] styled-scrollbar w-full lg:w-[50%]"
                    value={writingStyle || ""}
                    onChange={(e) => setWrittingStyle(e.target.value as string)}
                  />
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
      {messages.length > 0 && (
        <DocToolsResponse promptResponse={messages} prompt={userPrompt} />
      )}
      <Historybar
        bubbles={history || []}
        variant={"qa"}
        handleNewChatClean={handleNewQA}
      />
      <Footer>
        <section className={"flex relative"}>
          <div
            className={clsx(
              "absolute right-0 top-4 lg:static",
              close ? "" : "lg:absolute xl:static top-0 lg:right-5"
            )}
          >
            <HistoryButton handleHistoryClick={handleHistoryButton} />
          </div>
          <ChatbarArea
            handlePromptSubmit={setPrompt}
            disabled={
              selectedDBFiles.length === 0 && selectedPrivateFiles.length === 0
            }
            placeholder="What would you like to explore today?"
          />
        </section>
      </Footer>
      <Toaster />
    </>
  )
}

export const loader: LoaderFunction = async ({
  request,
}: LoaderFunctionArgs) => {
  const token = await requiredUserSession(request)

  const url = new URL(request.url)
  const params = new URLSearchParams(url.search)

  const session_id = params.get("session_id")
  const intent = params.get("intent")
  if (intent === "history") {
    const history = await fetchQAHistory(token)

    const firstElements = history.session_stubs.slice(0, 15)

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
        session_id: item.id,
      }))
    }

    return json({
      history: transformedBubbles,
      receivedPersonalFiles: [],
      receivedDBFiles: [],
      status: null,
      filters: null,
    })
  } else if (intent === "history_response" && session_id) {
    const historyData = await fetchQAHistoryResponse(token, session_id)
    return json({
      qaHistoryResponse: historyData,
      session_id: session_id,
    })
  } else if (session_id) {
    const result = await fetchQaJobSearch(token, session_id)
    return json({ jobSearch: result, session_id: session_id })
  } else if (intent === "loadDB") {
    const formData = new FormData()

    const hasOpenSI = params.get("OpenSI") === "yes"
    const hasPrivate = params.get("Private") === "yes"

    const requestData = {
      has_db_files: hasOpenSI,
      has_personal_files: hasPrivate,
    }

    formData.append("data", JSON.stringify(requestData))
    const first_response = await fetchSessionDocs(token, formData)

    const transformedResponse = {
      personal_files: first_response.personal_files.map((doc) => ({
        id: doc.doc_id,
        filename: doc.doc_name,
      })),
      db_files: first_response.db_files.map((doc) => ({
        id: doc.doc_id,
        filename: doc.doc_name,
      })),
    }

    let status
    if (
      first_response.personal_files.length === 0 &&
      first_response.db_files.length === 0
    ) {
      status = "noFiles"
    } else {
      status = null
    }
    return json({
      receivedPersonalFiles: transformedResponse.personal_files,
      receivedDBFiles: transformedResponse.db_files,
      status: status,
      filters: null,
    })
  } else {
    return json({
      receivedPersonalFiles: [],
      receivedDBFiles: [],
      status: null,
      filters: null,
    })
  }
}

export async function action({ request }: ActionFunctionArgs) {
  const token = await requiredUserSession(request)

  const url = new URL(request.url)
  const params = new URLSearchParams(url.search)
  const intent = params.get("intent")
  const privateDocId = params.get("privateDocId")
  const formData = await request.formData()
  const dataParam = new URLSearchParams({
    data: formData.get("data") as string,
  })
  const method = formData.get("method") as string
  const historyIntent = formData.get("historyIntent") as string
  const sessionId = formData.get("bubble_id") as string
  const sourceImages = formData.get("sourceImages") as string
  if (privateDocId) {
    await deletePrivateDocument(token, privateDocId)
    const privateLibrary = await UpdatePrivateLibrary(token, dataParam)
    return json({ privateLibrary: privateLibrary.personal_files })
  }

  if (intent === "uploadPrivateDoc") {
    const uploadPrivateDoc = await UploadPrivateDocument(token, formData)
    if (!uploadPrivateDoc) {
      console.warn("⚠️ Warning: dataParam is missing in uploadPrivateDoc")
      const privateLibrary = await UpdatePrivateLibrary(token, dataParam)
      return json({ privateLibrary: privateLibrary.personal_files })
    }
    return json({})
  }

  if (intent === "privateLibrary") {
    const privateLibrary = await UpdatePrivateLibrary(token, dataParam)
    return json({ privateLibrary: privateLibrary.personal_files })
  }

  if (historyIntent === "delete_single_history") {
    const response = await deleteQASingleHistory(token, sessionId)
    if (response) {
      return json({ deleteSingleHistory: response })
    }
  }

  if (method === "qaMethod") {
    const response = await deleteQAHistory(token)
    if (response) {
      return redirect(`/documentTools/QA`)
    } else {
      console.log("😭 History was not reset")
      return null
    }
  }

  if (intent === "feedback") {
    const feedback = formData.get("feedbackState") as string

    const response = await setQAFeedback(token, formData)
    if (response === null) {
      return json({ feedbackState: feedback })
    } else {
      return json({ feedbackState: "failed" })
    }
  }

  if (intent === "getFilters") {
    const filters = await fetchMetadataFilters(token)
    return json({
      filters: filters,
      receivedPersonalFiles: [],
      receivedDBFiles: [],
      status: null,
    })
  } else if (intent === "filter") {
    const submitFilters = await createMetadataSearchFilters(
      token,
      createMetadataSearchFilters_BEStructure(formData)
    )
    return json({
      newFilters: submitFilters,
      receivedPersonalFiles: [],
      receivedDBFiles: [],
      status: null,
    })
  }
  if (sourceImages !== undefined) {
    const imagePaths = sourceImages.split(",").filter(Boolean)
    try {
      const sourceImagesResponse = await Promise.all(
        imagePaths.map((path) => fetchSourceImages(token, path))
      )
      return json({ sourceImagesResponse })
    } catch (error) {
      console.error("Error fetching one or more images:", error)
      throw error
    }
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
