import { Document } from "@/components/LitePaper/types"

export type FileType = File | string | DBFileInfo

export interface DBFileInfo {
  doc_name?: string
  name?: string
  label?: string
  doc_id?: string | number
}

export interface FileUploadProgressProps {
  acceptedFiles: FileType[] | Document[]
  onCancelUpload?: (file: FileType | string) => void
  loading?: boolean
  variant?: "documents" | "default"
  className?: string
  isScrollable?: boolean
  scrollableCount?: number
}
