import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/Accordion/Accordion"
import { Button } from "@/components/ui/Button/Button"
import { useState } from "react"
import { SummarizationResponseProps } from "./types"
import { MarkdownRenderer } from "@/components/Shared/MarkdownRender/MarkdownRender"
import CopyToClipboard from "@/components/Shared/CopyToClipboard/CopyToClipboard"

const SubsectionSummary = ({
  summarizationResponse,
}: {
  summarizationResponse: SummarizationResponseProps
}) => {
  const [openItems, setOpenItems] = useState<string[]>([])
  const accordionItems = summarizationResponse?.subsections?.map(
    (subsection) => ({
      title: subsection.subsection_name,
      description: subsection.subsection_description,
      content: subsection.summary,
    })
  )

  const expandAll = () => {
    if (summarizationResponse?.subsections) {
      setOpenItems(
        summarizationResponse.subsections.map((_, index) => `item-${index}`)
      )
    }
  }

  const collapseAll = () => {
    setOpenItems([])
  }

  return (
    <>
      <div className="flex justify-end">
        <div className="flex gap-x-5 my-2">
          <Button variant="underline" className="text-sm" onClick={expandAll}>
            Expand All
          </Button>
          <Button variant="underline" className="text-sm" onClick={collapseAll}>
            Collapse All
          </Button>
        </div>
      </div>
      <Accordion
        type="multiple"
        className="w-full mb-8"
        value={openItems}
        onValueChange={setOpenItems}
      >
        {summarizationResponse?.subsections?.map((subsection, index) => (
          <AccordionItem
            key={index}
            value={`item-${index}`}
            className="border-none"
          >
            <AccordionTrigger className="text-xl text-left">
              {subsection.subsection_name}
            </AccordionTrigger>
            <AccordionContent>
              <div className="flex flex-col sm:flex-row sm:gap-x-2 md:items-stretch sm:justify-between mb-4 sm:mb-0 h-full">
                <div className="flex flex-col sm:w-2/3 w-full justify-between flex-grow p-4">
                  <div className="prose summarization">
                    <MarkdownRenderer
                      className="prose summarization"
                      value={subsection.summary}
                    />
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
      <CopyToClipboard
        variant="accordions"
        accordionItems={accordionItems}
        className="justify-end"
      />
    </>
  )
}

export default SubsectionSummary
