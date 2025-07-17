import React from "react"

export interface Option {
  value: string
  label: string | React.ReactNode
  disabled?: boolean
}

export interface SingleSelectionProps {
  placeholder: string
  triggerClasses?: string
  contentClasses?: string
  options?: Option[]
  handleValueChange: (value: string) => void
  defaultValue?: string
  disabled?: boolean
  value?: string | null
}
