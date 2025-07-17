import * as React from "react"
import { forwardRef, useEffect, useLayoutEffect } from "react"
import { Command as CommandPrimitive, useCommandState } from "cmdk"
import { Loader2, X } from "lucide-react"
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from "../Command/Command"
import { cn } from "@/utils/shadcn/utils"
import { Badge } from "../Badge/Badge"
import {
  ExtendedMultipleSelectorProps,
  GroupOption,
  MultipleSelectorRef,
  Option,
} from "./types"
import clsx from "clsx"

export function useDebounce<T>(value: T, delay?: number): T {
  const [debouncedValue, setDebouncedValue] = React.useState<T>(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay || 500)
    return () => {
      clearTimeout(timer)
    }
  }, [value, delay])

  return debouncedValue
}

function transToGroupOption(options: Option[], groupBy?: string) {
  if (!Array.isArray(options)) {
    console.warn("Options is not an array in transToGroupOption")
    return {}
  }

  if (options.length === 0) {
    return {}
  }

  if (!groupBy) {
    return {
      "": options,
    }
  }

  const groupOption: GroupOption = {}
  options.forEach((option) => {
    if (!option) {
      console.warn("Undefined option found in options array")
      return
    }
    const key = (option[groupBy] as string) || ""
    if (!groupOption[key]) {
      groupOption[key] = []
    }
    groupOption[key].push(option)
  })

  return groupOption
}

function removePickedOption(groupOption: GroupOption, picked: Option[]) {
  if (!groupOption || !Array.isArray(picked)) {
    console.warn("Invalid arguments in removePickedOption")
    return {}
  }

  try {
    const cloneOption = JSON.parse(JSON.stringify(groupOption)) as GroupOption

    for (const [key, value] of Object.entries(cloneOption)) {
      if (!Array.isArray(value)) {
        console.warn(`Value for key ${key} is not an array:`, value)
        continue
      }
      cloneOption[key] = value.filter(
        (val) => !picked.find((p) => p?.value === val?.value)
      )
    }
    return cloneOption
  } catch (error) {
    console.error("Error in removePickedOption:", error)
    return {}
  }
}

function isOptionsExist(groupOption: GroupOption, targetOption: Option[]) {
  if (!groupOption || !Array.isArray(targetOption)) {
    return false
  }

  for (const [, value] of Object.entries(groupOption)) {
    if (
      Array.isArray(value) &&
      value.some((option) =>
        targetOption.find((p) => p?.value === option?.value)
      )
    ) {
      return true
    }
  }
  return false
}

// Hook to detect dropdown position based on parent container
function useDropdownPosition(
  open: boolean,
  dropdownRef: React.RefObject<HTMLDivElement>,
  filtersModalRef?: React.RefObject<HTMLElement>
) {
  const [shouldOpenUpward, setShouldOpenUpward] = React.useState(false)

  useLayoutEffect(() => {
    if (!open || !dropdownRef.current) {
      setShouldOpenUpward(false)
      return
    }

    const container = dropdownRef.current
    const rect = container.getBoundingClientRect()
    const estimatedDropdownHeight = 200

    let spaceBelow: number
    let spaceAbove: number

    if (filtersModalRef?.current) {
      // Calculate relative to parent container with more precision
      const parentRect = filtersModalRef.current.getBoundingClientRect()

      // Calculate available space within the parent container
      spaceBelow = parentRect.bottom - rect.bottom
      spaceAbove = rect.top - parentRect.top

      // Add some padding to prevent dropdowns from touching the edges
      const padding = 10
      spaceBelow -= padding
      spaceAbove -= padding
    } else {
      // Fall back to viewport calculation
      const viewportHeight = window.innerHeight
      spaceBelow = viewportHeight - rect.bottom
      spaceAbove = rect.top
    }

    // If there's not enough space below but there's more space above, open upward
    if (spaceBelow < estimatedDropdownHeight && spaceAbove > spaceBelow) {
      setShouldOpenUpward(true)
    } else {
      setShouldOpenUpward(false)
    }
  }, [open, dropdownRef, filtersModalRef])

  return shouldOpenUpward
}

