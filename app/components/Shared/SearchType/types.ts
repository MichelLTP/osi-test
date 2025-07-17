import { IconDefinition } from "@fortawesome/fontawesome-svg-core"

export interface SearchOption {
  id: string
  icon: IconDefinition
  title: string
  description: string
  disabled: boolean
}

export interface SearchTypeProps {
  isDocumentRouter: boolean
  onSelectOption?: (option: SearchOption) => void
  selectedOption?: SearchOption | null
}
