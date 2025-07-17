import React from "react"
import { ContentBlockProps } from "@/components/Discovery/types"
import ContentBlock from "@/components/Discovery/ContentBlock"
import DiscoverySectionHeading from "@/components/Discovery/DiscoverySectionHeading"
import { faQuestionCircle } from "@fortawesome/free-solid-svg-icons"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/Accordion/Accordion"
import { findMatchingImage } from "@/utils/documentTools/adminPanel/discovery"
import { SectionRendererProps } from "../SectionRender/type"

const KeyQuestionsRenderer: React.FC<SectionRendererProps> = ({
  questions,

  uploadImages = [],
}) => {
  if (!questions?.length) return null

  return (
    <section>
      <DiscoverySectionHeading title="Key Questions" icon={faQuestionCircle} />
      <Accordion type="single" collapsible className="-mt-4">
        {questions.map((question: ContentBlockProps, index: number) => {
          let imageUrl = ""

          // If question has an image ID, use the API endpoint URL
          if (question?.image?.id) {
            imageUrl = question?.image?.url
          }
          // If uploadImages exist, try to find a matching image
          else if (uploadImages.length > 0 && question.image?.title) {
            const matchedImage = findMatchingImage(
              uploadImages,
              question.image.title
            )
            if (matchedImage) {
              imageUrl = matchedImage
            }
          }

          return (
            <AccordionItem value={`item-${index + 1}`} key={index}>
              <AccordionTrigger className="text-basesemibold text-left">
                {question.title}
              </AccordionTrigger>
              <AccordionContent>
                <ContentBlock
                  text={question.text}
                  image_url={imageUrl}
                  image_pos={question.image?.position}
                  className="items-start text-left"
                />
              </AccordionContent>
            </AccordionItem>
          )
        })}
      </Accordion>
    </section>
  )
}

export default KeyQuestionsRenderer
