export type RelatedDocBoxProps = {
  title: string
  detail?: string
  isBookmarked: boolean
  onBookmarkClick: (e: React.MouseEvent) => void
  docId: string | number
}
