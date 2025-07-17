import { useEffect, useState } from "react"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/Accordion/Accordion"
import DiscoverySectionHeading from "@/components/Discovery/DiscoverySectionHeading"
import {
  faFolderOpen,
  faHeadphones,
  faIndent,
  faLayerGroup,
  faTags,
} from "@fortawesome/free-solid-svg-icons"
import TableOfContents from "@/components/Discovery/TableOfContents"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faFilePdf } from "@fortawesome/free-regular-svg-icons"
import Sources from "@/components/ChatSi/Sources/Sources"
import { Badge } from "@/components/ui/Badge/Badge"
import { slugify } from "@/components/Discovery/ContentBlock"
import { ToC, Document } from "@/components/Discovery/types"
import AudioPlayer from "./AudioPlayer"

const DetailSidebar = ({
  tags,
  sources,
  documents,
  podcast,
  audioUrl,
}: {
  tags: string[]
  sources: string[]
  documents: Document[]
  podcast?: string
  audioUrl?: string
}) => {
  const [headings, setHeadings] = useState<ToC[]>([])
  const [collapsed, setCollapsed] = useState<number>(1)

  useEffect(() => {
    const elements = Array.from(
      document.querySelectorAll<HTMLHeadingElement>(
        ".content-block h1, .content-block h2, .content-block h3, .content-block h4, .content-block h5, .content-block h6"
      )
    )
      .filter((elem) => elem.childElementCount === 0)
      .filter((elem) => document.getElementById(slugify(elem.innerText)))
      .map((elem) => ({
        text: elem.innerText,
        id: slugify(elem.innerText),
      }))

    setHeadings(elements)
  }, [])

  return (
    <>
      <Accordion
        type="single"
        collapsible
        value={`${collapsed}`}
        onValueChange={(value: string) => setCollapsed(Number(value))}
      >
        <AccordionItem value="1">
          <AccordionTrigger iconStyle={"arrow"}>
            <DiscoverySectionHeading title="Contents" icon={faIndent} />
          </AccordionTrigger>
          <AccordionContent>
            <TableOfContents items={headings} />
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {documents && documents.length > 0 && (
        <Accordion type="single" collapsible>
          <AccordionItem value="item-1" className={"pb-2 sm:py-0"}>
            <AccordionTrigger iconStyle={"arrow"} className={"-mb-4 sm:mb-0"}>
              <DiscoverySectionHeading title="Documents" icon={faFolderOpen} />
            </AccordionTrigger>
            <AccordionContent>
              <ul className="flex flex-col gap-4">
                {documents.map((document, index) => (
                  <li className="ml-7 pl-2 flex gap-2" key={index}>
                    <FontAwesomeIcon
                      icon={faFilePdf}
                      size="lg"
                      className="text-secondary dark:text-white"
                    />
                    {document.title}
                  </li>
                ))}
              </ul>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )}

      {sources && sources.length > 0 && (
        <Accordion type="single" collapsible>
          <AccordionItem value="item-1" className={"py-2 sm:py-0"}>
            <AccordionTrigger iconStyle={"arrow"} className={"-mb-4 sm:mb-0"}>
              <DiscoverySectionHeading title="Source" icon={faLayerGroup} />
            </AccordionTrigger>
            <AccordionContent className={"-mb-4 mt-6 sm:mt-0"}>
              <Sources variant={"discovery"} sources={sources} />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )}

      {tags && tags.length > 0 && (
        <Accordion type="single" collapsible>
          <AccordionItem value="item-1" className={"py-2 sm:py-0"}>
            <AccordionTrigger iconStyle={"arrow"} className={"-mb-4 sm:mb-0"}>
              <DiscoverySectionHeading title="Tags" icon={faTags} />
            </AccordionTrigger>
            <AccordionContent>
              <ul className="flex gap-2 items-start flex-wrap">
                {tags.map((tag, index) => (
                  <li key={index}>
                    <Badge className="text-third bg-[#97A6BB] hover:bg-[#97A6BB] dark:text-secondary">
                      {tag.tag}
                    </Badge>
                  </li>
                ))}
              </ul>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )}

      {audioUrl && (
        <Accordion type="single" collapsible>
          <AccordionItem value="item-1" className={"border-0 py-2 sm:py-0"}>
            <AccordionTrigger iconStyle={"arrow"} className={"-mb-2 sm:mb-0"}>
              <DiscoverySectionHeading title="Podcast" icon={faHeadphones} />
            </AccordionTrigger>
            <AccordionContent>
              <div className="flex gap-4 flex-col items-start flex-wrap">
                <strong className={"text-black dark:text-white"}>
                  {podcast}
                </strong>
                <div className={"w-full flex"}>
                  <AudioPlayer url={audioUrl} />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )}
    </>
  )
}
export default DetailSidebar
