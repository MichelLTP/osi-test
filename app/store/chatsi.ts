import {
  faBookOpenReader,
  IconDefinition,
} from "@fortawesome/free-solid-svg-icons"
import { create } from "zustand"

type SetSocket = {
  handleStoreSubmit: (prompt: string, routerID?: string) => void
  setStoreHandlerSubmit: (
    fn: (prompt: string, routerID?: string) => void
  ) => void
}

export const useSSE = create<SetSocket>((set) => ({
  handleStoreSubmit: () => {},
  setStoreHandlerSubmit: (fn) => set(() => ({ handleStoreSubmit: fn })),
}))

type SetRouterID = {
  routerID: string
  setRouterID: (router: string) => void
}

export const useRouterID = create<SetRouterID>((set) => ({
  routerID: "docs",
  setRouterID: (router) => set(() => ({ routerID: router })),
}))

type searchMethodState = {
  searchMethod: string
  setSearchMethod: (newMethod: string) => void
}

export const useSearchMethod = create<searchMethodState>((set) => ({
  searchMethod: "auto",
  setSearchMethod: (newMethod) => set(() => ({ searchMethod: newMethod })),
}))

type ChatSiStreamingState = {
  isChatSiStreamingComplete: boolean
  setIsChatSiStreamingComplete: (newState: boolean) => void
}

export const useChatSiStreamingComplete = create<ChatSiStreamingState>(
  (set) => ({
    isChatSiStreamingComplete: true,
    setIsChatSiStreamingComplete: (newState) =>
      set(() => ({ isChatSiStreamingComplete: newState })),
  })
)

type SelectedRouterState = {
  selectedRouter: {
    title: string
    icon: IconDefinition
    id: string
  }
  setSelectedRouter: (router: { title: string; icon: IconDefinition }) => void
}

export const useSelectedRouter = create<SelectedRouterState>((set) => ({
  selectedRouter: {
    title: "All Documents",
    icon: faBookOpenReader,
    id: "docs",
  },
  setSelectedRouter: (router) => set(() => ({ selectedRouter: router })),
}))

type SetPreDefinedPrompt = {
  preDefinedPrompt: string
  SetPreDefinedPrompt: (preDefinedPrompt: string) => void
}

export const usePreDefinedPrompt = create<SetPreDefinedPrompt>((set) => ({
  preDefinedPrompt: "",
  SetPreDefinedPrompt: (preDefinedPrompt) =>
    set(() => ({ preDefinedPrompt: preDefinedPrompt })),
}))
