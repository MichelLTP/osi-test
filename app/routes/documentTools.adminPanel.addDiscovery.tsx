import { useEffect, useState } from "react"
import { Input } from "@/components/ui/Input/Input"
import { Label } from "@/components/ui/Label/Label"
import UploadCover from "@/components/DocTools/AdminPanel/Tabs/UploadCover/UploadCover"
import Sections from "@/components/DocTools/AdminPanel/Tabs/Sections/Sections"
import DocumentSources from "@/components/DocTools/AdminPanel/Tabs/DocumentSources/DocumentSources"
import Details from "@/components/DocTools/AdminPanel/Tabs/Details/Details"
import { Button } from "@/components/ui/Button/Button"
import { faPaperPlane } from "@fortawesome/free-solid-svg-icons"
import { useFetcher } from "@remix-run/react"
import { ErrorBoundaryComponent } from "@/components/ui/ErrorBoundaryComponent/ErrorBoundaryComponent"
import { requiredUserSession } from "@/data/auth/session.server"
import {
  ActionFunctionArgs,
  json,
  LoaderFunction,
  LoaderFunctionArgs,
} from "@remix-run/node"
import {
  createDiscoveryStory,
  fetchAPDiscoveryTags,
  fetchLocalDBFiles,
} from "@/data/documenttools/documenttools.server"
import { toast } from "@/hooks/useToast"
import { Toaster } from "@/components/ui/Toast/Toaster"
import StoryDetail from "@/components/Shared/StoryDetail/StoryDetail"
import { BACKEND_API_BASE_URL_HTTP } from "@/utils/envvars"
import { useAdminPanelDiscoveryStore } from "@/store/AdminPanel/discovery"
import Podcast from "@/components/DocTools/AdminPanel/Tabs/Podcast/Podcast"
import Modal from "@/components/Shared/Modal/Modal"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/NewTabs/tabs"

export default function AddDocument() {
  const [loading, setLoading] = useState<boolean>(false)
  const [showPreview, setShowPreview] = useState<boolean>(false)

  const fetcher = useFetcher<{
    message?: string
  }>()
  const {
    title,
    duration_min,
    tags,
    image,
    sections,
    key_questions,
    documents,
    audios,
    sources,
    setTitle,
    resetStore,
    uploadImages,
    uploadDocuments,
    uploadAudios,
  } = useAdminPanelDiscoveryStore()

  // Add validation check for required fields before submit
  const isFormValid = () => {
    return (
      title.trim() !== "" &&
      duration_min > 0 &&
      tags.length > 0 &&
      uploadImages.length > 0
    )
  }
  const tabs = [
    {
      id: "uploadCover",
      label: "Upload Cover",
      children: <UploadCover />,
    },
    {
      id: "sections",
      label: "Sections",
      children: <Sections title="Section" />,
    },
    {
      id: "keyQuestions",
      label: "Key Questions",
      children: <Sections title="Key Questions" />,
    },
    {
      id: "documentSources",
      label: "Document & Sources",
      children: <DocumentSources />,
    },
    {
      id: "details",
      label: "Details",
      children: <Details />,
    },
    {
      id: "podcasts",
      label: "Podcasts",
      children: <Podcast />,
    },
  ]

  const data = {
    title: title,
    description: "Description",
    duration_min: duration_min,
    tags: tags,
    image: image,
    sections: sections,
    key_questions: key_questions,
    documents: documents,
    audios: audios,
    sources: sources,
  }

  const [currentTabIndex, setCurrentTabIndex] = useState(tabs[0].id)

  const previewData = {
    id: "1",
    title: title,
    description: "",
    duration_min: duration_min,
    tags: tags.map((tag) => tag.tag),
    image: image,
    sections: sections,
    key_questions: key_questions,
    documents: documents,
    audios: audios,
    sources: sources,
  }

  const submitDiscovery = (e: React.FormEvent) => {
    e.preventDefault()
    const formData = new FormData()
    formData.append("data", JSON.stringify(data))
    for (const image of uploadImages) {
      if (image) formData.append("images", image)
    }
    for (const audio of uploadAudios) {
      if (audio) formData.append("audios", audio)
    }
    for (const document of uploadDocuments) {
      if (document) formData.append("documents", document)
    }

    fetcher.submit(formData, {
      method: "post",
      encType: "multipart/form-data",
    })
    setLoading(true)
    resetStore()
  }

  useEffect(() => {
    if (fetcher.data?.message) {
      setLoading(false)
      toast({
        title: `Discovery Story Created`,
        description: `Successfully created the Discovery Story`,
        variant: "success",
      })
    }
  }, [fetcher.data])

  const handleTabChange = (index: string) => {
    setCurrentTabIndex(index)
  }

  return (
    <>
      <h3 className="text-2xlbold mt-4">Required inputs steps</h3>
      <p className="italic text-gray-500">* Please fill all required field</p>
      <div className="w-full my-[60px] flex flex-col gap-2">
        <Label>Story name*</Label>
        <Input
          className="w-full dark:bg-secondary-dark md:w-1/2 "
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
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
      </Tabs>

      <div className="flex justify-end gap-4">
        {showPreview && (
          <Modal
            title="Preview"
            icon={faPaperPlane}
            handleClose={() => {
              setShowPreview(false)
            }}
          >
            <StoryDetail data={previewData} />
          </Modal>
        )}
        <Toaster />
        <Button
          variant="outline"
          icon={faPaperPlane}
          className="mt-4"
          onClick={() => setShowPreview(true)}
        >
          Preview
        </Button>
        <Button
          className="mt-4"
          variant="default"
          icon={faPaperPlane}
          isLoading={loading}
          disabled={!isFormValid()}
          onClick={(e) => submitDiscovery(e)}
        >
          Submit
        </Button>
      </div>
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

  if (intent === "loadDB") {
    // Fetch local DB files
    const response = await fetchLocalDBFiles(token)
    return json({ localDBFiles: response })
  } else if (intent === "tags") {
    const response = await fetchAPDiscoveryTags(token)
    return json({ tags: response })
  } else {
    return json({ BACKEND_API_BASE_URL: BACKEND_API_BASE_URL_HTTP })
  }
}

export async function action({ request }: ActionFunctionArgs) {
  const token = await requiredUserSession(request)

  const formData = await request.formData()

  await createDiscoveryStory(token, formData)
  return json({ message: "Discovery story created" })
}

export function ErrorBoundary() {
  return <ErrorBoundaryComponent isMainRoute={false} />
}
