import { FileUploadState } from "@/components/Shared/UploadFile/types"

export type NewPaperProps = {
  uploadState: FileUploadState
  privateFiles: File[]
  onPrivateFileUpload: (acceptedFiles: File[]) => void
  onCancelPrivateFile: (file: File) => void
  handleSubmit: () => void
}
