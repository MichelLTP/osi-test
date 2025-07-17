export type PaginationProps = {
  currentPage: number
  setCurrentPage: (page: number) => void
  totalItems: number
  itemsPerPage?: number
  isModal?: boolean
}
