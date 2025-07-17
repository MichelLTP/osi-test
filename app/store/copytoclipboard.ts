import { create } from "zustand"

type ContentIDProps = {
  contentID: string | null
  setContentID: (method: string) => void
}

export const useContentID = create<ContentIDProps>((set) => ({
  contentID: null,
  setContentID: (value) => set(() => ({ contentID: value })),
}))
