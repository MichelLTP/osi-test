import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../../ui/Accordion/Accordion"

import { SearchSiResultProps } from "../type"

import React, { useEffect, useState } from "react"
import SemanticSearchAbout from "../SemanticSearchAbout/SemanticSearchAbout"
import SocialButtons from "../../Layout/SocialButtons/SocialButtons"
import PdfViewer from "../../ui/PdfViewer/PdfViewer"
import {
  faBookmark,
  faComment,
  faListCheck,
  faMagnifyingGlass,
} from "@fortawesome/free-solid-svg-icons"
import { useFiltersStore } from "@/store/filters"
import { useFetcher, useNavigate, useSubmit } from "@remix-run/react"
import { toast } from "@/hooks/useToast"
import DocumentActions from "@/components/Shared/DocumentActions/DocumentActions"
import useLocalDBFilesStore from "@/store/localDB"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/NewTabs/tabs"
import { MarkdownRenderer } from "@/components/Shared/MarkdownRender/MarkdownRender"
import { useRouterID } from "@/store/chatsi"
import AddToSpaceModal from "../AddToSpaceModal/AddToSpaceModal"
import { useSearchMethod } from "@/store/searchsi"
import AudioPlayer from "@/components/Discovery/AudioPlayer"

const SearchSiResult = ({
  response,
  pdfUrl,
  onExpandChange,
}: SearchSiResultProps) => {
  const [clipboardText, setClipboardText] = useState<string>("")
  const [audioURL, setaudioURL] = useState<string>("")

  const {
    setFilters,
    setIsFiltersSelected,
    setPreventFiltersReset,
    emptyFilters,
  } = useFiltersStore()
  const { setPreventDocsReset, setAllDocs } = useLocalDBFilesStore()
  const { setLoadingSearchSI } = useSearchMethod()

  const navigate = useNavigate()
  const fromSources = location?.search.includes("source_id")
  const currentPathname = location.pathname
  const submit = useSubmit()
  const fetcher = useFetcher<{
    response?: string
  }>()

  const { setRouterID } = useRouterID()
  const chatDocFilters = {
    ...emptyFilters,
    document_title: [response.metadata.filtered_metadata.document_title],
  }
  const extractTextContent = (children: React.ReactNode): string => {
    if (typeof children === "string") {
      return children
    }
    if (React.isValidElement(children)) {
      return React.Children.toArray(children.props.children).join("")
    }
    return ""
  }
  const tabs = [
    {
      label: "Summary",
      children: (
        <div>
          {audioURL && (
            <div className="w-full flex justify-end mb-4 md:mb-0">
              {" "}
              <AudioPlayer url={audioURL} />
            </div>
          )}

          <MarkdownRenderer
            value={extractTextContent(response?.metadata?.summary)}
          />
        </div>
      ),
      id: "summary",
    },
    {
      label: "Top insights",
      children: (
        <div>
          {audioURL && (
            <div className="w-full flex justify-end mb-4 md:mb-0">
              <AudioPlayer url={audioURL} />
            </div>
          )}
          <MarkdownRenderer
            value={extractTextContent(response?.metadata?.top_insights)}
          />
        </div>
      ),
      id: "top_insights",
    },
    {
      label: "About",
      children: (
        <SemanticSearchAbout
          scoreRender={
            !currentPathname.includes("metadataSearch") && !fromSources
          }
          response={response}
          setClipboardText={setClipboardText}
        />
      ),
      id: "about",
    },
  ]
  const [currentTabIndex, setCurrentTabIndex] = useState(tabs[0].id)
  const [showAddToSpaceModal, setShowAddToSpaceModal] = useState(false)

  const actionsDocumentData = [
    {
      icon: faBookmark,
      tooltiptext: "Add to Space",
      onClick: () => setShowAddToSpaceModal(true),
    },
    {
      icon: faComment,
      tooltiptext: "Chat with document",
      onClick: () => {
        setPreventFiltersReset(true)
        setFilters(chatDocFilters)
        navigate("/chatSi")
        setRouterID("docs")
        toast({
          title: `${chatDocFilters.document_title}`,
          description: `Document added to filters`,
          variant: "success",
        })
        setIsFiltersSelected(true)
      },
    },
    {
      icon: faMagnifyingGlass,
      tooltiptext: "Find related documents",
      onClick: () => {
        handleRelatedDocument()
      },
    },
    {
      icon: faListCheck,
      tooltiptext: "Create custom summary",
      onClick: () => {
        setPreventDocsReset(true)
        const newDocs: any = {
          private_documents: [],
          opensi_documents: [
            {
              id: response.doc_id,
              filename: response.metadata.filtered_metadata.document_title,
            },
          ],
        }
        setAllDocs(newDocs)
        navigate("/documentTools/summarization")
      },
    },
  ]

  const handleRelatedDocument = () => {
    setLoadingSearchSI(true)
    const formData = new FormData()
    formData.append("data", JSON.stringify(response))

    submit(formData, {
      method: "post",
      encType: "multipart/form-data",
      action: "/searchSi/semanticSearch?intent=relatedDocuments",
    })
  }

  const handleRelatedAudio = () => {
    if (currentTabIndex !== "about")
      fetcher.load(
        `/searchSi/semanticSearch/response?audio_id=${response.doc_id}/${currentTabIndex}`
      )
  }
  const getSimilarityLabel = (score: number) => {
    return score >= 0.9
      ? { label: "High", color: "text-success" }
      : score >= 0.8
        ? { label: "Medium", color: "text-warning" }
        : { label: "Low", color: "text-primary" }
  }
  const { label, color } = getSimilarityLabel(response.score)

  const handleTabChange = (index: string) => {
    setCurrentTabIndex(index)

    if (index !== "about") {
      fetcher.load(
        `/searchSi/semanticSearch/response?audio_id=${response.doc_id}/${index}`
      )
    }
  }

  useEffect(() => {
    fetcher.data && setaudioURL(fetcher.data.audio)
  }, [fetcher.data])

  return (
    <div className="flex flew-row w-full">
      <AddToSpaceModal
        open={showAddToSpaceModal}
        onClose={() => setShowAddToSpaceModal(false)}
        documentTitle={response.metadata.filtered_metadata.document_title}
        documentId={response.doc_id}
      />
      <Accordion
        type="single"
        collapsible
        className="w-full"
        onExpandChange={(item) => {
          handleRelatedAudio()
          if (item !== "") onExpandChange?.(response.doc_id)
        }}
      >
        <AccordionItem value="item-1">
          <AccordionTrigger>
            <div className="flex flex-col items-start mr-8">
              <h3 className="text-xlbold sm:text-2xlbold text-left">
                {response.metadata.filtered_metadata.document_title}
              </h3>
              <div className="text-sm text-left text-secondary/85 dark:text-third/75">
                {response.metadata.doc_desc && (
                  <p className="line-clamp-1">{response.metadata.doc_desc}</p>
                )}
                <span>
                  {response.metadata.filtered_metadata.publisher_name} -{" "}
                  {response.metadata.pub_date.split("T")[0]}
                </span>
              </div>
              {!currentPathname.includes("metadataSearch") && !fromSources && (
                <span className={`text-xs ${color}`}>{label}</span>
              )}
            </div>
          </AccordionTrigger>

          <AccordionContent>
            <div className="flex flex-col lg:flex-row lg:gap-8">
              <div className="relative w-full flex flex-col justify-between">
                <Tabs
                  value={String(currentTabIndex)}
                  onValueChange={(value) => handleTabChange(value)}
                >
                  <TabsList
                    actionIcons={<DocumentActions data={actionsDocumentData} />}
                    currentValue={currentTabIndex}
                    onValueChange={(value) => handleTabChange(value)}
                    variant="result"
                  >
                    {tabs.map((tab) => (
                      <TabsTrigger key={tab.id} value={tab.id} variant="result">
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
                <div className={"hidden md:flex justify-end"}>
                  <SocialButtons
                    clipboardText={clipboardText}
                    response={response}
                  />
                </div>
              </div>
              <div className="w-full lg:max-w-[315px] mt-[54px]">
                <PdfViewer pdfUrl={pdfUrl} />
              </div>
            </div>
            <div className={"flex md:hidden justify-end"}>
              <SocialButtons
                clipboardText={clipboardText}
                response={response}
              />
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}

export default SearchSiResult
