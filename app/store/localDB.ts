import { DBLoadState } from "@/components/Shared/LoadFromDB/type"
import { create } from "zustand"
import { Document } from "@/components/LitePaper/types"
import { DocumentOption } from "@/components/ui/MultipleSelectorV2/types"

export interface DocumentInfo {
  filename: string
  id: string
}

export interface AllDocuments {
  private_documents: DocumentInfo[]
  opensi_documents: DocumentInfo[]
}

export type LocalDBFiles = {
  dbLoad: boolean
  privateLoad: boolean
  localDBFiles: DocumentOption[]
  localPrivateFiles: DocumentOption[]
  isLoadingDocs: DBLoadState
  setLocalDBFiles: (files: DocumentOption[]) => void
  setLocalPrivateFiles: (files: DocumentOption[]) => void
  setNeedLoadState: (dbLoad: boolean, privateLoad: boolean) => void
  setIsLoadingDocs: (state: DBLoadState) => void
  allDocs: AllDocuments
  setAllDocs: (data: AllDocuments) => void
  resetAllDocs: () => void
  addPrivateDocument: (document: DocumentInfo) => void
  removePrivateDocument: (documentId: string) => void
  addOpensiDocument: (document: DocumentInfo) => void
  removeOpensiDocument: (documentId: string) => void
  removeAllDocuments: () => void
  preventDocsReset: boolean
  setPreventDocsReset: (newState: boolean) => void
  handleFileUpload: (acceptedFiles: DocumentOption[]) => void
  handleCancelUpload: (file: Document) => void
}

const initialState: AllDocuments = {
  private_documents: [],
  opensi_documents: [],
}

const useLocalDBFilesStore = create<LocalDBFiles>((set) => ({
  dbLoad: false,
  privateLoad: false,
  localDBFiles: [],
  localPrivateFiles: [],
  isLoadingDocs: DBLoadState.INITIAL,
  preventDocsReset: false,
  setNeedLoadState: (dbLoad: boolean, privateLoad: boolean) =>
    set({ dbLoad, privateLoad }),
  setLocalDBFiles: (files: DocumentOption[]) => set({ localDBFiles: files }),
  setLocalPrivateFiles: (files: DocumentOption[]) =>
    set({ localPrivateFiles: files }),
  setIsLoadingDocs: (state: DBLoadState) => set({ isLoadingDocs: state }),
  allDocs: initialState,
  setAllDocs: (allDocs) => set({ allDocs }),
  resetAllDocs: () => set({ allDocs: initialState }),
  addPrivateDocument: (document) =>
    set((state) => ({
      allDocs: {
        ...state.allDocs,
        private_documents: [...state.allDocs.private_documents, document],
      },
    })),

  removePrivateDocument: (documentId) =>
    set((state) => {
      const documentIndex = state.allDocs.private_documents.findIndex(
        (doc) => doc.id === documentId
      )

      if (documentIndex === -1) return state

      const updatedDocuments = [...state.allDocs.private_documents]
      updatedDocuments.splice(documentIndex, 1)

      return {
        allDocs: {
          ...state.allDocs,
          private_documents: updatedDocuments,
        },
      }
    }),

  addOpensiDocument: (document) =>
    set((state) => ({
      allDocs: {
        ...state.allDocs,
        opensi_documents: [...state.allDocs.opensi_documents, document],
      },
    })),

  removeOpensiDocument: (documentId) =>
    set((state) => {
      const documentIndex = state.allDocs.opensi_documents.findIndex(
        (doc) => doc.id === documentId
      )

      if (documentIndex === -1) return state

      const updatedDocuments = [...state.allDocs.opensi_documents]
      updatedDocuments.splice(documentIndex, 1)

      return {
        allDocs: {
          ...state.allDocs,
          opensi_documents: updatedDocuments,
        },
      }
    }),
  removeAllDocuments: () => {
    set((state) => ({
      allDocs: {
        ...state.allDocs,
        opensi_documents: [],
        private_documents: [],
      },
    }))
  },
  setPreventDocsReset: (newState) =>
    set(() => ({ preventDocsReset: newState })),
  handleFileUpload: (acceptedFiles) => {
    set((state) => {
      let newPrivateDocs = [...state.allDocs.private_documents]
      let newOpensiDocs = [...state.allDocs.opensi_documents]

      acceptedFiles.forEach((file) => {
        const extractedData = {
          filename: file.label,
          id: file.value,
        }

        if (file.isPrivate) {
          if (!newPrivateDocs.some((doc) => doc.id === extractedData.id)) {
            newPrivateDocs.push(extractedData)
          }
        } else {
          if (!newOpensiDocs.some((doc) => doc.id === extractedData.id)) {
            newOpensiDocs.push(extractedData)
          }
        }
      })

      return {
        allDocs: {
          ...state.allDocs,
          private_documents: newPrivateDocs,
          opensi_documents: newOpensiDocs,
        },
      }
    })
  },
  handleCancelUpload: (file) => {
    const action = file.isPrivate
      ? "removePrivateDocument"
      : "removeOpensiDocument"
    useLocalDBFilesStore.getState()[action](file.id)
  },
}))

export default useLocalDBFilesStore
