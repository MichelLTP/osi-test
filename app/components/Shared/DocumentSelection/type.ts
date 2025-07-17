import { FilterData } from "../Filters/types"
import { Document } from "@/components/LitePaper/types"
import { DocumentOption } from "@/components/ui/MultipleSelectorV2/types"

export interface DocumentSelectionProps {
  openSiDocs: Document[]
  privateDocs?: Document[]
  selectedOpenSiDocs: Document[]
  selectedPrivateDocs?: Document[]
  fileTypes: FileTypes
  onFileUpload: (acceptedFiles: DocumentOption[]) => void
  onCancelUpload: (file: Document) => void
  handleShowFilters: () => void
  filters: FilterData
  shouldLoadDocs?: (dbLoad: boolean, privateLoad: boolean) => void
  checkboxSize?: "xs" | "sm" | "md"
  isDocUploadEnabled?: boolean
  hasCheckboxes?: boolean
  isSelectedDocsScrollable?: boolean
  scrollableCount?: number
  singleSelection?: boolean
  filterSelectedDocs?: boolean
}

export type FileTypes = "openSi" | "private" | "both" | "none"
