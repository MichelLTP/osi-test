interface FilteredMetadata {
  publisher_name: string[]
  entity_name: string[]
  short_desc: string[]
  key_market: string[]
  document_type: string[]
  primary_categories: string[]
  primary_brands: string[]
  regions: string[]
  markets: string[]
  hq_or_market: string[]
  summary_id: string
  top_insights_id: string
  publication_date: string
  document_title: string
  knowledge_area: string[]
}

interface Metadata {
  doc_desc: string
  country: string
  pub_date: string
  summary: string
  top_insights: string
  filtered_metadata: FilteredMetadata
}

export interface SearchSiResultData {
  doc_id: string
  metadata: Metadata
  filename: string
  score: number
  feedback: string
  sessionID?: string
  jobID?: string
  prompt?: string
}

export interface SearchSiResultProps {
  response: SearchSiResultData
  setClipboardText?: (text: string) => void
  onExpandChange?: (docId: string) => void
  pdfUrl?: string
  scoreRender?: boolean
}

export interface InfoRowProps {
  label: string
  value: string | string[] | undefined
}

export interface PdfData {
  file: string
  type: string
  name: string
  docId: string
}

export interface LoaderData {
  searchSiResults: SearchSiResultData[] | null
  prompt: string | null
  data: PdfData | null
  jobId: string | null
}

export type PdfDataWithBlobURL = PdfData & { blobURL: string }

export interface HybridResponse {
  docs: SearchSiResultData[]
  prompt: string
}
