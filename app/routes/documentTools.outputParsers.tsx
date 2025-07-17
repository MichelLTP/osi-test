import InputFields from "@/components/DocTools/OutputParsers/InputFields"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/Accordion/Accordion"
import { Button } from "@/components/ui/Button/Button"
import { StyledCheckbox } from "@/components/ui/Checkbox/Checkbox"
import { Item } from "@/components/ui/Checkbox/types"
import { Label } from "@/components/ui/Label/Label"
import {
  deletePrivateDocument,
  fetchOutputParsersDocID,
  fetchOutputParsersFieldTypes,
  fetchSessionDocs,
  UpdatePrivateLibrary,
  UploadDocumentToolsOutputParsersFile,
  UploadPrivateDocument,
} from "@/data/documenttools/documenttools.server"
import { faPaperPlane } from "@fortawesome/free-solid-svg-icons"
import { useOutputParsersStore } from "@/store/outputParsers"
import {
  ActionFunctionArgs,
  LoaderFunction,
  LoaderFunctionArgs,
  redirect,
} from "@remix-run/node"
import {
  json,
  useFetcher,
  useLoaderData,
  useNavigate,
  useSubmit,
} from "@remix-run/react"
import { useCallback, useEffect, useMemo, useState } from "react"
import { requiredUserSession } from "@/data/auth/session.server"
import { IDocToolsResponseProps } from "@/components/DocTools/DocToolsResponse/type"
import { extractIds } from "@/utils/chatSi"
import {
  askDocumentToolsOutputParsers,
  processChatResponse,
} from "@/utils/sse/sseRender"
import { toast } from "@/hooks/useToast"
import DocToolsResponse from "@/components/DocTools/DocToolsResponse/DocToolsResponse"
import { ErrorBoundaryComponent } from "@/components/ui/ErrorBoundaryComponent/ErrorBoundaryComponent"
import { useDocumentQAStore } from "@/store/documenttools"
import { FileUploadState } from "@/components/Shared/UploadFile/types"
import { useLoadingState } from "@/store/layout"
import { FilterData } from "@/components/Shared/Filters/types"
import useLocalDBFilesStore from "@/store/localDB"
import { useFiltersStore } from "@/store/filters"
import { DBLoadState } from "@/components/Shared/LoadFromDB/type"
import DocumentSelectionV2 from "@/components/Shared/DocumentSelection/DocumentSelectionV2"
import { Document } from "@/components/LitePaper/types"
import {
  createMetadataSearchFilters,
  fetchMetadataFilters,
} from "@/data/searchsi/searchSi.server"
import { createMetadataSearchFilters_BEStructure } from "@/utils/metadataFilters"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Toaster } from "@/components/ui/Toast/Toaster"
import { FileTypes } from "@/components/Shared/DocumentSelection/type"
import { handleFileType } from "@/utils/documentTools"
import UseCaseTitle from "@/components/Shared/UseCaseTitle/UseCaseTitle"

