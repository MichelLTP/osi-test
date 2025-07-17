import { IChatSiResponseProps } from "@/components/ChatSi/ChatSiResponse/type"
import { SearchSiResultData } from "@/components/SearchSi/type"
import { SummarizationResponseProps } from "@/components/DocTools/Summarization/types"
import { IDocToolsResponseProps } from "@/components/DocTools/DocToolsResponse/type"
import {
  RenderedStreamBlock,
  RenderedStreamTypes,
} from "@/data/searchspaces/types"

export interface SocialButtonsProps<T extends RenderedStreamTypes = string[]> {
  response:
    | SearchSiResultData
    | IChatSiResponseProps
    | SummarizationResponseProps
    | IDocToolsResponseProps
    | RenderedStreamBlock<T>
  responseIds: { name: string; value?: string }[]
  onFeedbackChange?: (
    feedbackField: string,
    updatedFeedback: FeedbackState
  ) => void
}

export type FeedbackState = "NEUTRAL" | "LIKE" | "DISLIKE"
