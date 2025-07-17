import * as React from "react"
import { Command } from "@/components/ui/Command/Command"
import { Command as CommandPrimitive } from "cmdk"

export interface Option {
  value: string
  label: string
  disable?: boolean
  /** fixed option that can't be removed. */
  fixed?: boolean

  /** Group the options by providing key. */
  [key: string]: string | boolean | undefined
}

export type DocumentOption = Option & {
  custom?: string
  isPrivate?: boolean
  id?: string
  filename?: string
}

export interface GroupOption {
  [key: string]: Option[]
}

export interface MultipleSelectorProps {
  value?: Option[]
  defaultOptions?: Option[]
  options?: Option[]
  placeholder?: string
  loadingIndicator?: React.ReactNode
  triggerSearchOnFocus?: boolean
  onSearch?: (value: string) => Promise<Option[]>
  onSearchSync?: (value: string) => Option[]
  maxSelected?: number
  onMaxSelected?: (maxLimit: number) => void
  hidePlaceholderWhenSelected?: boolean
  disabled?: boolean
  groupBy?: string
  className?: string
  commandProps?: React.ComponentPropsWithoutRef<typeof Command>
  inputProps?: Omit<
    React.ComponentPropsWithoutRef<typeof CommandPrimitive.Input>,
    "value" | "placeholder" | "disabled"
  >
  handleSelection?: (option: string) => void
  onRemoveBadge?: (option: Option & { id: string }) => void
  showBadges?: boolean
}

export interface MultipleSelectorRef {
  selectedValue: Option[]
  input: HTMLInputElement
  focus: () => void
  reset: () => void
}
