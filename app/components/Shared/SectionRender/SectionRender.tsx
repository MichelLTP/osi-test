import ContentBlock from "@/components/Discovery/ContentBlock"
import { ContentBlockProps } from "@/components/Discovery/types"
import React from "react"
import { SectionRendererProps } from "./type"
import { findMatchingImage } from "@/utils/documentTools/adminPanel/discovery"

const SectionRenderer: React.FC<SectionRendererProps> = ({
  sections,
  uploadImages = [],
}) => {
  return (
    <>
      {sections?.map((section: ContentBlockProps, index: number) => {
        let imageUrl = ""
        // If section has an image ID, use the API endpoint URL
        if (section?.image?.id) {
          imageUrl = section.image.url
        }
        // If uploadImages exist, try to find a matching image
        else if (uploadImages.length > 0 && section.image?.title) {
          const matchedImage = findMatchingImage(
            uploadImages,
            section.image.title
          )
          if (matchedImage) {
            imageUrl = matchedImage
          }
        }

        return (
          <React.Fragment key={index}>
            <ContentBlock
              title={section.title}
              text={section.text}
              image_url={imageUrl}
              id={section?.image?.id}
              imageAlt={section?.image?.title}
              image_pos={section?.image?.position}
            />
          </React.Fragment>
        )
      })}
    </>
  )
}

export default SectionRenderer
