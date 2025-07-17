export interface VirtualizedComboboxProps {
  options: Option[]
  searchPlaceholder?: string
  selectedOption: string
  onSelectOption: (option: string) => void
  disabled?: boolean
  sortAlphabetically?: boolean
  customHeight?: string
}

export type Option = {
  value: string
  label: string
}

export interface VirtualizedCommandProps {
  height: string
  options: Option[]
  placeholder: string
  selectedOption: string
  onSelectOption?: (option: string) => void
  sortAlphabetically?: boolean
}
