import { useEffect, useState } from "react"
import { Label } from "@/components/ui/Label/Label"
import UploadCover from "@/components/DocTools/AdminPanel/Tabs/UploadCover/UploadCover"
import Sections from "@/components/DocTools/AdminPanel/Tabs/Sections/Sections"
import DocumentSources from "@/components/DocTools/AdminPanel/Tabs/DocumentSources/DocumentSources"
import Details from "@/components/DocTools/AdminPanel/Tabs/Details/Details"
import Podcast from "@/components/DocTools/AdminPanel/Tabs/Podcast/Podcast"
import {
  ContentState,
  useAdminPanelDiscoveryStore,
} from "@/store/AdminPanel/discovery"
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
  fetchAPDiscoveryTags,
  fetchLocalDBFiles,
  fetchLocalDBStories,
  fetchStoryData,
  updateDiscoveryStory,
} from "@/data/documenttools/documenttools.server"
import MultipleSelector from "@/components/ui/MultipleSelector/MultipleSelector"
import { convertToOptions_Modify } from "@/utils/documentTools/adminPanel/discovery"
import { Input } from "@/components/ui/Input/Input"
import { toast } from "@/hooks/useToast"
import { Toaster } from "@/components/ui/Toast/Toaster"
import Modal from "@/components/Shared/Modal/Modal"
import StoryDetail from "@/components/Shared/StoryDetail/StoryDetail"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/NewTabs/tabs"
import { Skeleton } from "@/components/ui/Skeleton/Skeleton"

interface OptionData {
  label: string
  value: string
}

interface DBStoriesData {
  id: string
  title: string
}

