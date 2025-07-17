import { IconDefinition } from "@fortawesome/fontawesome-svg-core"

export interface ToolbarProps {
  pdfUrl: string
  currentPage: number
  totalPages: number
  nextPage: () => void
  previousPage: () => void
  printPdf: () => void
  toggleFullScreen: () => void
}

export interface ToolbarButtonProps {
  icon: IconDefinition
  onClick: () => void
  tooltip: string
}
