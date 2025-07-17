import { IconDefinition } from "@fortawesome/fontawesome-svg-core"
import React from "react"

export type ModalProps = {
  children: React.ReactNode
  title: string
  icon?: IconDefinition
  handleClose?: () => void
  size?: "small" | "default" | "big" | "x-small"
  variant?: "default" | "confirmation"
} & (
  | {
      variant: "confirmation"
      confirmationProps: ConfirmationProps
      hasCancel?: boolean
    }
  | { variant?: "default"; confirmationProps?: never; hasCancel?: never }
)

type ConfirmationProps = {
  actionText: string
  handleAction: () => void
}
