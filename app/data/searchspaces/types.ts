import { FeedbackState } from "@/components/Layout/SocialButtons/type"
import { QuestionProps } from "@/components/ChatSi/ExampleQuestions/type"

export type CreateSpaceData = {
  title: string
  description: string
  doc_ids: string[]
  instructions: string
}

export type SpaceInfo = {
  title: string
  description: string
  doc_names: string[]
  doc_ids: string[]
  workspace_id: string
  thumbnail_url: string
  instructions: string
}

export type MetaDataDocs = {
  doc_id: string
  doc_name: string
  doc_metadata: {
    [key: string]: [string]
  }
  doc_cover_url: string
}

export type Workspace = SpaceInfo & {
  docs_with_metadata: MetaDataDocs[]
}

type TrendingTopics = {
  name: string
  description: string
  mentioned_in: number[]
}

/** Stream types that come from the BE */

type InsightStreamType = {
  uuid: string
  type: "Form" | "Result" | "Completed" | "Status" | "Error"
}

type LayoutMetadata = Record<string, any>

export type SectionDefinition = {
  uuid: string
  layout_metadata: LayoutMetadata
  title: string
  prompt: string
  feedback?: {
    state: FeedbackState
  }
  type: "SearchSpaces"
  subtype: string
}

export type AiDiveDefinition = SectionDefinition & {
  explore_prompts: SectionDefinition & { tab: string }
  synthesize_prompts: SectionDefinition & { tab: string }
  critique_prompts: SectionDefinition & { tab: string }
  hypothesize_prompts: SectionDefinition & { tab: string }
  lookforward_prompts: SectionDefinition & { tab: string }
  relate_prompts: SectionDefinition & { tab: string }
}

export type FormStream = InsightStreamType & {
  type: "Form"
  content: {
    uuid: string
    layout_metadata: LayoutMetadata
    layout: {
      uuid: string
      layout_metadata: LayoutMetadata
      summary: SectionDefinition
      insights_compiler: {
        uuid: string
        layout_metadata: LayoutMetadata
        type: "SearchSpaces"
        subtype: "InsightsCompilerLayout"
        key_insights: SectionDefinition
        intents: SectionDefinition
        entity_map: SectionDefinition
        comparative_insights: SectionDefinition
        key_data_statistics: SectionDefinition
        ai_dive: AiDiveDefinition
      }
      trending_topics: SectionDefinition
      related_documents: SectionDefinition
    }
  }
}

export type ResultStream = InsightStreamType & {
  type: "Result"
  uuid: string
  hash_id: string
  content: Array<{
    type: "Markdown" | string
    result: string
  }>
}

type CompletedStream = InsightStreamType & {
  type: "Completed"
}

type StatusStream = InsightStreamType & {
  type: "Status"
  content: string
  uuid: string
}

type ErrorStream = InsightStreamType & {
  type: "Error"
  content: string
  uuid: string
}

export type SpaceInsightsStream =
  | FormStream
  | ResultStream
  | CompletedStream
  | StatusStream
  | ErrorStream

/* The response used in the component */
export type RenderedStreamTypes =
  | string[]
  | MetaDataDocs[]
  | TrendingTopics[]
  | QuestionProps[]

export type RenderedStreamBlock<T extends RenderedStreamTypes> = {
  uuid: string
  content: T
  feedback?: FeedbackState
  status: {
    body: string
  } | null
}

export type StreamResult = {
  summary: RenderedStreamBlock<string[]>
  trending_topics: RenderedStreamBlock<TrendingTopics[]>
  key_insights: RenderedStreamBlock<string[]>
  intents: RenderedStreamBlock<string[]>
  entity_map: RenderedStreamBlock<string[]>
  comparative_insights: RenderedStreamBlock<string[]>
  key_data_statistics: RenderedStreamBlock<string[]>
  related_documents: RenderedStreamBlock<MetaDataDocs[]>
  ai_dive: RenderedStreamBlock<string[]>
  ai_dive_critique_prompts: RenderedStreamBlock<QuestionProps[]>
  ai_dive_explore_prompts: RenderedStreamBlock<QuestionProps[]>
  ai_dive_synthesize_prompts: RenderedStreamBlock<QuestionProps[]>
  ai_dive_hypothesize_prompts: RenderedStreamBlock<QuestionProps[]>
  ai_dive_lookforward_prompts: RenderedStreamBlock<QuestionProps[]>
  ai_dive_relate_prompts: RenderedStreamBlock<QuestionProps[]>
}

export type StreamSectionKey = keyof StreamResult
