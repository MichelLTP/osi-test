import { SourceType } from "@/components/Shared/ChunkSource/types"
import { create } from "zustand"

export type SourceState = {
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

const initialSourceState = {
  title: "",
  images: [
    "/public/img/sourceImages/a.png",
    "/public/img/sourceImages/b.png",
    "/public/img/sourceImages/c.png",
    "/public/img/sourceImages/d.png",
    "/public/img/sourceImages/e.png",
    "/public/img/sourceImages/f.png",
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
