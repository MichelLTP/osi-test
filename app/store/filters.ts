import { FilterData } from "@/components/Shared/Filters/types"
import { create } from "zustand"

const emptyFilters = {
  earliest_publication_date: "2017-02-06T00:00:00Z",
  latest_publication_date: "2024-10-09T00:00:00Z",
  repository: [],
  publisher_researcher: [],
  document_title: [],
  document_topic: [],
  document_group: [],
  research_type: [],
  knowledge_area: [],
  primary_category: [],
  product_group: [],
  product_type: [],
  primary_brand: [],
  agency_entity_name: [],
  region: [],
  markets: [],
  jti_key_market: [],
  hq_or_market: [],
  router: [],
} as const

type FiltersState = {
  initialFiltersData: FilterData
  emptyFilters: typeof emptyFilters
  setInitialFiltersData: (initialFilters: FilterData) => void
  isFiltersSelected: boolean
  setIsFiltersSelected: (newState: boolean) => void
  filters: FilterData
  setFilters: (Filters: FilterData) => void
  updatedFilterData: FilterData
  setUpdatedFilterData: (Filters: FilterData) => void
  preventFiltersReset: boolean
  setPreventFiltersReset: (newState: boolean) => void
}

export const useFiltersStore = create<FiltersState>((set) => ({
  initialFiltersData: {} as FilterData,
  emptyFilters: emptyFilters,
  setInitialFiltersData: (initialFilters) =>
    set(() => ({ initialFiltersData: initialFilters })),
  isFiltersSelected: false,
  setIsFiltersSelected: (newState) =>
    set(() => ({ isFiltersSelected: newState })),
  filters: {} as FilterData,
  updatedFilterData: {} as FilterData,
  setUpdatedFilterData: (newFilters) =>
    set(() => ({ updatedFilterData: newFilters })),
  setFilters: (newFilters) => set(() => ({ filters: newFilters })),
  preventFiltersReset: false,
  setPreventFiltersReset: (newState) =>
    set(() => ({ preventFiltersReset: newState })),
}))
