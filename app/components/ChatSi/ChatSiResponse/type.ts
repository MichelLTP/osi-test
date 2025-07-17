import { Bubble } from "@/components/Layout/Historybar/HistoryBubble/type"
import { QuestionProps } from "../ExampleQuestions/type"
import { FilterData } from "@/components/Shared/Filters/types"

export interface IChatSiProps {
  prompt: string[]
  promptResponse: IChatSiResponseProps[]
  whileYouWait?: string[]
  routerId: string
}

export interface MessageObject {
  type:
    | "document_sources"
    | "chunk_source"
    | "text"
    | "code"
    | "related_questions"
    | "end"
    | "id_metadata"
    | "plotly"
    | "status"
    | "table"
    | "pygwalker"
    | "internal_link"
    | "success"
  body: TaskItem[] | any
  dark?: {
    body: string
  }
  light?: {
    body: string
  }
}

export interface IChatSiResponseProps {
  messages: { message: string }[]
  jobID?: string
  exchange_id?: string
  sessionID?: string
  session_id?: string
  router?: string
  filters?: Record<string, unknown>
  feedback?: string
  isStreaming?: boolean
}

export interface FetcherData {
  whileYouWait?: string
  chatsi_ExampleQuestions?: QuestionProps[]
  chatSiHistoryResponse?: any
  chatSiHistory?: Bubble[]
  filters?: FilterData
}

export interface MetadataObject {
  type: "id_metadata"
  body: {
    session_id: string | null
    job_id: string | null
  }
}

export type SessionState = {
  expandedItems: string[]
  count: number
}

export interface TaskSectionProps {
  parsedMessages: MessageObject[]
}

export interface TaskItem {
  major: string
  detail: string
  state: "done" | "current" | "waiting"
}
