import { ReactNode } from "react"

export interface Subfeature {
  title: string
  description: string
  actionIcon?: ReactNode
  bgImg?: string
  link?: string
}

export interface Feature {
  disabled?: boolean
  icon?: ReactNode
  title: string
  description: string
  hoverText?: string
  link?: string
  bgImg?: string
  actionIcon?: ReactNode
  onclick?: () => void
  onVideoClick?: () => void
  subfeatures?: Subfeature[]
  hideOnMobile?: boolean
}
