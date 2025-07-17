import { useEffect, useMemo, useState } from "react"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/Accordion/Accordion"
import { ErrorBoundaryComponent } from "@/components/ui/ErrorBoundaryComponent/ErrorBoundaryComponent"
import { Button } from "@/components/ui/Button/Button"
import {
  faBarsStaggered,
  faPaperPlane,
} from "@fortawesome/free-solid-svg-icons"
import TopicRender from "@/components/DocTools/AggService/TopicRender"
import OverallMetaAnalysis from "@/components/DocTools/AggService/OverallMetaAnalysis"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  ActionFunctionArgs,
  json,
  LoaderFunction,
  LoaderFunctionArgs,
  redirect,
} from "@remix-run/node"
import { requiredUserSession } from "@/data/auth/session.server"
import { useFetcher, useLoaderData, useNavigate } from "@remix-run/react"
import { useCloseSidebar, useHistorybar, useLoadingState } from "@/store/layout"
import {
  createMetadataSearchFilters,
  fetchMetadataFilters,
} from "@/data/searchsi/searchSi.server"
import { fetchSessionDocs } from "@/data/litepaper/litepaper.server"
import { createMetadataSearchFilters_BEStructure } from "@/utils/metadataFilters"
import { DBLoadState } from "@/components/Shared/LoadFromDB/type"
import {
  deleteAggHistory,
  deleteAggSingleHistory,
  deletePrivateDocument,
  fetchAggHistory,
  getAggInput,
  ProcessDocument,
  UpdatePrivateLibrary,
  UploadPrivateDocument,
} from "@/data/documenttools/documenttools.server"
import useAggServiceStore, {
  AggregatorData,
} from "@/store/AggregatorService/aggregatorservice"
import { FilterData } from "@/components/Shared/Filters/types"
import { checkEmptyFields } from "@/utils/documentTools/adminPanel/aggservice"
import { useFiltersStore } from "@/store/filters"
import { Document } from "@/components/LitePaper/types"
import useLocalDBFilesStore from "@/store/localDB"
import DocumentSelectionV2 from "@/components/Shared/DocumentSelection/DocumentSelectionV2"
import { Bubble } from "@/components/Layout/Historybar/HistoryBubble/type"
import Historybar from "@/components/Layout/Historybar/Historybar"
import Footer from "@/components/Layout/Footer/Footer"
import HistoryButton from "@/components/Layout/HistoryButton/HistoryButton"
import { Toaster } from "@/components/ui/Toast/Toaster"
import { useToast } from "@/hooks/useToast"
import { FileTypes } from "@/components/Shared/DocumentSelection/type"
import { handleFileType } from "@/utils/documentTools"
import UseCaseTitle from "@/components/Shared/UseCaseTitle/UseCaseTitle"
import { clsx } from "clsx"

