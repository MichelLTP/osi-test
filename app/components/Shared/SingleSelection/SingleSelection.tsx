import {
  Select,
  SelectItem,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select/Select"
import clsx from "clsx"
import React from "react"
import { SingleSelectionProps } from "@/components/Shared/SingleSelection/types"

const SingleSelection = ({
  placeholder,
  contentClasses,
  triggerClasses,
  options: propOptions,
  defaultValue,
  handleValueChange,
  disabled,
  value = null,
}: SingleSelectionProps): React.ReactNode => {
  const defaultOptions = [{ value: " ", label: " ", disabled: false }]

  const options = (propOptions || defaultOptions).map((option) => ({
    ...option,
    value: String(option.value),
  }))

  const triggerClass = clsx(
    "rounded-xs dark:bg-secondary-dark dark:text-white input-focus bg-third",
    triggerClasses,
    disabled && "opacity-30"
  )

  const contentClass = clsx(
    "rounded-xs shadow-md bg-third dark:bg-secondary-dark dark:text-white input-focus border border-transparent",
    contentClasses
  )

  return (
    <Select
      key={value ? `key-${value}` : `key-placeholder`}
      value={value || undefined}
      defaultValue={defaultValue}
      onValueChange={handleValueChange}
      disabled={disabled}
    >
      <SelectTrigger className={triggerClass}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className={contentClass}>
        {options.map((option) => (
          <SelectItem
            value={option.value}
            className="hover:bg-primary rounded-xs"
            key={crypto.randomUUID()}
            disabled={option.disabled || false}
          >
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

export default React.memo(SingleSelection)