export default function ModifyDocument() {
  const [dbStories, setDBStories] = useState<OptionData[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [selectedStory, setSelectedStory] = useState<string | null>(null)
  const fetcher = useFetcher<{
    localDBStories?: DBStoriesData[]
    storyData?: ContentState
    message?: string
  }>()

  const [showPreview, setShowPreview] = useState<boolean>(false)

  const {
    id,
    title,
    duration_min,
    tags,
    image,
    sections,
    key_questions,
    documents,
    audios,
    sources,
    uploadImages,
    uploadDocuments,
    uploadAudios,
    setID,
    setTitle,
    setDurationMin,
    addTag,
    setSections,
    setKeyQuestions,
    setDocuments,
    setAudios,
    setSource,
    setHeaderImage,
  } = useAdminPanelDiscoveryStore()

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
  const [currentTabIndex, setCurrentTabIndex] = useState(tabs[0].id)

  const data = {
    id: id,
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

  const previewData = {
    id: id,
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

  const updateDiscoveryStory = (e: React.FormEvent) => {
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
  }

  useEffect(() => {
    if (dbStories?.length === 0) {
      fetcher.load(`/documentTools/adminPanel/modifyDiscovery?intent=dbStories`)
    }
  }, [])

  useEffect(() => {
    if (title.length !== 0) setTitle("")
  }, [selectedStory])

  useEffect(() => {
    if (fetcher.data && fetcher.data?.localDBStories?.data?.length > 0) {
      setDBStories(convertToOptions_Modify(fetcher.data.localDBStories?.data))
    } else if (
      fetcher.data?.storyData &&
      Object.keys(fetcher.data.storyData).length !== 0
    ) {
      setID(fetcher.data?.storyData?.id ?? "")
      setTitle(fetcher.data?.storyData?.title ?? "")
      setDurationMin(fetcher.data?.storyData?.duration_min ?? 0)
      setHeaderImage(fetcher.data?.storyData?.image)
      addTag(fetcher.data?.storyData?.tags ?? [])
      setSections(fetcher.data?.storyData?.sections ?? [])
      setKeyQuestions(fetcher.data?.storyData?.key_questions ?? [])
      setDocuments(() => fetcher.data?.storyData?.documents ?? [])
      setAudios(fetcher.data?.storyData?.audios ?? [])
      setSource(() => fetcher.data?.storyData?.sources ?? [])
    } else if (fetcher.data?.message) {
      setLoading(false)
      toast({
        title: `Update Discovery Story`,
        description: `Successfully update the Discovery Story`,
        variant: "success",
      })
    }
  }, [fetcher.data])

  // Add validation check for required fields
  const isFormValid = () => {
    return (
      title.trim() !== "" &&
      duration_min > 0 &&
      tags.length > 0 &&
      image &&
      Object.keys(image).length > 0
    )
  }

  const handleTabChange = (index: string) => {
    setCurrentTabIndex(index)
  }

  useEffect(() => {
    if (selectedStory && selectedStory.length > 0) {
      fetcher.load(
        `/documentTools/adminPanel/modifyDiscovery?id=${selectedStory[0]?.value}&intent=loadStory`
      )
    }
  }, [selectedStory])

  return (
    <>
      <h3 className="text-2xlbold mt-4">Required inputs steps</h3>

      <div className="w-full my-[60px] flex gap-4">
        <div className=" flex flex-col gap-2 w-1/2">
          <Label>Search Story</Label>
          <MultipleSelector
            maxSelected={1}
            options={dbStories}
            hidePlaceholderWhenSelected
            placeholder="Search for created stories"
            onChange={(value) => setSelectedStory(value)}
            value={selectedStory}
            className="bg-third dark:bg-secondary-dark dark:text-white"
            badgeClassName={
              "bg-[#97A6BB] dark:bg-[#7a8eaa] hover:shadow-md hover:bg-[#7a8eaa] dark:hover:bg-[#97A6BB] transition-colors cursor-pointer tracking-wide font-normal rounded-xs text-white capitalize"
            }
          />
        </div>

        <div className="w-1/2 flex flex-col gap-2">
          {title.length !== 0 ? (
            <>
              <Label>Story name*</Label>
              <Input
                value={title}
                className=" dark:bg-secondary-dark"
                onChange={(e) => setTitle(e.target.value)}
              ></Input>
            </>
          ) : (
            title.length === 0 &&
            selectedStory &&
            selectedStory?.length !== 0 && (
              <>
                <Label>Story name*</Label>
                <Skeleton className="h-[45px] w-full rounded-[8px]" />
              </>
            )
          )}
        </div>
      </div>
      {title.length !== 0 ? (
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
      ) : (
        title.length === 0 &&
        selectedStory &&
        selectedStory?.length !== 0 && <Skeleton className="h-[220px] w-full" />
      )}

      {title.length !== 0 && (
        <div className="flex justify-end gap-4">
          {showPreview && (
            <Modal
              title="Preview"
              icon={faPaperPlane}
              handleClose={() => {
                setShowPreview(false)
              }}
              size="big"
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
            onClick={(e) => updateDiscoveryStory(e)}
          >
            Update
          </Button>
        </div>
      )}
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
  const id = params.get("id")

  if (intent === "dbStories") {
    // Fetch local DB Stories
    const response = await fetchLocalDBStories(token)
    return json({
      localDBStories: response,
    })
  } else if (intent === "loadStory") {
    //Fetch local DB Story
    if (id) {
      const response = await fetchStoryData(token, id)
      return json({
        storyData: response.portraits,
      })
    } else {
      return json({ error: "Invalid story ID" })
    }
  } else if (intent === "loadDB") {
    // Fetch local DB files
    const response = await fetchLocalDBFiles(token)
    return json({ localDBFiles: response })
  } else if (intent === "tags") {
    const response = await fetchAPDiscoveryTags(token)
    return json({ tags: response })
  } else {
    return json({})
  }
}

export async function action({ request }: ActionFunctionArgs) {
  const token = await requiredUserSession(request)

  const formData = await request.formData()
  const dataString = formData.get("data") as string
  const parsedData = JSON.parse(dataString)
  const id = parsedData.id

  await updateDiscoveryStory(token, formData, id)
  return json({ message: "Story updated successfully" })
}

export function ErrorBoundary() {
  return <ErrorBoundaryComponent isMainRoute={false} />
}
