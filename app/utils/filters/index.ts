import { IChatSiResponseProps } from "@/components/ChatSi/ChatSiResponse/type"

export function countSelectedFields(
  filters: Record<string, unknown>,
  setIsFiltersSelected: (setIsFiltersSelected: boolean) => void
) {
  const selectedFiels = Object.values(filters).filter((value) => {
    return Array.isArray(value) && value.length !== 0
  }).length

  if (selectedFiels > 0) {
    setIsFiltersSelected(true)
  } else {
    setIsFiltersSelected(false)
  }
}

export const hasActiveFilters = (response: IChatSiResponseProps) => {
  if (response.filters) {
    return (
      Object.values(response?.filters).filter((value) => {
        return Array.isArray(value) && value.length !== 0
      }).length !== 0
    )
  }
}
