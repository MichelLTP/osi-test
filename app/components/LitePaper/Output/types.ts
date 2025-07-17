import { TableData } from "@/components/ui/DynamicDataTable/types"
import { SectionObj } from "../types"

export interface FinalResult {
  uuid: string
  type?: string
  hash_id?: string
  content: OutputSectionResponse[]
  meta_type?: string
  topic_title?: string
}

export type OutputProps = {
  sectionResponses: FinalResult[]
  expandedSections: ExpandTrigger
  inputSections: SectionObj[]
  isSubsection?: boolean
  subsectionType?: string
}

export type OutputSections = {
  uuid: string
  title: string
  type: "Documents" | "Subsection"
  responses: OutputSectionResponse[] | OutputSections[]
  completed?: boolean
  metaAnalysis?: OutputSectionResponse
}

export type OutputSectionResponse = {
  uuid?: string
  hash_id?: string
  result?: string
  type:
    | "text"
    | "aggregator"
    | "chart"
    | "code"
    | "table"
    | "Markdown"
    | "Status"
    | "Table"
    | "Plotly"
  title?: string
  value?: string | { light: string; dark: string }
  tableData?: TableData
  chartData?: { body: string | { light: string; dark: string } }
  docs?: any[]
  metaAnalysis?: OutputSectionResponse
  completed?: boolean
  docUuid?: string
  index?: number
}

export type ExpandTrigger = {
  open: boolean
  reset: boolean
}

export type AggregatorResponse = {
  docId: string
  prompts: AggregatorPrompt[]
}

export type AggregatorPrompt = {
  prompt: string
  title: string
  response: string
}
