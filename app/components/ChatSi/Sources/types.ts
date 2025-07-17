export interface SourceItemProps {
  title: string
  author: string
  rating: number
  variant?: "discovery" | "default"
  publisher: string
  publication_date: string
  index: number
  doc_id: number
  url?: string
}

export interface SourcesProps {
  sources: string
  variant?: "discovery" | "default"
}
