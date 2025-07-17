import { ReactNode } from "react"

export interface ConfirmationProps {
  onConfirm: () => void
  onCancel?: () => void
  children: ReactNode
  confirmationHeader: string
  confirmationMessage?: string
  buttonAction?: string
  direction?: "top" | "bottom" | "right" | "left"
  align?: "end" | "center" | "start"
}
