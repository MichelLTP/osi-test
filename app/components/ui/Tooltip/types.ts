import { IconDefinition } from "@fortawesome/free-solid-svg-icons"
import { IconProp } from "@fortawesome/fontawesome-svg-core"
import React from "react"

export interface TooltipProps {
  icon?: IconDefinition | IconProp
  text: string
  disabled?: boolean
  onClick?: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void
  className?: string
  children?: React.ReactNode
  sideOffset?: number
}
