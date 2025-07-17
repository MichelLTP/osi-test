import { ReactNode, useEffect } from "react"
import { faBarsStaggered } from "@fortawesome/free-solid-svg-icons"
import { SectionProps } from "@/components/LitePaper/NewSection/types"
import SectionType from "@/components/LitePaper/SectionType/SectionType"
import { clsx } from "clsx"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Badge } from "@/components/ui/Badge/Badge"

// Import Accordion components to mimic the Section component's structure for subsections
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/Accordion/Accordion"

const NewSection = ({
  section,
  setExpandedSections,
  expandedSections,
  isSubsection = false,
  subsectionIndex,
  InputsUuid = "",
}: SectionProps): ReactNode => {
  const sectionTitle =
    isSubsection && subsectionIndex !== undefined
      ? "Subsection " + (subsectionIndex + 1)
      : section.title
        ? section.title
        : ""
  const subsectionLength =
    !isSubsection && section?.type === "Subsections" && section?.subsections
      ? `(${section.subsections.length})`
      : ""
  const sectionInfo = isSubsection ? section?.title : `${subsectionLength}`

  useEffect(() => {
    if (isSubsection) {
      setExpandedSections([section.uuid])
    }
  }, [isSubsection, section.uuid, setExpandedSections])

  if (isSubsection) {
    return (
      <Accordion
        key={section.uuid}
        type="multiple"
        value={expandedSections}
        onValueChange={(values) => setExpandedSections(values as string[])}
      >
        <AccordionItem
          value={section.uuid}
          className={clsx("px-4 data-[state=closed]:border-none")}
        >
          <AccordionTrigger>
            <h3
              className={clsx(
                "text-xlbold dark:text-white text-black",
                // Use a slightly smaller bold font for subsections
                isSubsection && "!text-basebold"
              )}
            >
              <span className="flex items-center gap-4">
                {sectionInfo || sectionTitle}
              </span>
            </h3>
          </AccordionTrigger>
          <AccordionContent className={clsx("[&>div]:!pb-4")}>
            <SectionType
              section={section}
              isSubsection={isSubsection}
              setExpandedSections={setExpandedSections}
              expandedSections={expandedSections}
              inputsUuid={InputsUuid}
            />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    )
  }

  return (
    <>
      <h3
        className={clsx(
          "text-xlbold dark:text-white text-black border-solid border-opacity-30 border-b border-secondary dark:border-third-dark pb-5",
          isSubsection && "!text-basebold"
        )}
      >
        <div className="flex items-center gap-4">
          {!isSubsection && <FontAwesomeIcon icon={faBarsStaggered} />}
          {`Section ${section.layout_metadata.displayId}`}
          {section.title ? " - " + sectionTitle : ""}
          {(section.type ||
            (!isSubsection && section.subsections?.length > 0)) && (
            <div className="text-secondary dark:text-white text-base">
              {section.type && <span>| {section.type}</span>}
              {!isSubsection && section.subsections?.length > 0 && (
                <span className="ml-1">{sectionInfo}</span>
              )}
            </div>
          )}
          {section.subtype && <Badge>{section.subtype}</Badge>}
        </div>
      </h3>
      <SectionType
        section={section}
        isSubsection={isSubsection}
        setExpandedSections={setExpandedSections}
        expandedSections={expandedSections}
        inputsUuid={InputsUuid}
      />
    </>
  )
}

export default NewSection
