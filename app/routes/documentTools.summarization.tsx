import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/Accordion/Accordion"
import { Button } from "@/components/ui/Button/Button"
import { FileUploadState } from "@/components/Shared/UploadFile/types"
import { faPaperPlane } from "@fortawesome/free-regular-svg-icons"
import { motion } from "framer-motion"

import { Outlet, redirect, useFetcher, useSubmit } from "@remix-run/react"
import { useEffect, useMemo, useState } from "react"

import SummarizationSettings from "@/components/DocTools/Summarization/SummarizationSettings"
import {
  CustomSubsection,
  ISummarizationSettings,
} from "@/components/DocTools/Summarization/types"
import CustomSubsections from "@/components/DocTools/Summarization/CustomSubsections"
import {
  ActionFunctionArgs,
  json,
  LoaderFunction,
  LoaderFunctionArgs,
} from "@remix-run/node"
import {
  createDocumentSummarization,
  deletePrivateDocument,
  deleteSummarizationHistory,
  deleteSummarizationSingleHistory,
  fetchSessionDocs,
  fetchSummarizationHistory,
  UpdatePrivateLibrary,
  UploadPrivateDocument,
} from "@/data/documenttools/documenttools.server"
import { requiredUserSession } from "@/data/auth/session.server"
import { ErrorBoundaryComponent } from "@/components/ui/ErrorBoundaryComponent/ErrorBoundaryComponent"
import {
  summarizationHeader,
  summarizationSubtitle,
  summarizationTitle,
} from "@/textData"
import Historybar from "@/components/Layout/Historybar/Historybar"
import { useSummarizationStore } from "@/store/documenttools"
import Footer from "@/components/Layout/Footer/Footer"
import HistoryButton from "@/components/Layout/HistoryButton/HistoryButton"
import { useCloseSidebar, useHistorybar, useLoadingState } from "@/store/layout"
import { Bubble } from "@/components/Layout/Historybar/HistoryBubble/type"
import DocumentSelectionV2 from "@/components/Shared/DocumentSelection/DocumentSelectionV2"
import useLocalDBFilesStore from "@/store/localDB"
import { DBLoadState } from "@/components/Shared/LoadFromDB/type"
import { useFiltersStore } from "@/store/filters"
import {
  createMetadataSearchFilters,
  fetchMetadataFilters,
} from "@/data/searchsi/searchSi.server"
import { createMetadataSearchFilters_BEStructure } from "@/utils/metadataFilters"
import { FilterData } from "@/components/Shared/Filters/types"
import { Document } from "@/components/LitePaper/types"
import { LoadingComponent } from "@/components/Layout/LoadingComponent/LoadingComponent"
import LoadingStatus from "@/components/Shared/LoadingStatus/LoadingStatus"
import { FileTypes } from "@/components/Shared/DocumentSelection/type"
import { handleFileType } from "@/utils/documentTools"
import UseCaseTitle from "@/components/Shared/UseCaseTitle/UseCaseTitle"
import { DocumentOption } from "@/components/ui/MultipleSelectorV2/types"
import { clsx } from "clsx"

