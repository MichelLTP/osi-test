import * as React from "react"

type OptionItem = { [key: string]: string }

export type SelectedBubbleTypes = "all" | "group" | "subgroup" | "option"

interface ColumnProps {
  groupColumn: string
  valueColumn: string
  labelColumn: string
  subgroupColumn?: string
  title?: string
  options: OptionItem[]
}

export interface FilterSelectProps extends ColumnProps {
  handleValueChange: (value: number[]) => void
  defaultValues?: number[]
}

export interface SelectedBubblesProps extends ColumnProps {
  groups: string[]
  showAllBadge: boolean
  selectedValues: string[] | number[]
  isGroupFullySelected: (group: string) => boolean
  isSubGroupFullySelected?: (group: string, subGroup: string) => boolean
  handleGroupChange: (group: string) => void
  handleSubGroupChange?: (group: string, subGroup: string) => void
  handleOptionChange: (value: string) => void
  handleDeselectAll: () => void
}

export interface GroupItemProps {
  group: string
  groupOptions: Record<string, any>[]
  subGroups: string[]
  isGroupSelected: boolean
  handleGroupClick: (e: React.MouseEvent) => void
  renderOption: (option: Record<string, any>) => React.ReactNode
  renderSubGroup: (group: string, subGroup: string) => React.ReactNode
  isLastGroup: boolean
  lastGroupRef: (node: HTMLDivElement) => void
}