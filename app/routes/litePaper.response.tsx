import React, { useCallback, useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/Button/Button"
import Main from "@/components/Layout/Main/Main"
import {
  faFileImport,
  faIndent,
  faPaperPlane,
  faPeopleGroup,
  faPlus,
  faRotateLeft,
} from "@fortawesome/free-solid-svg-icons"
import { litePaperDescription } from "@/textData"
import { faEdit } from "@fortawesome/free-regular-svg-icons"
import Output from "@/components/LitePaper/Output/Output"
import {
  ExpandTrigger,
  FinalResult,
  OutputSectionResponse,
} from "@/components/LitePaper/Output/types"
import {
  ShouldRevalidateFunction,
  useActionData,
  useLoaderData,
  useNavigate,
} from "@remix-run/react"
import { processLitePaperResponse, runLitePaper } from "@/utils/sse/sseRender"
import { toast } from "@/hooks/useToast"
import { useLitePaper } from "@/store/litepaper"
import { ErrorBoundaryComponent } from "@/components/ui/ErrorBoundaryComponent/ErrorBoundaryComponent"
import {
  ActionFunctionArgs,
  json,
  LoaderFunction,
  LoaderFunctionArgs,
} from "@remix-run/node"
import { requiredUserSession } from "@/data/auth/session.server"
import {
  getWorkspaceResult,
  saveWorkspaceResult,
} from "@/data/litepaper/litepaper.server"
import { Toaster } from "@/components/ui/Toast/Toaster"
import useLocalDBFilesStore from "@/store/localDB"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { IconProp } from "@fortawesome/fontawesome-svg-core"
import { ToC } from "@/components/Discovery/types"
import { slugify } from "@/components/Discovery/ContentBlock"
import TableOfContents from "@/components/Discovery/TableOfContents"
import { AnimatePresence, LayoutGroup, motion } from "framer-motion"
import Tooltip from "@/components/ui/Tooltip/Tooltip"
import BackButton from "@/components/ui/BackButton/BackButton"

const StoryComponent = () => {
  const loaderData = useLoaderData<typeof loader>()
  const actionData = useActionData<{ status: string }>()
  const [loadedResponse, setLoadedResponse] = useState<boolean>(false)
  const hasRunSocket = useRef(false)
  const navigate = useNavigate()
  const [expandedSections, setExpandedSections] = useState<ExpandTrigger>({
    open: true,
    reset: false,
  })
  const { setLocalDBFiles, setLocalPrivateFiles, setNeedLoadState } =
    useLocalDBFilesStore()
  const [workspaceId, setWorkspaceId] = useState<string | null>(null)
  const [openToc, setOpenToc] = useState<boolean>(false)
  const litePaper = useLitePaper()

  const handleRunAllStream = useCallback((messageChunk: string) => {
    try {
      const parsedMessage = JSON.parse(messageChunk)
      if (parsedMessage.type === "Form" && parsedMessage.content) {
        const content = parsedMessage.content
        const resultStructure = content.sections.flatMap((section) => {
          if (
            section.type === "Subsections" &&
            Array.isArray(section.subsections)
          ) {
            return section.subsections.map((sub) => ({
              uuid: sub.uuid,
              content: [
                {
                  type: "Status",
                  result: "Waiting for the result",
                  completed: false,
                },
              ],
            }))
          }
          return [
            {
              uuid: section.uuid,
              content: [
                {
                  type: "Status",
                  result: "Waiting for the result",
                  completed: false,
                },
              ],
            },
          ]
        })
        litePaper.setResults(resultStructure)
      } else if (parsedMessage.type === "Status" && parsedMessage.content) {
        litePaper.addOutputSectionResponse(parsedMessage.uuid, {
          type: parsedMessage.type,
          result: parsedMessage.content,
          completed: false,
        })
      } else if (parsedMessage.type === "Error" && parsedMessage.content) {
        litePaper.addOutputSectionResponse(parsedMessage.uuid, {
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
            litePaper.addOutputSectionResponse(
              parsedMessage.uuid,
              item,
              parsedMessage.hash_id
            )
          })
        } else {
          litePaper.addOutputSectionResponse(
            parsedMessage.uuid,
            parsedMessage.content,
            parsedMessage.hash_id
          )
        }
      } else if (parsedMessage.type === "Completed") {
        // maybe we might need this
      } else {
        console.warn(`Unhandled progress type: ${parsedMessage.type}`)
      }
    } catch (error) {
      console.error("Error processing message chunk:", error)
    }
  }, [])

  const triggerLitePaperResponse = async (sections = litePaper.sections) => {
    const formData = new FormData()

    formData.append("sections", JSON.stringify(sections))

    const urlParams = new URLSearchParams(window.location.search)
    const workspaceId = urlParams.get("workspaceId")
    if (workspaceId) {
      formData.append("workspaceId", workspaceId)
      setWorkspaceId(workspaceId)
    } else {
      toast({
        title: "Something went wrong",
        description: "No workspaceID available for litePaper",
        variant: "error",
      })
    }

    try {
      const response = await runLitePaper(formData)
      if (!response) return

      processLitePaperResponse({
        response,
        onChunk: handleRunAllStream,
      })
    } catch (err) {
      toast({
        title: "Something went wrong",
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "error",
      })
    }
  }

  const handleNewPaperClick = () => {
    setLocalDBFiles([])
    setLocalPrivateFiles([])
    setNeedLoadState(false, false)
    litePaper.resetLitePaper()
    navigate("/litePaper/settings")
  }

  useEffect(() => {
    if (loadedResponse === false && litePaper.hasInputs) {
      setLoadedResponse(true)
      if (!hasRunSocket.current) {
        triggerLitePaperResponse()
        hasRunSocket.current = true
      }
    } else if (
      loadedResponse === false &&
      loaderData &&
      loaderData.workspaceData
    ) {
      setLoadedResponse(true)
      litePaper.resetLitePaper()
      litePaper.resetLitePaperResult()
      litePaper.setPaperName(loaderData.workspaceData.name)
      litePaper.setDescription(loaderData.workspaceData.description)
      litePaper.setSubtitle(loaderData.workspaceData.subtitle)
      litePaper.setWritingStyle(loaderData.workspaceData.writing_style)
      litePaper.setAuthors(loaderData.workspaceData.authors)
      litePaper.setSections(loaderData.workspaceData.form.sections)
      if (!hasRunSocket.current) {
        triggerLitePaperResponse(loaderData.workspaceData.form.sections)
        hasRunSocket.current = true
      }
    } else if (loadedResponse === false) {
      navigate("/litePaper")
    }
  }, [loaderData.workspaceData])

  useEffect(() => {
    if (actionData) {
      if (actionData.status && actionData.status === "saved") {
        toast({
          title: `Result Updated`,
          description: `Result edited successfully`,
          variant: "success",
        })
      } else if (actionData.status && actionData.status === "error saving") {
        toast({
          title: `Result Saving Error`,
          description: `Result failed to be edited`,
          variant: "error",
        })
      }
    }
  }, [actionData])

  const [headings, setHeadings] = useState<ToC[]>([])

  useEffect(() => {
    const elements = Array.from(
      document.querySelectorAll<HTMLHeadingElement>("span.content-block")
    )
      .filter((elem) => elem.childElementCount === 0)
      .filter((elem) => {
        const id = slugify(elem.innerText)
        if (!expandedSections.open) {
          return document.getElementById("section-" + id)
        }
        return (
          document.getElementById("section-" + id) ||
          document.getElementById("subsection-" + id)
        )
      })
      .map((elem) => {
        const id = slugify(elem.innerText)
        return {
          text: elem.innerText,
          id: document.getElementById("section-" + id)
            ? "section-" + id
            : "subsection-" + id,
          isSubsection: !document.getElementById(
            "section-" + slugify(elem.innerText)
          ),
        }
      })
    setHeadings(elements)
  }, [litePaper.result])

  return (
    <Main>
      <Toaster />
      <BackButton customURL={`/litePaper/slides?workspaceId=${workspaceId}`} />
      <div className="flex justify-end mt-[20px]">
        <Button
          icon={faRotateLeft}
          className={"font-normal !inline mr-4"}
          variant="borderGhost"
          disabled={true}
        >
          Reset Paper
        </Button>
        <Button
          className={"font-normal !inline"}
          icon={faFileImport}
          variant="outline"
          onClick={() => console.log(litePaper.result)}
          disabled={true}
        >
          Export Paper
        </Button>
        <section className="w-full flex justify-end gap-x-5 mt-6 mb-6">
          <Button
            variant={"underline"}
            className="text-sm text-secondary dark:text-white"
            onClick={() =>
              setExpandedSections((prev) => ({
                open: true,
                reset: !prev.reset,
              }))
            }
          >
            Expand All
          </Button>
          <Button
            variant={"underline"}
            className="text-sm text-secondary dark:text-white"
            onClick={() =>
              setExpandedSections((prev) => ({
                open: false,
                reset: !prev.reset,
              }))
            }
          >
            Collapse All
          </Button>
        </section>
      </div>

      <header
        className={
          "w-full bg-primary text-white rounded-t-xs pl-14 py-10 text-4xlbold mb-[20px] flex flex-col justify-between"
        }
      >
        <h1 className="after:content-[''] after:block after:w-[189px] after:h-[1px] after:bg-white after:mt-6">
          {litePaper.paperName !== "" ? litePaper.paperName : "Your Paper"}
        </h1>
        {litePaper.subtitle !== "" && (
          <h2 className="text-2xl mt-4">{litePaper.subtitle}</h2>
        )}
        {litePaper.authors !== "" && (
          <span className="text-base mt-4 flex gap-2 items-center">
            {litePaper.authors === "The Agentcy" && (
              <FontAwesomeIcon icon={faPeopleGroup as IconProp} />
            )}
            {litePaper.authors}
          </span>
        )}
      </header>
      <LayoutGroup>
        <main className="gap-6 flex overflow-x-hidden max-w-full">
          <motion.aside
            className={`hidden lg:block ${openToc ? "min-w-[200px]" : ""}`}
            initial={{ opacity: 0, width: 15 }}
            animate={{ opacity: 1, width: openToc ? 200 : 15 }}
            exit={{ opacity: 0, width: 15 }}
            transition={{
              duration: 0.13,
            }}
          >
            {!openToc ? (
              <Tooltip
                text="Show Table of Contents"
                icon={faIndent}
                onClick={() => setOpenToc((prev) => !prev)}
              />
            ) : (
              <Button
                variant={"ghost"}
                onClick={() => setOpenToc((prev) => !prev)}
                icon={faIndent as IconProp}
                className={"!p-0 !m-0"}
              >
                Contents
              </Button>
            )}
            <AnimatePresence initial={false}>
              {openToc && (
                <motion.div
                  key="toc"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{
                    duration: 0.13,
                  }}
                >
                  <TableOfContents items={headings} variant="litepaper" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.aside>

          <Output
            sectionResponses={litePaper.result as FinalResult[]}
            expandedSections={expandedSections}
            inputSections={litePaper.sections}
          />
        </main>
      </LayoutGroup>

      <footer className="flex flex-wrap justify-between mt-12 pb-4">
        <Button
          icon={faPlus}
          className={"font-normal !inline"}
          variant={"borderGhost"}
          onClick={handleNewPaperClick}
        >
          New Paper
        </Button>
        <section className={"lg:ml-auto"}>
          <Button
            icon={faEdit}
            className={"font-normal !inline mr-4"}
            variant={"borderGhost"}
            disabled={false}
            onClick={() =>
              navigate(`/litePaper/slides?workspaceId=${workspaceId}`)
            }
          >
            Edit Paper
          </Button>
          <Button
            className={"font-normal !inline"}
            icon={faPaperPlane}
            disabled={true}
          >
            Share Paper
          </Button>
        </section>
      </footer>
    </Main>
  )
}

export default StoryComponent

export const loader: LoaderFunction = async ({
  request,
}: LoaderFunctionArgs) => {
  const token = await requiredUserSession(request)

  const url = new URL(request.url)
  const params = new URLSearchParams(url.search)
  const workspaceId = params.get("workspaceId")

  if (workspaceId) {
    let workspaceData = await getWorkspaceResult(token, workspaceId)
    if (workspaceData.form && workspaceData.form.sections) {
      return json({
        workspaceData: workspaceData,
      })
    }
    return json({
      workspaceData: null,
    })
  } else {
    return json({
      workspaceData: null,
    })
  }
}

export async function action({ request }: ActionFunctionArgs) {
  const token = await requiredUserSession(request)
  const originalFormData = await request.formData()
  const url = new URL(request.url)
  const params = new URLSearchParams(url.search)

  const intent = originalFormData.get("intent")
  const hash_id = originalFormData.get("hash_id")
  const index = originalFormData.get("index")

  const formData = new FormData()
  for (const [key, value] of originalFormData.entries()) {
    if (key !== "intent" && key !== "hash_id" && key !== "index") {
      formData.append(key, value)
    }
  }

  const workspaceId = params.get("workspaceId")

  if (intent === "save" && workspaceId) {
    const jsonBody = Object.fromEntries(formData.entries())
    if (jsonBody.finalResult) {
      const parsedData = JSON.parse(jsonBody.finalResult)
      Object.assign(jsonBody, parsedData)
      delete jsonBody.finalResult
    }
    const saveStatus = await saveWorkspaceResult(
      token,
      workspaceId,
      hash_id as string,
      index as number,
      jsonBody
    )
    return json({ status: saveStatus === 200 ? "saved" : "error saving" })
  } else {
    return null
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