export default function DocumentToolsSummarization() {
  const submit = useSubmit()

  const fetcher = useFetcher<{
    receivedPersonalFiles: Document[]
    receivedDBFiles: Document[]
    status: string
    filters: FilterData
  }>()

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
    removeAllDocuments,
  } = useLocalDBFilesStore()
  const { setLoadingState } = useLoadingState()
  const [fileTypes, setFileTypes] = useState<FileTypes>("openSi")
  const { setUpdatedFilterData, updatedFilterData, setInitialFiltersData } =
    useFiltersStore()

  const {
    isInputCollapsed,
    setIsInputCollapsed,
    isSummarizationResponseLoading,
    setIsSummarizationResponseLoading,
  } = useSummarizationStore()

  const [filteredDBFiles, setFilteredDBFiles] = useState<Document[]>([])
  const [filteredPrivateFiles, setFilteredPrivateFiles] = useState<Document[]>(
    []
  )
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

  const [uploadState, setUploadState] = useState<FileUploadState>(
    FileUploadState.INITIAL
  )
  const [settings, setSettings] = useState<ISummarizationSettings>({
    lang: "English",
    selectedSummary: "Auto summary",
    writing_style: "",
  })
  const [customSubsections, setCustomSubsections] = useState<
    CustomSubsection[]
  >([{ name: "", description: "" }])

  const history =
    fetcher.data && fetcher.data.history && fetcher.data.history.length > 0
      ? fetcher.data.history
      : null

  const handleSettingsChange = (
    newSettings: Partial<ISummarizationSettings>
  ) => {
    setSettings((prevSettings) => {
      const updatedSettings = { ...prevSettings, ...newSettings }

      // If selectedSummary is "Custom subsections", replace it with the customSubsections array
      if (updatedSettings.selectedSummary === "Custom subsections") {
        updatedSettings.selectedSummary = customSubsections
      }

      return updatedSettings
    })
  }
  const handleCustomSubsectionsChange = (
    newSubsections: CustomSubsection[]
  ) => {
    setCustomSubsections(newSubsections)
    // Update the selectedSummary in settings with the new customSubsections
    setSettings((prevSettings) => ({
      ...prevSettings,
      selectedSummary: newSubsections,
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setUploadState(FileUploadState.UPLOADING)
    const formData = new FormData()
    const selectedFile = [...selectedDBFiles, ...selectedPrivateFiles]
    formData.append(
      "db_file",
      `{"id": "${selectedFile[0].id}", "filename": "${selectedFile[0].filename}"}`
    )
    formData.append("lang", settings.lang)
    if (settings.selectedSummary !== "Auto summary") {
      formData.append("subsections", JSON.stringify(settings.selectedSummary))
    }
    formData.append("summary", [])
    formData.append("writing_style", settings.writing_style)

    submit(formData, {
      method: "post",
      encType: "multipart/form-data",
      action: `/documentTools/summarization`,
    })
    setSettings((prevSettings) => ({
      ...prevSettings,
      writing_style: "",
    }))
    setIsSummarizationResponseLoading(true)
    setIsInputCollapsed(0)
  }

  const handleHistoryButton = () => {
    if (!close) {
      setSidebarClose(false)
    }
    setIsHistorybarOpen(true)
    fetcher.load(`/documentTools/summarization?intent=history`)
  }

  const isCustomSubsections = Array.isArray(settings.selectedSummary)

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

      fetcher.load(`/documentTools/summarization?${queryParams.toString()}`)
      setNeedLoadState(false, false)
    }
  }, [dbLoad, privateLoad])

  const onFileUpload = (acceptedFiles: DocumentOption[]) => {
    removeAllDocuments()
    handleFileUpload(acceptedFiles)
  }

  useEffect(() => {
    const type = handleFileType(selectedDBFiles, selectedPrivateFiles)
    setFileTypes(type)
  }, [selectedDBFiles, selectedPrivateFiles])

  const selectionHandlers = {
    shouldLoadDocs: setNeedLoadState,
    onFileUpload,
    onCancelUpload: handleCancelUpload,
    filters: updatedFilterData,
    handleShowFilters,
  }

  return (
    <>
      <UseCaseTitle
        title={summarizationTitle}
        subtitle={summarizationSubtitle}
        description={summarizationHeader}
      />
      <Accordion
        type="single"
        collapsible
        className="w-full"
        value={`${isInputCollapsed}`}
        defaultValue="1"
        onValueChange={(value) => setIsInputCollapsed(Number(value))}
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
                  Document Selection
                </p>
                <div className="w-full pt-8">
                  <DocumentSelectionV2
                    fileTypes={fileTypes}
                    openSiDocs={filteredDBFiles}
                    privateDocs={filteredPrivateFiles}
                    selectedOpenSiDocs={selectedDBFiles}
                    selectedPrivateDocs={selectedPrivateFiles}
                    singleSelection={true}
                    {...selectionHandlers}
                  />
                </div>
              </div>
              <div className="w-full grid grid-cols gap-4">
                <div>
                  <p className="text-base border-b border-secondary border-opacity-60 dark:border-third-dark justify-left pb-3">
                    Summarization settings
                  </p>

                  <SummarizationSettings
                    settings={settings}
                    onSettingsChange={handleSettingsChange}
                  />
                </div>
              </div>
            </div>
            {isCustomSubsections && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.7, ease: "easeOut" }}
              >
                <div className="mt-8">
                  <p className="text-base border-solid border-b border-secondary border-opacity-60 dark:border-third-dark pt-3 pb-3 justify-left">
                    Custom Subsections
                  </p>
                  <CustomSubsections
                    subsections={customSubsections}
                    onSubsectionsChange={handleCustomSubsectionsChange}
                  />
                </div>
              </motion.div>
            )}
            <div className="w-full flex justify-end">
              {" "}
              <Button
                variant="default"
                icon={faPaperPlane}
                disabled={
                  (selectedDBFiles.length === 0 &&
                    selectedPrivateFiles.length === 0) ||
                  uploadState === FileUploadState.UPLOADING
                }
                className="w-[268px] mt-10 text-base font-normal "
                onClick={handleSubmit}
              >
                Generate summary
              </Button>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
      <Outlet context={{ setUploadState }} />
      {isSummarizationResponseLoading && (
        <div className="mt-8">
          <LoadingStatus statusMessage={{ body: "Summarizing document..." }} />
          <LoadingComponent />
        </div>
      )}

      <Historybar bubbles={history || []} variant={"summarization"} />
      <Footer hasBackground={false}>
        <HistoryButton
          handleHistoryClick={handleHistoryButton}
          className={clsx("right-4")}
        />
      </Footer>
    </>
  )
}

export const loader: LoaderFunction = async ({
  request,
}: LoaderFunctionArgs) => {
  const token = await requiredUserSession(request)

  const url = new URL(request.url)
  const params = new URLSearchParams(url.search)
  const intent = params.get("intent")

  if (intent === "history") {
    const history = await fetchSummarizationHistory(token)

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
    const response = await deleteSummarizationSingleHistory(token, sessionId)
    if (response) {
      return json({ deleteSingleHistory: response })
    }
  }

  if (method === "summarizationMethod") {
    const response = await deleteSummarizationHistory(token)
    if (response) {
      return redirect(`/documentTools/summarization`)
    } else {
      console.log("😭 History was not reset")
      return null
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

  const submitData = await createDocumentSummarization(token, formData)
  return redirect(
    `/documentTools/summarization/response?job_id=${submitData.job_id}`
  )
}

export function ErrorBoundary() {
  return <ErrorBoundaryComponent isMainRoute={false} />
}