const CommandEmpty = forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof CommandPrimitive.Empty>
>(({ className, ...props }, forwardedRef) => {
  const render = useCommandState((state) => state.filtered.count === 0)

  if (!render) return null

  return (
    <div
      ref={forwardedRef}
      className={cn("py-6 text-center text-sm", className)}
      role="presentation"
      {...props}
    />
  )
})

CommandEmpty.displayName = "CommandEmpty"

const MultipleSelector = React.forwardRef<
  MultipleSelectorRef,
  ExtendedMultipleSelectorProps
>(
  (
    {
      value,
      onChange,
      placeholder,
      defaultOptions: arrayDefaultOptions = [],
      options: arrayOptions,
      delay,
      onSearch,
      loadingIndicator,
      emptyIndicator,
      maxSelected = Number.MAX_SAFE_INTEGER,
      onMaxSelected,
      hidePlaceholderWhenSelected,
      disabled,
      groupBy,
      className,
      badgeClassName,
      selectFirstItem = true,
      creatable = false,
      triggerSearchOnFocus = false,
      commandProps,
      inputProps,
      onBlur,
      filtersModalRef,
    }: ExtendedMultipleSelectorProps,
    ref: React.Ref<MultipleSelectorRef>
  ) => {
    const inputRef = React.useRef<HTMLInputElement>(null)
    const dropdownRef = React.useRef<HTMLDivElement>(null)
    const [open, setOpen] = React.useState(false)
    const [isLoading, setIsLoading] = React.useState(false)

    const [selected, setSelected] = React.useState<Option[]>(value || [])
    const [options, setOptions] = React.useState<GroupOption>(() => {
      return transToGroupOption(arrayDefaultOptions || [], groupBy)
    })
    const [inputValue, setInputValue] = React.useState("")
    const debouncedSearchTerm = useDebounce(inputValue, delay || 500)

    // Use enhanced hook with parent container support
    const shouldOpenUpward = useDropdownPosition(
      open,
      dropdownRef,
      filtersModalRef
    )

    React.useImperativeHandle(
      ref,
      () => ({
        selectedValue: selected || [],
        input: inputRef.current as HTMLInputElement,
        focus: () => inputRef.current?.focus(),
      }),
      [selected]
    )

    const handleUnselect = React.useCallback(
      (option: Option) => {
        if (!Array.isArray(selected)) {
          console.warn("Selected is not an array in handleUnselect")
          return
        }
        const newOptions = selected.filter((s) => s.value !== option.value)
        setSelected(newOptions)
        onChange?.(newOptions)
        setOpen(false)
      },
      [onChange, selected]
    )

    const handleKeyDown = React.useCallback(
      (e: React.KeyboardEvent<HTMLDivElement>) => {
        const input = inputRef.current
        if (input) {
          if (e.key === "Delete" || e.key === "Backspace") {
            if (input.value === "" && selected.length > 0) {
              const lastSelectOption = selected[selected.length - 1]
              if (!lastSelectOption.fixed) {
                handleUnselect(selected[selected.length - 1])
              }
            }
          }
          if (e.key === "Escape") {
            input.blur()
          }
        }
      },
      [handleUnselect, selected]
    )

    useEffect(() => {
      if (Array.isArray(value)) {
        setSelected(value)
      }
    }, [value])

    useEffect(() => {
      if (!arrayOptions || onSearch) {
        return
      }
      const newOption = transToGroupOption(arrayOptions || [], groupBy)
      if (JSON.stringify(newOption) !== JSON.stringify(options)) {
        setOptions(newOption)
      }
    }, [arrayDefaultOptions, arrayOptions, groupBy, onSearch, options])

    useEffect(() => {
      const doSearch = async () => {
        setIsLoading(true)
        try {
          const res = await onSearch?.(debouncedSearchTerm)
          setOptions(transToGroupOption(res || [], groupBy))
        } catch (error) {
          console.error("Search error:", error)
        } finally {
          setIsLoading(false)
        }
      }

      const exec = async () => {
        if (!onSearch || !open) return

        if (triggerSearchOnFocus) {
          await doSearch()
        }

        if (debouncedSearchTerm) {
          await doSearch()
        }
      }

      void exec()
    }, [debouncedSearchTerm, groupBy, open, onSearch, triggerSearchOnFocus])

    const CreatableItem = () => {
      if (!creatable) return undefined

      if (
        isOptionsExist(options, [{ value: inputValue, label: inputValue }]) ||
        selected.find((s) => s.value === inputValue)
      ) {
        return undefined
      }

      const Item = (
        <CommandItem
          value={inputValue}
          className="cursor-pointer"
          onMouseDown={(e) => {
            e.preventDefault()
            e.stopPropagation()
          }}
          onSelect={(value: string) => {
            if (selected.length >= maxSelected) {
              onMaxSelected?.(selected.length)
              return
            }
            setInputValue("")
            const newOption = { value, label: value }
            const newOptions = [...(selected || []), newOption]
            setSelected(newOptions)
            onChange?.(newOptions)
          }}
        >
          {`Create "${inputValue}"`}
        </CommandItem>
      )

      if (!onSearch && inputValue.length > 0) {
        return Item
      }

      if (onSearch && debouncedSearchTerm.length > 0 && !isLoading) {
        return Item
      }

      return undefined
    }

    const EmptyItem = React.useCallback(() => {
      if (!emptyIndicator) return undefined

      if (onSearch && !creatable && Object.keys(options).length === 0) {
        return (
          <CommandItem value="-" disabled>
            {emptyIndicator}
          </CommandItem>
        )
      }

      return <CommandEmpty>{emptyIndicator}</CommandEmpty>
    }, [creatable, emptyIndicator, onSearch, options])

    const selectables = React.useMemo<GroupOption>(() => {
      return removePickedOption(options, selected || [])
    }, [options, selected])

    const commandFilter = React.useCallback(() => {
      if (commandProps?.filter) {
        return commandProps.filter
      }

      if (creatable) {
        return (value: string, search: string) => {
          return value.toLowerCase().includes(search.toLowerCase()) ? 1 : -1
        }
      }
      return undefined
    }, [creatable, commandProps?.filter])
    return (
      <Command
        {...commandProps}
        onKeyDown={(e) => {
          handleKeyDown(e)
          commandProps?.onKeyDown?.(e)
        }}
        className={cn(
          "h-auto overflow-visible bg-transparent",
          commandProps?.className
        )}
        shouldFilter={
          commandProps?.shouldFilter !== undefined
            ? commandProps.shouldFilter
            : !onSearch
        }
        filter={commandFilter()}
      >
        <div
          ref={dropdownRef}
          role="button"
          tabIndex={0}
          onKeyDown={() => {}}
          className={cn(
            "flex w-full min-h-[45px] max-h-[105px] rounded-xs px-2 py-[4.75px] text-sm ring-offset-background cursor-text overflow-auto styled-scrollbar",
            {
              "px-3 py-2": selected.length !== 0,
              "cursor-text": !disabled && selected.length !== 0,
            },
            className
          )}
          onClick={() => {
            if (disabled) return
            inputRef.current?.focus()
          }}
        >
          <div className="flex flex-wrap gap-2 w-full">
            {selected.map((option) => {
              return (
                <Badge
                  key={option.value}
                  className={cn(
                    "text-white data-[disabled]:bg-muted-foreground data-[disabled]:text-muted data-[disabled]:hover:bg-muted-foreground m-0",
                    "data-[fixed]:bg-muted-foreground data-[fixed]:text-muted data-[fixed]:hover:bg-muted-foreground",
                    badgeClassName
                  )}
                  data-fixed={option.fixed}
                  data-disabled={disabled || undefined}
                >
                  {option.label}
                  <button
                    className={cn(
                      "ml-1 rounded-full outline-none ring-offset-background",
                      (disabled || option.fixed) && "hidden"
                    )}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleUnselect(option)
                      }
                    }}
                    onMouseDown={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                    }}
                    onClick={() => handleUnselect(option)}
                  >
                    <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                  </button>
                </Badge>
              )
            })}
            <CommandPrimitive.Input
              {...inputProps}
              ref={inputRef}
              value={inputValue}
              onValueChange={(value) => {
                setInputValue(value)
                inputProps?.onValueChange?.(value)
              }}
              onBlur={(event) => {
                onBlur?.(selected)
                setOpen(false)
                inputProps?.onBlur?.(event)
              }}
              onFocus={(event) => {
                if (!open) {
                  setOpen(true)
                }
                triggerSearchOnFocus && onSearch?.(debouncedSearchTerm)
                inputProps?.onFocus?.(event)
              }}
              placeholder={
                hidePlaceholderWhenSelected && selected.length !== 0
                  ? ""
                  : placeholder
              }
              className={cn(
                "flex-1 bg-transparent outline-none placeholder:text-muted-foreground",
                {
                  "w-full": hidePlaceholderWhenSelected,
                  "px-3 py-2": selected.length === 0,
                  "ml-1": selected.length !== 0,
                },
                inputProps?.className
              )}
              disabled={disabled}
            />
          </div>
          {disabled && (
            <div className="my-auto">
              <Loader2 className={clsx("animate-spin w-5 h-5 text-primary")} />
            </div>
          )}
        </div>
        <div className="relative">
          {open && !disabled && (
            <CommandList
              className={cn(
                "absolute z-10 w-full rounded-sm border bg-popover text-popover-foreground shadow-md outline-none animate-in bg-white dark:bg-secondary-dark",
                // Dynamic positioning based on collision detection
                shouldOpenUpward ? "bottom-[45px]" : "top-1",
                {
                  hidden: Object.keys(selectables).every(
                    (key) => selectables[key].length === 0
                  ),
                }
              )}
              onMouseDown={(e) => {
                e.preventDefault()
                e.stopPropagation()
              }}
            >
              {isLoading ? (
                <>{loadingIndicator}</>
              ) : (
                <>
                  {EmptyItem()}
                  {CreatableItem()}
                  {!selectFirstItem && (
                    <CommandItem value="-" className="hidden" />
                  )}
                  {Object.entries(selectables).map(([key, dropdowns]) => (
                    <CommandGroup
                      key={key}
                      heading={key}
                      className="h-full overflow-auto max-h-[200px] styled-scrollbar"
                    >
                      <>
                        {dropdowns.map((option) => {
                          return (
                            <CommandItem
                              key={option.value}
                              value={option.value}
                              onMouseDown={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                              }}
                              onSelect={() => {
                                if (selected.length >= maxSelected) {
                                  onMaxSelected?.(selected.length)
                                  return
                                }
                                setInputValue("")
                                const newOptions = [...(selected || []), option]
                                setSelected(newOptions)
                                onChange?.(newOptions)
                              }}
                              className={cn(
                                "cursor-pointer hover:bg-primary rounded-xs hover:text-white",
                                option.disable &&
                                  "cursor-default text-muted-foreground"
                              )}
                            >
                              {option.label}
                            </CommandItem>
                          )
                        })}
                      </>
                    </CommandGroup>
                  ))}
                </>
              )}
            </CommandList>
          )}
        </div>
      </Command>
    )
  }
)

MultipleSelector.displayName = "MultipleSelector"
export default MultipleSelector
