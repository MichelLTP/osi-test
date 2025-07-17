import { create } from "zustand"

// SIDEBAR
export type CloseSidebar = {
  close: boolean
  setClose: (value: boolean) => void
}

export const useCloseSidebar = create<CloseSidebar>((set) => ({
  close: true,
  setClose: () => set((state: any) => ({ close: !state.close })),
}))

// History bar
export type CloseHistorybar = {
  isHistorybarOpen: boolean
  setIsHistorybarOpen: (value: boolean) => void
}

export const useHistorybar = create<CloseHistorybar>((set) => ({
  isHistorybarOpen: false,
  setIsHistorybarOpen: (isHistorybarOpen) => set({ isHistorybarOpen }),
}))

type setLoadingState = {
  loadingState: boolean
  setLoadingState: (state: boolean) => void
}

export const useLoadingState = create<setLoadingState>((set) => ({
  loadingState: false,
  setLoadingState: (state: boolean) => set(() => ({ loadingState: state })),
}))

type setloadingFiltersState = {
  loadingFilters: boolean
  setLoadingFilters: (state: boolean) => void
}

export const useLoadingFilters = create<setloadingFiltersState>((set) => ({
  loadingFilters: false,
  setLoadingFilters: (state: boolean) => set(() => ({ loadingFilters: state })),
}))
