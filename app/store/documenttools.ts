import { SummarizationResponseProps } from "@/components/DocTools/Summarization/types"
import { create } from "zustand"
import { FileUploadState } from "@/components/Shared/UploadFile/types"
import { Option } from "@/components/Shared/LoadFromDB/type"

interface SummarizationState {
  summarizationResponses: SummarizationResponseProps[]
  setSummarizationResponse: (newResponse: SummarizationResponseProps) => void
  isSummarizationResponseLoading: boolean
  setIsSummarizationResponseLoading: (
    isSummarizationResponseLoading: boolean
  ) => void
  isInputCollapsed: number
  setIsInputCollapsed: (isInputCollapsed: number) => void
  isOutputCollapsed: string
  setIsOutputCollapsed: (isOutputCollapsed: string) => void
  summarizationDocument: Option[]
  setSummarizationDocument: (document: Option[]) => void
}

export const useSummarizationStore = create<SummarizationState>((set) => ({
  summarizationResponses: [] as SummarizationResponseProps[],
  setSummarizationResponse: (newResponse) =>
    set({ summarizationResponses: [newResponse] }),
  isSummarizationResponseLoading: false,
  setIsSummarizationResponseLoading: (isSummarizationResponseLoading) =>
    set({ isSummarizationResponseLoading }),
  isInputCollapsed: 1,
  setIsInputCollapsed: (isInputCollapsed) => set({ isInputCollapsed }),
  isOutputCollapsed: "item-0",
  setIsOutputCollapsed: (isOutputCollapsed) => set({ isOutputCollapsed }),
  summarizationDocument: [],
  setSummarizationDocument: (document) =>
    set({ summarizationDocument: document }),
}))

interface DocumentQAState {
  docSessionID: string | null
  prompt: string
  writingStyle: string
  isLoading: boolean
  setIsLoading: (isLoading: boolean) => void
  isFileUploaded: boolean
  setIsFileUploaded: (isFileUploaded: FileUploadState) => void
  setDocSessionID: (docSessionID: string | null) => void
  setPrompt: (prompt: string) => void
  setWrittingStyle: (writingStyle: string) => void
}

export const useDocumentQAStore = create<DocumentQAState>((set) => ({
  docSessionID: null,
  prompt: "",
  writingStyle: "",
  isLoading: false,
  isFileUploaded: false,
  setIsLoading: (isLoading) => set({ isLoading }),
  setDocSessionID: (newDocSessionID) => set({ docSessionID: newDocSessionID }),
  setPrompt: (newPrompt) => set({ prompt: newPrompt }),
  setIsFileUploaded: (isFileUploaded: FileUploadState) =>
    set({ isFileUploaded: isFileUploaded === FileUploadState.DONE }),
  setWrittingStyle: (style) => set({ writingStyle: style }),
}))
