import { Document } from "@/components/LitePaper/types"

export interface File {
  doc_id: string
  doc_name: string
}

export interface Option {
  value: string | number
  label: string
}

export interface LoadFromDBProps {
  files: File[] | Option[] | Document[]
  uploadFile: (file: File[] | string[] | Document[]) => void
  variant?: "documents" | "default"
}

export enum DBLoadState {
  INITIAL,
  LOADING,
  LOADED,
  DONE,
  ERROR,
}
