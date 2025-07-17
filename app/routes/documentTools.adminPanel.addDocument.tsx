import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/NewTabs/tabs"
import FileUploadProgress from "@/components/Shared/FileUploadProgress/FileUploadProgress"
import { FileUploadState } from "@/components/Shared/UploadFile/types"
import UploadFile from "@/components/Shared/UploadFile/UploadFile"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/Accordion/Accordion"
import { Button } from "@/components/ui/Button/Button"

import {
  fetchOutputParsersDocID,
  UploadDocumentToolsAdminPanelFile,
} from "@/data/documenttools/documenttools.server"
import { faPaperPlane } from "@fortawesome/free-regular-svg-icons"
import {
  ActionFunctionArgs,
  LoaderFunction,
  LoaderFunctionArgs,
  redirect,
} from "@remix-run/node"
import { json, useLoaderData } from "@remix-run/react"
import { useEffect, useState } from "react"
import Approve from "@/components/DocTools/AdminPanel/Tabs/Approve/Approve"
import DocumentPreview from "@/components/DocTools/AdminPanel/Tabs/DocumentPreview/DocumentPreview"
import MetadataInput from "@/components/DocTools/AdminPanel/Tabs/MetadataInput/MetadataInput"
import Nodes from "@/components/DocTools/AdminPanel/Tabs/Nodes/Nodes"
import SummaryPreview from "@/components/DocTools/AdminPanel/Tabs/SummaryPreview/SummaryPreview"
import TopInsightPreview from "@/components/DocTools/AdminPanel/Tabs/TopInsightPreview/TopInsightPreview"
import { requiredUserSession } from "@/data/auth/session.server"
import { ErrorBoundaryComponent } from "@/components/ui/ErrorBoundaryComponent/ErrorBoundaryComponent"

export default function AddDocument() {
  const [uploadState, setUploadState] = useState<FileUploadState>(
    FileUploadState.INITIAL
  )
  const [collapsed, setCollapsed] = useState<number>(1)
  const [files, setFiles] = useState<File[] | string[]>([])

  const { doc_id } = useLoaderData() as { doc_id: string }

  const tabs = [
    {
      id: "documentPreview",
      label: "Document Preview",
      children: <DocumentPreview />,
    },
    {
      id: "metadataInput",
      label: "Metadata Input",
      children: <MetadataInput />,
    },
    {
      id: "summaryPreview",
      label: "Summary Preview",
      children: <SummaryPreview />,
    },
    {
      id: "topInsightsPreview",
      label: "Top Insights Preview",
      children: <TopInsightPreview />,
    },
    {
      id: "nodes",
      label: "Nodes",
      children: <Nodes />,
    },
    {
      id: "approve",
      label: "Approve",
      children: <Approve />,
    },
  ]

  const [currentTabIndex, setCurrentTabIndex] = useState(tabs[0].id)

  useEffect(() => {
    if (doc_id !== undefined) {
      setUploadState(FileUploadState.DONE)
      setTimeout(() => setUploadState(FileUploadState.INITIAL), 5000)
    }
  }, [doc_id])

  const onUpload = (acceptedFiles: File[] | string[]) => {
    //acceptedFiles.forEach((file) => uploadFile(file));
    setFiles(acceptedFiles)
  }

  const onCancelUpload = (file: File) => {
    const newFileControllers = files.filter((c) => c.name !== file.name)
    setFiles(newFileControllers)
    setUploadState(FileUploadState.INITIAL)
  }

  const handleTabChange = (tabId: string) => {
    setCurrentTabIndex(tabId)
  }

  return (
    <>
      <Accordion
        type="single"
        collapsible
        className="w-full"
        value={`${collapsed}`}
        defaultValue="1"
        onValueChange={(value) => setCollapsed(Number(value))}
      >
        <AccordionItem value={"1"}>
          <AccordionTrigger
            showRouterDocs={false}
            showMetadataFilters={false}
            className="text-xlbold"
          >
            Required inputs steps
          </AccordionTrigger>
          <AccordionContent>
            <div className="w-full grid grid-cols-1 gap-y-20">
              <div>
                <p className="text-base border-solid border-b border-secondary dark:border-third-dark pt-3 pb-3 justify-left">
                  Upload file
                </p>
                <div className="flex flex-col md:flex-row md:items-center md:gap-10">
                  <div className="md:grow md:max-w-[50%] pt-8">
                    <UploadFile
                      onUpload={onUpload}
                      state={uploadState}
                      acceptedFileTypes="documents"
                    />
                    <FileUploadProgress
                      acceptedFiles={files}
                      onCancelUpload={onCancelUpload}
                      loading={uploadState === FileUploadState.UPLOADING}
                    />
                  </div>
                  <Button
                    className="w-full sm:w-auto"
                    icon={faPaperPlane}
                    type="submit"
                  >
                    Process
                  </Button>
                </div>
              </div>
              <Tabs
                value={String(currentTabIndex)}
                onValueChange={(value) => handleTabChange(value)}
              >
                <TabsList
                  currentValue={currentTabIndex}
                  onValueChange={(value) => handleTabChange(value)}
                >
                  {tabs.map((tab) => (
                    <TabsTrigger key={tab.id} value={tab.id}>
                      {tab.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
                {tabs.map((tab) => (
                  <TabsContent key={tab.id} value={tab.id}>
                    {tab.children}
                  </TabsContent>
                ))}
              </Tabs>{" "}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </>
  )
}

export const loader: LoaderFunction = async ({
  request,
}: LoaderFunctionArgs) => {
  const token = await requiredUserSession(request)

  const url = new URL(request.url)
  const params = new URLSearchParams(url.search)

  const job_id = params.get("job_id")
  if (job_id) {
    const response = await fetchOutputParsersDocID(token, job_id)
    return json({ doc_id: response.doc_id })
  } else {
    return json({})
  }
}

export async function action({ request }: ActionFunctionArgs) {
  const token = await requiredUserSession(request)
  const formData = await request.formData()
  const file = formData.get("file") as File | null | string

  if (!file) {
    return json({ error: "No file uploaded" }, { status: 400 })
  }

  const uploadFile = await UploadDocumentToolsAdminPanelFile(token, formData)

  console.log("uploadFile", uploadFile)
  return redirect(`?job_id=${uploadFile.job_id}`)
}

export function ErrorBoundary() {
  return <ErrorBoundaryComponent isMainRoute={false} />
}
