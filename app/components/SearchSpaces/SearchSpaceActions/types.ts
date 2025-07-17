export interface SearchSpaceActionsProps {
  hideInsightButton?: boolean
  searchSpaceId?: string
  docs?: {
    doc_ids: string[]
    doc_names: string[]
  }
  onDelete?: () => void
}
