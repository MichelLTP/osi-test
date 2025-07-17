import ModifyComponent from "@/components/Shared/ModifyComponent/ModifyComponent"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/Accordion/Accordion"
import { ErrorBoundaryComponent } from "@/components/ui/ErrorBoundaryComponent/ErrorBoundaryComponent"
import { useState } from "react"

export default function ModifySmallText() {
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
            <ModifyComponent />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </>
  )
}

export function ErrorBoundary() {
  return <ErrorBoundaryComponent isMainRoute={false} />
}
