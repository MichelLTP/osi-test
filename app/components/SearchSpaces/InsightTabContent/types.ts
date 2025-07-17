import {
  RenderedStreamBlock,
  RenderedStreamTypes,
  StreamResult,
} from "@/data/searchspaces/types"
import { FeedbackState } from "@/components/Layout/SocialButtons/type"

export type InsightTabContentProps<T extends RenderedStreamTypes = string[]> = {
  result: RenderedStreamBlock<T>
  uuid?: string
  contentToBeCopied: string
  handleFeedbackChange: (
    uuid: keyof StreamResult,
    updatedFeedback: FeedbackState
  ) => void
}
