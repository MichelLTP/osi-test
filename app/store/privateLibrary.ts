import { FileUploadState } from "@/components/Shared/UploadFile/types"
import { create } from "zustand"

export type PersonalFiles = {
  doc_name: string
  doc_id: string
}

export type PrivateLibraryState = {
  privateLibraryList: PersonalFiles[]
  setPrivateLibraryList: (documents: PersonalFiles[]) => void
  isPrivateLibraryLoading: boolean
  setIsPrivateLibraryLoading: (isLoading: boolean) => void
  isModalOpen: boolean
  setIsModalOpen: (isOpen: boolean) => void
  isFileUploaded: boolean
  setIsFileUploaded: (isFileUploaded: FileUploadState) => void
}

export const usePrivateLibrary = create<PrivateLibraryState>((set) => ({
  privateLibraryList: [],
  setPrivateLibraryList: (documents: PersonalFiles[]) =>
    set({ privateLibraryList: documents }),
  isPrivateLibraryLoading: false,
  setIsPrivateLibraryLoading: (isLoading: boolean) =>
    set({ isPrivateLibraryLoading: isLoading }),
  isModalOpen: false,
  setIsModalOpen: (isOpen: boolean) => set({ isModalOpen: isOpen }),
  isFileUploaded: false,
  setIsFileUploaded: (isFileUploaded: FileUploadState) =>
    set({ isFileUploaded: isFileUploaded === FileUploadState.DONE }),
}))
