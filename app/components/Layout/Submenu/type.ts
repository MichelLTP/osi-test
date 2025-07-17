import { IconDefinition } from "@fortawesome/fontawesome-svg-core"

export interface SubmenuItemProps {
  icon: IconDefinition
  title: string
  description: string
  id?: string
  onClick: () => void
}

export interface SubmenuProps {
  items: SubmenuItem[]
}

export interface SubmenuItem {
  title: string
  description: string
  icon: IconDefinition
  path: string
  id: number
}
