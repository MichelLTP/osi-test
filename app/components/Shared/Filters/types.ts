export interface FilterField {
  key: string
  label: string
  type: string
  options?: Array<{ value: string; label: string }>
  value?: string
}

export interface FilterGroup {
  title: string
  fields: FilterField[]
}

export interface FilterData {
  description: string
  groups: FilterGroup[]
}

export interface FetcherData {
  filters?: FilterData
}

export interface FiltersProps {
  filterData: FilterData
  setShowFilters: React.Dispatch<React.SetStateAction<boolean>>
  litePaperUuids?: { childUuid: string; parentUuid: string }
}