const AggService = () => {
  const { setLoadingState } = useLoadingState()
  const { toast } = useToast()
  const {
    data,
    setDisplay,
    setResults,
    setData,
    setAggId,
    resetDisplay,
    resetData,
  } = useAggServiceStore()
  const { setUpdatedFilterData, updatedFilterData, setInitialFiltersData } =
    useFiltersStore()
  const fetcher = useFetcher<{
    receivedPersonalFiles: Document[]
    receivedDBFiles: Document[]
    status: string
    filters: FilterData
    history: Bubble[]
  }>()
  const loaderData = useLoaderData<typeof loader>()
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
    setAllDocs,
  } = useLocalDBFilesStore()

  const [filteredDBFiles, setFilteredDBFiles] = useState<Document[]>([])
  const [filteredPrivateFiles, setFilteredPrivateFiles] = useState<Document[]>(
    []
  )
  const [history, setHistory] = useState<Bubble[]>()
  const [fileTypes, setFileTypes] = useState<FileTypes>("openSi")
  const navigate = useNavigate()
  const setSidebarClose = useCloseSidebar.getState().setClose
  const { setIsHistorybarOpen } = useHistorybar()
  const close = useCloseSidebar((state) => state.close)

  const selectedDBFiles = useMemo(
    () => allDocs.opensi_documents || [],
    [allDocs.opensi_documents]
  )
  const selectedPrivateFiles = useMemo(
    () => allDocs.private_documents || [],
    [allDocs.private_documents]
  )

  useEffect(() => {
    if (fetcher.data?.filters) {
      setUpdatedFilterData(fetcher.data?.filters)
      setInitialFiltersData(fetcher.data?.filters)
      setLoadingState(false)
    }
  }, [fetcher.data?.filters])

  useEffect(() => {
    if (fetcher.data) {
      const { receivedPersonalFiles, receivedDBFiles, status, history } =
        fetcher.data
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
      } else if (status && status === "error deleting history") {
        toast({
          title: `Failed to Delete Aggregation History`,
          description: ``,
          variant: "error",
        })
      }

      if (history) {
        setHistory(history)
      }
    }
  }, [fetcher.data])

  useEffect(() => {
    if (loaderData && loaderData.aggForm) {
      const newForm: AggregatorData = {
        type: "Aggregation",
        topics: loaderData.aggForm.form.form.topics.map((topic, index) => ({
          id: `${index + 1}`,
          title: topic.title,
          prompt: topic.prompt,
          meta_analysis: topic.meta_analysis,
        })),
        meta_analysis: loaderData.aggForm.form.form.meta_analysis,
      }
      const newDocs: any = {
        private_documents: loaderData.aggForm.form.form.private_documents,
        opensi_documents: loaderData.aggForm.form.form.opensi_documents,
      }

      setAllDocs(newDocs)
      setData(newForm)
    }
  }, [loaderData.aggForm])

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

  useEffect(() => {
    const type = handleFileType(selectedDBFiles, selectedPrivateFiles)
    setFileTypes(type)
  }, [selectedDBFiles, selectedPrivateFiles])

  const handleShowFilters = () => {
    setLoadingState(true)
    fetcher.submit(null, {
      method: "post",
      action: `?intent=getFilters`,
    })
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

  const handleHistoryButton = () => {
    if (!close) {
      setSidebarClose(false)
    }
    setIsHistorybarOpen(true)
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

  const selectionHandlers = {
    shouldLoadDocs: setNeedLoadState,
    onFileUpload: handleFileUpload,
    onCancelUpload: handleCancelUpload,
    filters: updatedFilterData,
    handleShowFilters,
  }
  const onSubmitAnalysis = () => {
    setResults([])
    setDisplay({
      documents: [],
      meta_analysis: {
        topic_meta_analysis: [],
        overall_meta_analysis: {
          uuid: "",
          title: "",
          prompt: "",
        },
      },
    })
    const urlParams = new URLSearchParams(window.location.search)
    const aggId = urlParams.get("aggId")
    if (aggId) {
      navigate(`/documentTools/aggService/response?aggId=${aggId}`)
    } else {
      navigate(`/documentTools/aggService/response`)
    }
  }

  return (
    <>
      <Toaster />
      <UseCaseTitle
        title="Aggregator Service"
        subtitle="Cross-document synthesis in a flash"
      />
      <Accordion type="multiple" className="w-full" variant="expandLastOnly">
        <AccordionItem value={`1`} className="border-none">
          <AccordionTrigger
            showRouterDocs={false}
            showMetadataFilters={false}
            className="text-xlbold border-solid border-b border-secondary border-opacity-60 dark:border-third-dark pb-5"
          >
            Required inputs steps
          </AccordionTrigger>
          <AccordionContent>
            <div className="w-full grid grid-cols-1 gap-8 pt-8">
              <div>
                <p className="text-base border-solid border-b border-secondary border-opacity-60 dark:border-third-dark pt-3 pb-4 justify-left">
                  Document Selection
                </p>
                <div className="mt-8">
                  <DocumentSelectionV2
                    fileTypes={fileTypes}
                    openSiDocs={filteredDBFiles}
                    privateDocs={filteredPrivateFiles}
                    selectedOpenSiDocs={selectedDBFiles}
                    selectedPrivateDocs={selectedPrivateFiles}
                    {...selectionHandlers}
                    isSelectedDocsScrollable
                  />
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <h3 className="text-xlbold mt-8 border-b border-secondary border-opacity-60 pb-4 mb-10 dark:border-third-dark ">
        {" "}
        Topics
      </h3>
      <div className="flex gap-4 items-center mb-4">
        <FontAwesomeIcon icon={faBarsStaggered} />
        <h4 className="text-xlbold">Global Results</h4>
      </div>
      <TopicRender />

      <OverallMetaAnalysis />
      <div className="w-full flex justify-end mb-[100px]">
        <Button
          variant="default"
          icon={faPaperPlane}
          className="w-fit mt-10 text-base font-normal "
          disabled={checkEmptyFields(data, allDocs)}
          onClick={() => {
            onSubmitAnalysis()
          }}
        >
          run analysis
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

  let aggForm = null
  if (aggId) {
    aggForm = await getAggInput(token, aggId)
  }

  if (intent === "loadDB") {
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
      aggForm: aggForm,
    })
  } else if (intent === "history") {
    const history = await fetchAggHistory(token)

    let transformedBubbles

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

    return json({
      history: transformedBubbles,
      receivedPersonalFiles: [],
      receivedDBFiles: [],
      status: null,
      filters: null,
      aggForm: aggForm,
    })
  } else {
    return json({
      receivedPersonalFiles: [],
      receivedDBFiles: [],
      status: null,
      filters: null,
      history: [],
      aggForm: aggForm,
    })
  }
}

export async function action({ request }: ActionFunctionArgs) {
  const token = await requiredUserSession(request)
  const formData = await request.formData()
  const url = new URL(request.url)
  const params = new URLSearchParams(url.search)
  const intent = url.searchParams.get("intent")
  const privateDocId = params.get("privateDocId")
  const dataParam = new URLSearchParams({
    data: formData.get("data") as string,
  })
  const historyIntent = formData.get("historyIntent") as string
  const aggId = formData.get("bubble_id") as string

  if (privateDocId) {
    await deletePrivateDocument(token, privateDocId)
    const privateLibrary = await UpdatePrivateLibrary(token, dataParam)
    return json({ privateLibrary: privateLibrary.personal_files })
  }
  if (intent === "processDocument") {
    const processDocument = await ProcessDocument(token, formData)
    return json({ response: processDocument })
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
  } else {
    return json({
      receivedPersonalFiles: [],
      receivedDBFiles: [],
      status: null,
      filters: null,
    })
  }
}

export function ErrorBoundary() {
  return <ErrorBoundaryComponent isMainRoute={false} />
}
