export enum FileUploadState {
  INITIAL,
  UPLOADING,
  UPLOADED,
  DONE,
  ERROR,
}

export interface DBFile {
  doc_id: string
  doc_name: string
}

export type DBLoaderData = {
  receivedLocalDBFiles: DBFile[]
}

export interface AcceptedFile {
  name: string
  value: string
  label: string
  title?: string
  id?: string
}

export type FileType = "documents" | "images" | "audio" | "all"

export interface UploadFileProps {
  onUpload: (files: File[]) => void
  state?: FileUploadState
  acceptedFileTypes?: FileType
  maxFiles?: number
}
