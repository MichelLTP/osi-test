import { IconDefinition } from "@fortawesome/fontawesome-svg-core"
import { ReactNode } from "react"

export type Items = {
  text: string
  action: () => void
  icon?: IconDefinition
  danger?: boolean
  showSpinner?: boolean
  disabled?: boolean
}

export type DropdownProps = {
  items: Items[]
  direction?: "top" | "bottom" | "right" | "left"
  customTrigger?: ReactNode
  align?: "end" | "center" | "start"
  yOffset?: number
  variant?: "grey" | "default"
  className?: string
}
