import { SourceType } from "@/components/Shared/ChunkSource/types"
import { create } from "zustand"

export interface SourceState {
  sourceState: SourceType
  setSourceState: (sourceState: SourceType) => void
  resetSourceState: () => void
  allSourcesState: SourceType[]
  setAllSourcesState: (allSourcesState: SourceType[]) => void
  isSourceImagesLoading: boolean
  setIsSourceImagesLoading: (isSourceImagesLoading: boolean) => void
  isSourceModalOpen: boolean
  setIsSourceModalOpen: (isSourceModalOpen: boolean) => void
  isSourceImageFullScreen: boolean
  setIsSourceImageFullScreen: (isSourceImageFullScreen: boolean) => void
  currentImageIndex: number
  setCurrentImageIndex: (currentImageIndex: number) => void
}

const initialSourceState: SourceType = {
  title: "",
  images: [
    "https://picsum.photos/1200/1200?random=1",
    "https://picsum.photos/1200/1200?random=2",
    "https://picsum.photos/1200/1200?random=3",
    "https://picsum.photos/1200/1200?random=4",
    "https://picsum.photos/1200/1200?random=6",
    "https://picsum.photos/1200/1200?random=7",
    "https://picsum.photos/1200/1200?random=8",
    "https://picsum.photos/1200/1200?random=9",
  ],
  author: "",
  date: "",
  ref: 0,
  pages: "",
  content: "",
  section: "",
  subsection: "",
  subsubsection: "",
}

export const useSource = create<SourceState>((set) => ({
  initialSourceState,
  sourceState: initialSourceState,
  setSourceState: (sourceState) => set({ sourceState }),
  resetSourceState: () => set({ sourceState: initialSourceState }),
  allSourcesState: [],
  setAllSourcesState: (allSourcesState) => set({ allSourcesState }),
  isSourceImagesLoading: false,
  setIsSourceImagesLoading: (isSourceImagesLoading) =>
    set({ isSourceImagesLoading }),
  isSourceModalOpen: false,
  setIsSourceModalOpen: (isSourceModalOpen) => set({ isSourceModalOpen }),
  isSourceImageFullScreen: false,
  setIsSourceImageFullScreen: (isSourceImageFullScreen) =>
    set({ isSourceImageFullScreen }),
  currentImageIndex: 0,
  setCurrentImageIndex: (currentImageIndex) => set({ currentImageIndex }),
}))
