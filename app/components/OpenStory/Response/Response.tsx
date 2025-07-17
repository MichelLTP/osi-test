import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/Accordion/Accordion"
import { faBarsStaggered } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Fragment, useEffect, useState } from "react"
import DocumentComponent from "./DocumentComponent"
import Tabs from "@/components/ui/Tabs/Tabs"
import { AggregatedSources } from "./types"
import { Button } from "@/components/ui/Button/Button"

export default function Response({ result }: { result: AggregatedSources[] }) {
  const [localResult, setLocalResult] = useState(result)
  const [expandedSections, setExpandedSections] = useState(new Set())

  useEffect(() => {
    if (result) {
      setLocalResult(result)
    }
  }, [result])

  // Function to handle expand/collapse all
  const handleExpandAll = (expand) => {
    if (expand) {
      // Create a set of all section IDs
      const allSectionIds = new Set(
        localResult.flatMap((source, sourceIndex) =>
          source.sections.map(
            (_, sectionIndex) => `${sourceIndex}-${sectionIndex}`
          )
        )
      )
      setExpandedSections(allSectionIds)
    } else {
      // Clear all expanded sections
      setExpandedSections(new Set())
    }
  }

  // Function to handle individual accordion toggles
  const handleAccordionToggle = (value, sectionId) => {
    const newExpandedSections = new Set(expandedSections)
    if (value === sectionId) {
      newExpandedSections.add(sectionId)
    } else {
      newExpandedSections.delete(sectionId)
    }
    setExpandedSections(newExpandedSections)
  }

  return (
    <div>
      <div className="w-full flex justify-end gap-x-5 my-2">
        <Button
          variant="underline"
          className="text-sm"
          onClick={() => handleExpandAll(true)}
        >
          Expand All
        </Button>
        <Button
          variant="underline"
          className="text-sm"
          onClick={() => handleExpandAll(false)}
        >
          Collapse All
        </Button>
      </div>
      {localResult.map(
        (source, sourceIndex) =>
          source.selected && (
            <Fragment key={sourceIndex}>
              <div className="flex items-center gap-4 border-b border-secondary dark:border-third-dark py-8">
                <FontAwesomeIcon
                  icon={faBarsStaggered}
                  className="text-primary text-2xl"
                />
                <h2 className="text-primary text-3xl">{source.title}</h2>
              </div>
              {source.sections.map((section, sectionIndex) => {
                const sectionId = `${sourceIndex}-${sectionIndex}`
                return (
                  <Accordion
                    key={sectionIndex}
                    type="single"
                    collapsible
                    className="border-b border-secondary dark:border-third-dark"
                    value={expandedSections.has(sectionId) ? sectionId : ""}
                    onValueChange={(value) =>
                      handleAccordionToggle(value, sectionId)
                    }
                  >
                    <AccordionItem value={sectionId} className="border-none">
                      <AccordionTrigger className="text-xlbold">
                        {section.title}
                      </AccordionTrigger>
                      <AccordionContent className="px-8">
                        {source.title === "Documents" &&
                          section.subsections.map(
                            (subsection, subsectionIndex) => {
                              // Create tabs for the documents within each subsection
                              const TabsProps = {
                                tabs: subsection.documents.map(
                                  (doc, docIndex) => ({
                                    label: `Document ${docIndex + 1}`,
                                    children: (
                                      <Fragment key={docIndex}>
                                        <DocumentComponent
                                          doc={doc}
                                          docIndex={docIndex}
                                        />
                                      </Fragment>
                                    ),
                                    id: `doc-${subsectionIndex}-${docIndex}`,
                                    isMarkdown: false,
                                  })
                                ),
                              }

                              return (
                                <Accordion
                                  key={subsectionIndex}
                                  type="single"
                                  collapsible
                                  defaultValue="3"
                                >
                                  <AccordionItem
                                    value={"3"}
                                    className="border-none"
                                  >
                                    <AccordionTrigger className="text-xl border-b border-secondary dark:border-third-dark">
                                      {subsection.title}
                                    </AccordionTrigger>
                                    <AccordionContent>
                                      <div>
                                        <Tabs
                                          hookProps={TabsProps}
                                          variant="search result"
                                        />
                                        <DocumentComponent
                                          doc={subsection.metaAnalysis}
                                          docIndex={999}
                                          variant={"metaData"}
                                        />
                                      </div>
                                    </AccordionContent>
                                  </AccordionItem>
                                </Accordion>
                              )
                            }
                          )}
                        {source.title !== "Documents" &&
                          section.subsections.map(
                            (subsection, subsectionIndex) => (
                              <Accordion
                                key={subsectionIndex}
                                type="single"
                                collapsible
                                defaultValue="3"
                              >
                                <AccordionItem
                                  value={"3"}
                                  className="border-none"
                                >
                                  <AccordionTrigger className="text-xl border-b border-secondary dark:border-third-dark">
                                    {subsection.title}
                                  </AccordionTrigger>
                                  <AccordionContent>
                                    <div>
                                      <div className="flex items-center gap-2 mb-4 text-xl mt-5">
                                        <FontAwesomeIcon
                                          icon={faBarsStaggered}
                                        />
                                        <h2>Answer</h2>
                                      </div>
                                      {subsection.nonDocuments?.map(
                                        (nonDoc, nonDocIndex) => (
                                          <DocumentComponent
                                            key={nonDocIndex}
                                            doc={nonDoc}
                                            docIndex={nonDocIndex}
                                            variant={"non-doc"}
                                          />
                                        )
                                      )}
                                    </div>
                                  </AccordionContent>
                                </AccordionItem>
                              </Accordion>
                            )
                          )}
                        {source.title === "Documents" && (
                          <>
                            <Accordion
                              key={9999}
                              type="single"
                              collapsible
                              defaultValue="3"
                            >
                              <AccordionItem
                                value={"3"}
                                className="border-none"
                              >
                                <AccordionTrigger className="text-xl border-b border-secondary dark:border-third-dark">
                                  Meta-analysis
                                </AccordionTrigger>
                                <AccordionContent>
                                  <div>
                                    <DocumentComponent
                                      doc={section.metaAnalysis}
                                      docIndex={999}
                                      variant={"metaData"}
                                    />
                                  </div>
                                </AccordionContent>
                              </AccordionItem>
                            </Accordion>
                          </>
                        )}
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                )
              })}
              {source.title === "Documents" && (
                <>
                  <DocumentComponent
                    doc={source.overallMetaAnalysis}
                    docIndex={999}
                    variant={"metaSection"}
                  />
                </>
              )}
            </Fragment>
          )
      )}
    </div>
  )
}
