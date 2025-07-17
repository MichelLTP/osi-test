import { useEffect, useState } from "react"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/Accordion/Accordion"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faBarsStaggered } from "@fortawesome/free-solid-svg-icons"
import LoadingStatus from "@/components/Shared/LoadingStatus/LoadingStatus"
import {
  OutputProps,
  FinalResult,
  OutputSectionResponse,
} from "@/components/LitePaper/Output/types"
import { clsx } from "clsx"
import { useLocation, useSubmit } from "@remix-run/react"
import {
  NonSubsectionSectionObj,
  SectionObj,
  SubsectionsSection,
} from "../types"
import { renderOutputHandler } from "@/utils/documentTools/adminPanel/aggservice"
import { useLitePaper } from "@/store/litepaper"
import { slugify } from "@/components/Discovery/ContentBlock"
import { Button } from "@/components/ui/Button/Button"

const Output = ({
  sectionResponses,
  inputSections,
  expandedSections,
  isSubsection = false,
  subsectionType = "",
}: OutputProps) => {
  const [openSections, setOpenSections] = useState<string[]>([])
  // Track expanded subsections per section
  const [expandedSubsectionsBySection, setExpandedSubsectionsBySection] =
    useState<Record<string, boolean>>({})

  const location = useLocation()
  const isPreview = location.pathname.includes("litePaper/slides")
  const litePaper = useLitePaper()
  const submit = useSubmit()

  useEffect(() => {
    if (expandedSections.open) {
      setOpenSections(
        inputSections.map((section: SectionObj) => `${section.uuid}`)
      )
    } else {
      setOpenSections([])
    }
  }, [expandedSections, inputSections])

  useEffect(() => {
    setOpenSections(
      inputSections.map((section: SectionObj) => `${section.uuid}`)
    )
    // Initialize expanded state for all sections
    const initialExpandedState: Record<string, boolean> = {}
    inputSections.forEach((section: SectionObj) => {
      initialExpandedState[section.uuid] = true
    })
    setExpandedSubsectionsBySection(initialExpandedState)
  }, [inputSections])

  const handleSave = (content: OutputSectionResponse, docValue: string) => {
    if (
      content &&
      "uuid" in content &&
      "index" in content &&
      typeof content.uuid === "string"
    ) {
      litePaper.updateOutputSectionResponse(content.uuid, content.index, {
        type: "Markdown",
        result: docValue,
      })
      if (content.hash_id && content.result !== docValue) {
        const formData = new FormData()
        formData.append("intent", "save")
        formData.append("hash_id", content.hash_id)
        formData.append("index", content.index)
        formData.append(
          "finalResult",
          JSON.stringify({ type: "Markdown", result: docValue })
        )
        submit(formData, { method: "post", action: "" })
      }
    }
  }

  // Toggle expanded state for subsections within a specific section
  const toggleSectionSubsections = (sectionId: string, isExpanded: boolean) => {
    setExpandedSubsectionsBySection((prev) => ({
      ...prev,
      [sectionId]: isExpanded,
    }))
  }

  return inputSections?.length > 0 ? (
    <Accordion
      type="multiple"
      className="max-w-full overflow-x-hidden"
      value={openSections}
      onValueChange={(values) => setOpenSections(values as string[])}
    >
      <div
        className={clsx(
          "space-y-5 overflow-x-hidden",
          isSubsection && "flex flex-wrap justify-between"
        )}
      >
        {inputSections.map((section: SectionObj) => (
          <AccordionItem
            key={section.uuid}
            value={`${section.uuid}`}
            className={clsx(
              "space-y-5 w-full border-none",
              isSubsection && "px-4",
              isSubsection &&
                section.layout_metadata.displayMode === "Columns" &&
                "w-1/2 !mt-4"
            )}
          >
            <AccordionTrigger
              className={clsx(
                isSubsection ? "text-2xl font-normal" : "text-3xl"
              )}
              showRouterDocs={subsectionType ? subsectionType : section.type}
              variant={`${isSubsection ? "litePaper subsection" : "litePaper section"}`}
            >
              <header className={"flex gap-4 items-center text-2xlbold"}>
                {!isSubsection && (
                  <FontAwesomeIcon icon={faBarsStaggered} size={"xs"} />
                )}
                <span
                  className={"content-block"}
                  id={`${isSubsection ? "subsection" : "section"}-${slugify(section?.title ?? "")}`}
                >
                  {section.title}
                </span>
              </header>
            </AccordionTrigger>
            <AccordionContent
              className={`dark:text-white ${!isSubsection && "border-l-2 border-primary"}`}
              variant={`${isSubsection ? "litePaper subsection" : "litePaper section"}`}
            >
              {section?.type === "Subsections" ? (
                <div className="flex flex-col">
                  <div className="w-full flex justify-end gap-x-5 my-2 ">
                    <Button
                      variant="underline"
                      className="text-sm text-secondary dark:text-white"
                      onClick={() =>
                        toggleSectionSubsections(section.uuid, true)
                      }
                    >
                      Expand All
                    </Button>
                    <Button
                      variant="underline"
                      className="text-sm text-secondary dark:text-white"
                      onClick={() =>
                        toggleSectionSubsections(section.uuid, false)
                      }
                    >
                      Collapse All
                    </Button>
                  </div>
                  <Output
                    sectionResponses={sectionResponses as FinalResult[]}
                    expandedSections={{
                      open: expandedSubsectionsBySection[section.uuid] ?? true,
                      reset: false,
                    }}
                    inputSections={
                      (section as SubsectionsSection)
                        .subsections as NonSubsectionSectionObj[]
                    }
                    isSubsection={true}
                    subsectionType={section.type}
                  />
                </div>
              ) : (
                sectionResponses
                  ?.filter((response) => response.uuid === section.uuid)
                  .flatMap((response) =>
                    response.content.map((output, index) => {
                      if (output.result?.length > 0) {
                        return (
                          <section
                            className="px-4"
                            key={`${response.uuid}-${index}`}
                          >
                            {renderOutputHandler(
                              {
                                ...output,
                                index,
                                uuid: response.uuid,
                                hash_id: response.hash_id ?? undefined,
                              },
                              handleSave
                            )}
                          </section>
                        )
                      }
                      return null
                    })
                  )
              )}
            </AccordionContent>
          </AccordionItem>
        ))}
      </div>
    </Accordion>
  ) : (
    <LoadingStatus
      statusMessage={{
        body: isPreview
          ? "Preparing your preview..."
          : "Preparing your paper...",
      }}
    />
  )
}

export default Output
