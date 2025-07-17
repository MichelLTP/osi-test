import DocumentPreview from "@/components/DocTools/AdminPanel/Tabs/DocumentPreview/DocumentPreview"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/Accordion/Accordion"
import { ErrorBoundaryComponent } from "@/components/ui/ErrorBoundaryComponent/ErrorBoundaryComponent"
import { useState } from "react"

export default function AddSmallText() {
  const [collapsed, setCollapsed] = useState<number>(1)

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
            <DocumentPreview />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </>
  )
}

export function ErrorBoundary() {
  return <ErrorBoundaryComponent isMainRoute={false} />
}
