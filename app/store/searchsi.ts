import { create } from "zustand"
import { SearchSiResultData } from "@/components/SearchSi/type"

type SetSearchMethod = {
  searchMethod: string
  setSearchMethod: (method: string) => void
  loadingSearchSI: boolean
  setLoadingSearchSI: (state: boolean) => void
}

export const useSearchMethod = create<SetSearchMethod>((set) => ({
  searchMethod: "",
  setSearchMethod: (method) => set(() => ({ searchMethod: method })),
  loadingSearchSI: false,
  setLoadingSearchSI: (state) => set(() => ({ loadingSearchSI: state })),
}))

type SearchResult = {
  searchResult: SearchSiResultData[]
  setSearchResult: (result: SearchSiResultData[]) => void
}

export const useSearchResult = create<SearchResult>((set) => ({
  searchResult: [],
  setSearchResult: (result) => set(() => ({ searchResult: result })),
}))
