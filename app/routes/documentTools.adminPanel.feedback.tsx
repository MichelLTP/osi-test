import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/Accordion/Accordion"
import { Button } from "@/components/ui/Button/Button"
import { ErrorBoundaryComponent } from "@/components/ui/ErrorBoundaryComponent/ErrorBoundaryComponent"
import { faCloudDownload, faTrashCan } from "@fortawesome/free-solid-svg-icons"
import { useState } from "react"

export default function Feedback() {
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
            <div className="flex flex-col items-start gap-2 mt-10">
              <p>Download all feedback</p>
              <Button className="px-6" icon={faCloudDownload} type="submit">
                Download
              </Button>
            </div>
            <div className="flex gap-5 items-end my-5 flex-wrap">
              <div className="flex flex-col gap-1 grow">
                <label htmlFor="occupation">Feedback id</label>
                <input
                  className="flex items-center bg-third h-[40px] pl-5 rounded-xsdark:bg-secondary-dark dark:text-white outline-none text-secondary"
                  type="number"
                  name="documentId"
                  id="documentId"
                  placeholder="0"
                />
              </div>
              <div className="flex gap-5">
                <Button
                  className="mt-5 px-6 bg-error"
                  icon={faTrashCan}
                  type="button"
                >
                  Delete document
                </Button>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </>
  )
}

export function ErrorBoundary() {
  return <ErrorBoundaryComponent isMainRoute={false} />
}
