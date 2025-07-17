import { IconDefinition } from "@fortawesome/free-solid-svg-icons"

export interface ActionItem {
  icon: IconDefinition
  tooltiptext: string
  onClick?: () => void
  disabled?: boolean
  className?: string
}

export interface DocumentActionProps {
  data: ActionItem[]
}
