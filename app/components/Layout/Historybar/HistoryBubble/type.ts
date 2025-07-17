export interface BubbleProps {
  bubble: Bubble
  variant?: string
}

export interface Bubble {
  title: string
  job_id?: string
  id?: string
  session_id?: string
  search_method?: string
  date?: string
  workspace_id?: string
}

export interface FetcherDataProps {
  deleteSingleHistory: number
}
