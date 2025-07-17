export interface DashboardOptionsProps {
  options: GraphOptions
  onOptionChange: (option: keyof GraphOptions, value: string | boolean) => void
  availableYears: number[]
  onIsDoubleContextChange?: (value: boolean) => void
  currentYear: number
}

export type GraphOptions = {
  period: PeriodGranularity
  isDoubleContext: boolean
  baseline: string
  activeYear: any
}

export type PeriodGranularity = "yearly" | "monthly"

export interface SelectedBubblesProps {
  placeholder: string
  groups: string[]
  options: { [key: string]: any }[]
  selectedValues: string[] | number[]
  isGroupFullySelected: (group: string) => boolean
  handleGroupChange: (group: string) => void
  handleOptionChange: (value: number) => void
  groupColumn?: string
  maxBubbles?: number
  valueColumn: string
  labelColumn: string
}
