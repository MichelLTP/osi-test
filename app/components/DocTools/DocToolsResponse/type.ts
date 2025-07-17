export interface IDocToolsProps {
  prompt: string[]
  promptResponse: IDocToolsResponseProps[]
  whileYouWait?: string
}

export interface MessageObject {
  type:
    | "document_sources"
    | "text"
    | "code"
    | "related_questions"
    | "end"
    | "id_metadata"
    | "plotly"
    | "status"
    | "table"
  body: string
}

export interface IDocToolsResponseProps {
  messages: { message: string }[]
  sessionID?: string | null
}

export interface OutletContext {
  history: Array<{ title: string; session_id: string }> | null
}