export default function OutputParsers() {
  const [uploadState, setUploadState] = useState<FileUploadState>(
    FileUploadState.INITIAL
  )

  const [messages, setMessages] = useState<IDocToolsResponseProps[]>([])
  const [collapsed, setCollapsed] = useState<number>(1)
  const [title, setTitle] = useState<string[]>([])
  const [checkBoxItems, setcheckBoxItems] = useState<Item[]>(() => [
    {
      value: "Calculate averages for numeric dimensions",
      key: "calculate_means",
      checked: false,
    },
    {
      value: "Create your own visualizations",
      key: "calculate_visualizations",
      checked: false,
    },
    {
      value: "Calculate medians for numeric dimensions",
      key: "calculate_medians",
      checked: false,
    },
  ])
  const [fileTypes, setFileTypes] = useState<FileTypes>("none")

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
  } = useLocalDBFilesStore()

  const { setLoadingState } = useLoadingState()

  const { setUpdatedFilterData, updatedFilterData, setInitialFiltersData } =
    useFiltersStore()

  const [filteredDBFiles, setFilteredDBFiles] = useState<Document[]>([])
  const [filteredPrivateFiles, setFilteredPrivateFiles] = useState<Document[]>(
    []
  )

  const selectedDBFiles = useMemo(
    () => allDocs.opensi_documents || [],
    [allDocs.opensi_documents]
  )
  const selectedPrivateFiles = useMemo(
    () => allDocs.private_documents || [],
    [allDocs.private_documents]
  )

  const navigate = useNavigate()
  const submit = useSubmit()

  const { fields, setDocID, docID } = useOutputParsersStore()
  const { setIsFileUploaded } = useDocumentQAStore()

  const formattedFields = fields.map((field) => ({
    name: field.name.value,
    description: field.description.value,
    field_type: field.type.value,
  }))
  const isFieldsValid = fields.every(
    (field) =>
      field.name.value !== "" &&
      field.description.value !== "" &&
      field.type.value !== ""
  )

  const { fieldTypes, doc_id } = useLoaderData() as {
    fieldTypes: string[]
    doc_id: string[]
  }

  useEffect(() => {
    if (doc_id !== undefined) {
      setDocID(doc_id)
      setUploadState(FileUploadState.DONE)
      setIsFileUploaded(FileUploadState.DONE)
      setTimeout(() => setUploadState(FileUploadState.INITIAL), 5000)
      navigate(`/documentTools/OutputParsers`)
    }
  }, [doc_id])

  const handleProcessDocument = (): void => {
    const allFiles = [...selectedDBFiles, ...selectedPrivateFiles]
    setUploadState(FileUploadState.UPLOADING)
    setIsFileUploaded(FileUploadState.UPLOADING)
    setTitle((prev) => [...prev, `Extraction ${prev.length + 1}`])
    setMessages((prevMessages) => [
      ...prevMessages,
      {
        messages: [
          {
            message: JSON.stringify({
              type: "status",
              body: "Preparing parsing process...",
            }),
          },
        ],
        jobID: "",
        sessionID: "",
      },
    ])
    setCollapsed(0)
    const formData = new FormData()
    formData.append(
      "db_files",
      JSON.stringify(
        allFiles.map((f) => ({
          id: f.id,
          filename: f.filename,
        }))
      )
    )

    submit(formData, { method: "post", encType: "multipart/form-data" })
    toast({
      title: "Processing document",
      description: "Please wait while we process your document.",
    })
  }

  useEffect(() => {
    if (uploadState === FileUploadState.DONE) {
      handleSubmit()
    }
  }, [uploadState])

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

  const handleSubmit = async () => {
    try {
      const response = await askDocumentToolsOutputParsers({
        doc_ids: docID,
        fields: formattedFields,
        [checkBoxItems[0].key]: checkBoxItems[0].checked,
        [checkBoxItems[1].key]: checkBoxItems[1].checked,
        [checkBoxItems[2].key]: checkBoxItems[2].checked,
      })

      if (!response) return

      processChatResponse({
        response,
        onChunk: handleStream,
      })

      setcheckBoxItems((prev) =>
        prev.map((item) => ({ ...item, checked: false }))
      )
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
        title={"Output parsers"}
        subtitle={"Extract tables from documents"}
        description={`Structured output parsers allow you to levearge LLM's to get reliable output from a context in the way you specify. 
          If you upload multiple documents, they should be similar in nature so that they can be parsed across the same dimensions.`}
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
              <div>
                <p className="text-base border-solid border-b border-secondary border-opacity-60 dark:border-third-dark pt-3 pb-3 justify-left">
                  Output parsers settings
                </p>
                <ul className="flex gap-8 py-10 flex-wrap">
                  {checkBoxItems.map((item, index) => (
                    <li key={index} className="flex items-center space-x-2">
                      <StyledCheckbox
                        className="text-primary data-[state=checked]:bg-transparent"
                        checked={item.checked}
                        id={`item-${index}`}
                        onCheckedChange={() => {
                          const newItems = [...checkBoxItems]
                          newItems[index].checked = !item.checked
                          setcheckBoxItems(newItems)
                        }}
                      />
                      <Label
                        htmlFor={`item-${index}`}
                        className="cursor-pointer"
                      >
                        {item.value}
                      </Label>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="mt-5">
              <p className="text-base border-solid border-b border-secondary border-opacity-60 dark:border-third-dark pt-3 pb-3 justify-left">
                Step 3
              </p>
              <InputFields fieldTypes={fieldTypes} />
            </div>
            <div className="flex justify-end mt-10">
              <Button
                className="w-full sm:w-auto space-x-2"
                type="submit"
                disabled={
                  (selectedDBFiles.length === 0 &&
                    selectedPrivateFiles.length === 0) ||
                  uploadState === FileUploadState.UPLOADING ||
                  !isFieldsValid
                }
                onClick={handleProcessDocument}
              >
                <FontAwesomeIcon icon={faPaperPlane} />
                <span>Run model</span>
              </Button>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
      <DocToolsResponse promptResponse={messages} prompt={title} />
      <Toaster />
    </>
  )
}

let fieldTypes: any = null

export const loader: LoaderFunction = async ({
  request,
}: LoaderFunctionArgs) => {
  const token = await requiredUserSession(request)

  const url = new URL(request.url)
  const params = new URLSearchParams(url.search)

  const job_id = params.get("job_id")
  const intent = params.get("intent")

  if (!fieldTypes) {
    fieldTypes = await fetchOutputParsersFieldTypes(token)
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

    const status =
      first_response.personal_files.length === 0 &&
      first_response.db_files.length === 0
        ? "noFiles"
        : null

    return json({
      receivedPersonalFiles: transformedResponse.personal_files,
      receivedDBFiles: transformedResponse.db_files,
      status,
      filters: null,
      fieldTypes,
    })
  } else if (job_id) {
    const jobSearch = await fetchOutputParsersDocID(token, job_id)
    return json({ fieldTypes, doc_id: jobSearch?.response })
  } else {
    return json({
      receivedPersonalFiles: [],
      receivedDBFiles: [],
      status: null,
      filters: null,
      fieldTypes,
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
  const file = formData.get("db_files")
  const dataParam = new URLSearchParams({
    data: formData.get("data") as string,
  })

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

  if (!file) {
    return json({ error: "No file uploaded" }, { status: 400 })
  } else {
    const uploadFile = await UploadDocumentToolsOutputParsersFile(
      token,
      formData
    )
    return redirect(`?job_id=${uploadFile.job_id}`)
  }
}

export function ErrorBoundary() {
  return <ErrorBoundaryComponent isMainRoute={false} />
}
