import { ContentBlockProps } from "@/components/Discovery/types"

export interface SectionRendererProps {
  sections?: ContentBlockProps[]
  questions?: ContentBlockProps[]
  uploadImages?: File[]
}
