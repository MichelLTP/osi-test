import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/Command/Command"
import { Command as CommandPrimitive, useCommandState } from "cmdk"
import { Loader2, X } from "lucide-react"
import * as React from "react"
import { forwardRef, useEffect } from "react"
import { cn } from "@/utils/shadcn/utils"
import { Badge } from "@/components/ui/Badge/Badge"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/Popover/Popover"
import clsx from "clsx"
import {
  GroupOption,
  MultipleSelectorProps,
  MultipleSelectorRef,
  Option,
} from "@/components/ui/MultipleSelectorV2/types"
import { PopoverAnchor } from "@radix-ui/react-popover"

function transToGroupOption(options: Option[], groupBy?: string) {
  if (options.length === 0) {
    return {}
  }
  if (!groupBy) {
    return {
      "": options,
    }
  }

  // Special logic for making Private docs first. All other groups will be sorted after it.
  const groupOption: GroupOption = {}
  const privateGroups: string[] = []
  const otherGroups: string[] = []

  options.forEach((option) => {
    const key = (option[groupBy] as string) || ""
    groupOption[key] = groupOption[key] || []
    groupOption[key].push(option)
    key.includes("Private") ? privateGroups.push(key) : otherGroups.push(key)
  })

  const orderedResult: GroupOption = {}
  privateGroups.sort().forEach((key) => (orderedResult[key] = groupOption[key]))
  otherGroups.sort().forEach((key) => (orderedResult[key] = groupOption[key]))

  return orderedResult
}

export function useDebounce<T>(value: T, delay?: number): T {
  const [debouncedValue, setDebouncedValue] = React.useState<T>(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay)

    return () => {
      clearTimeout(timer)
    }
  }, [value, delay])

  return debouncedValue
}

function removePickedOption(groupOption: GroupOption, picked: Option[]) {
  const cloneOption = JSON.parse(JSON.stringify(groupOption)) as GroupOption

  for (const [key, value] of Object.entries(cloneOption)) {
    cloneOption[key] = value.filter(
      (val) => !picked.find((p) => p.value === val.value)
    )
  }
  return cloneOption
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
      cmdk-empty=""
      role="presentation"
      {...props}
    />
  )
})

CommandEmpty.displayName = "CommandEmpty"

const MultipleSelectorV2 = React.forwardRef<
  MultipleSelectorRef,
  MultipleSelectorProps
>(
  (
    {
      value,
      placeholder,
      defaultOptions: arrayDefaultOptions = [],
      options: arrayOptions,
      onSearch,
      onSearchSync,
      loadingIndicator,
      maxSelected = Number.MAX_SAFE_INTEGER,
      onMaxSelected,
      hidePlaceholderWhenSelected,
      disabled,
      groupBy,
      className,
      triggerSearchOnFocus = false,
      commandProps,
      inputProps,
      handleSelection,
      onRemoveBadge,
      showBadges = true,
    }: MultipleSelectorProps,
    ref: React.Ref<MultipleSelectorRef>
  ) => {
    const inputRef = React.useRef<HTMLInputElement>(null)
    const delay = 500 // Default delay for debouncing
    const [open, setOpen] = React.useState(false)
    const [isLoading, setIsLoading] = React.useState(false)
    const dropdownRef = React.useRef<HTMLDivElement>(null) // Added this

    const [selected, setSelected] = React.useState<Option[]>(value || [])
    const [options, setOptions] = React.useState<GroupOption>(
      transToGroupOption(arrayDefaultOptions, groupBy)
    )
    const [inputValue, setInputValue] = React.useState("")
    const debouncedSearchTerm = useDebounce(inputValue, delay)

    React.useImperativeHandle(
      ref,
      () => ({
        selectedValue: [...selected],
        input: inputRef.current as HTMLInputElement,
        focus: () => inputRef?.current?.focus(),
        reset: () => setSelected([]),
      }),
      [selected]
    )

    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setOpen(false)
        inputRef.current.blur()
      }
    }

    const handleUnselect = React.useCallback(
      (option: Option) => {
        const newOptions = selected.filter((s) => s.value !== option.value)
        setSelected(newOptions)
        onRemoveBadge?.({ id: option.value, ...option })
      },
      [selected, onRemoveBadge]
    )

    const handleKeyDown = React.useCallback(
      (e: React.KeyboardEvent<HTMLDivElement>) => {
        const input = inputRef.current
        if (input) {
          if (e.key === "Delete" || e.key === "Backspace") {
            if (input.value === "" && selected.length > 0) {
              const lastSelectOption = selected[selected.length - 1]
              if (!showBadges) return // Only delete options with backspace
              if (lastSelectOption && !lastSelectOption.fixed) {
                handleUnselect(lastSelectOption)
              }
            }
          }
          // This is not a default behavior of the <input /> field
          if (e.key === "Escape") {
            input.blur()
          }
        }
      },
      [handleUnselect, selected]
    )

    useEffect(() => {
      if (open) {
        document.addEventListener("mousedown", handleClickOutside)
        document.addEventListener("touchend", handleClickOutside)
      } else {
        document.removeEventListener("mousedown", handleClickOutside)
        document.removeEventListener("touchend", handleClickOutside)
      }

      return () => {
        document.removeEventListener("mousedown", handleClickOutside)
        document.removeEventListener("touchend", handleClickOutside)
      }
    }, [open])

    useEffect(() => {
      if (value) {
        setSelected(value)
      }
    }, [value])

    useEffect(() => {
      /** If `onSearch` is provided, do not trigger options updated. */
      if (!arrayOptions || onSearch) {
        return
      }
      const newOption = transToGroupOption(arrayOptions || [], groupBy)
      if (JSON.stringify(newOption) !== JSON.stringify(options)) {
        setOptions(newOption)
      }
    }, [arrayDefaultOptions, arrayOptions, groupBy, onSearch, options])

    useEffect(() => {
      /** sync search */
      const doSearchSync = () => {
        const res = onSearchSync?.(debouncedSearchTerm) || []
        setOptions(transToGroupOption(Array.isArray(res) ? res : [], groupBy))
      }

      const exec = async () => {
        if (!onSearchSync || !open) return

        if (triggerSearchOnFocus) {
          doSearchSync()
        }

        if (debouncedSearchTerm) {
          doSearchSync()
        }
      }

      void exec()
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [debouncedSearchTerm, groupBy, open, triggerSearchOnFocus])

    useEffect(() => {
      /** async search */
      const doSearch = async () => {
        setIsLoading(true)
        let res = await onSearch?.(debouncedSearchTerm)
        if (!Array.isArray(res)) res = []
        setOptions(transToGroupOption(res, groupBy))
        setIsLoading(false)
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
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [debouncedSearchTerm, groupBy, open, triggerSearchOnFocus])

    const EmptyItem = React.useCallback(() => {
      // For async search that showing emptyIndicator
      if (onSearch && Object.keys(options).length === 0) {
        return (
          <CommandItem value="-" disabled>
            <p className="text-center text-lg leading-10 text-gray-600 dark:text-gray-400">
              no results found.
            </p>
          </CommandItem>
        )
      }

      return (
        <CommandEmpty>
          <p className="text-center text-lg leading-10 text-gray-600 dark:text-gray-400">
            no results found.
          </p>
        </CommandEmpty>
      )
    }, [onSearch, options])

    const selectables = React.useMemo<GroupOption>(
      () => removePickedOption(options, selected),
      [options, selected]
    )

    /** Avoid Creatable Selector freezing or lagging when paste a long string. */
    const commandFilter = React.useCallback(() => {
      if (commandProps?.filter) {
        return commandProps.filter
      }
      return undefined
    }, [commandProps?.filter])

    return (
      <Popover modal>
        <Command
          ref={dropdownRef}
          {...commandProps}
          onKeyDown={(e) => {
            handleKeyDown(e)
            commandProps?.onKeyDown?.(e)
          }}
          className={cn(
            "h-auto overflow-visible bg-transparent !styled-scrollbar flex-1 min-w-0",
            commandProps?.className
          )}
          shouldFilter={
            commandProps?.shouldFilter !== undefined
              ? commandProps.shouldFilter
              : !onSearch
          }
          filter={commandFilter()}
        >
          <PopoverAnchor>
            <div
              className={cn(
                "flex flex-wrap justify-start gap-2 items-center w-full rounded-xs border border-transparent focus-within:border-transparent bg-third dark:bg-secondary-dark text-secondary dark:text-white opacity text-base min-h-[45px] max-h-[108px] overflow-y-auto styled-scrollbar cursor-pointer",
                {
                  "cursor-text": !disabled && selected.length !== 0,
                },
                showBadges &&
                  hidePlaceholderWhenSelected &&
                  selected?.length > 0
                  ? " p-2"
                  : "",
                className
              )}
              onClick={() => {
                if (disabled) return
                inputRef?.current?.focus()
              }}
            >
              {showBadges &&
                selected.map((option) => {
                  return (
                    <Badge
                      key={option.value}
                      data-fixed={option.fixed}
                      data-disabled={disabled || undefined}
                      className={"m-0"}
                    >
                      {option.label}
                      <button
                        type="button"
                        className={cn(
                          "ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2",
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
              <PopoverTrigger asChild>
                <CommandPrimitive.Input
                  {...inputProps}
                  ref={inputRef}
                  value={inputValue}
                  disabled={disabled}
                  onValueChange={(value) => {
                    setInputValue(value)
                    inputProps?.onValueChange?.(value)
                  }}
                  onBlur={(event) => {
                    inputProps?.onBlur?.(event)
                  }}
                  onFocus={(event) => {
                    setOpen(true)
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
                      "py-2 min-h-[45px]": selected.length === 0,
                      "min-h-[45px]": selected.length !== 0,
                      "!min-h-auto":
                        selected.length !== 0 &&
                        showBadges &&
                        hidePlaceholderWhenSelected,
                    },
                    inputProps?.className
                  )}
                />
              </PopoverTrigger>

              {/* FIXME: The loading component for filters*/}
              {disabled && (
                <div className="my-auto mr-2">
                  <Loader2
                    className={clsx("animate-spin w-5 h-5 text-primary")}
                  />
                </div>
              )}
            </div>
          </PopoverAnchor>
          {open && (
            <PopoverContent
              className="!p-2 popover-content-width-full min-w-60 shadow-sm bg-third dark:bg-secondary-dark rounded-xs outline-none animate-in !styled-scrollbar"
              onOpenAutoFocus={(e) => e.preventDefault()}
              onCloseAutoFocus={(e) => e.preventDefault()}
              hasPortal={false}
            >
              <CommandList
                onMouseUp={() => {
                  inputRef?.current?.focus()
                }}
              >
                {isLoading ? (
                  <>{loadingIndicator}</>
                ) : (
                  <>
                    {EmptyItem()}
                    {Object.entries(selectables).map(([key, dropdowns]) => (
                      <CommandGroup
                        key={key}
                        heading={key}
                        className="h-full overflow-auto p-2 text-xl !font-bold [&_[cmdk-group-heading]]:text-sm [&_[cmdk-group-heading]]:font-bold [&:not(:last-of-type)]:border [&:not(:last-of-type)]:border-b !styled-scrollbar"
                      >
                        <>
                          {(dropdowns as Option[]).map((option) => {
                            return (
                              <CommandItem
                                key={option.value}
                                value={option.label}
                                disabled={option.disable}
                                onMouseDown={(e) => {
                                  e.preventDefault()
                                  e.stopPropagation()
                                }}
                                onPointerLeave={(event) =>
                                  event.preventDefault()
                                }
                                onPointerMove={(event) =>
                                  event.preventDefault()
                                }
                                onSelect={(e) => {
                                  const newOptions =
                                    maxSelected === 1
                                      ? [option]
                                      : selected.length < maxSelected
                                        ? [...selected, option]
                                        : selected

                                  setSelected(newOptions)

                                  if (
                                    maxSelected === 1 ||
                                    newOptions.length >= maxSelected
                                  ) {
                                    inputRef?.current?.blur()
                                    setOpen(false)
                                  } else if (selected.length >= maxSelected) {
                                    onMaxSelected?.(selected.length)
                                    setOpen(false)
                                  }

                                  handleSelection?.(option)
                                }}
                                className={cn(
                                  "px-4 rounded-xs hover:bg-primary hover:text-white cursor-pointer text-secondary dark:text-white dark:hover:text-white",
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
            </PopoverContent>
          )}
        </Command>
      </Popover>
    )
  }
)

MultipleSelectorV2.displayName = "MultipleSelector"
export default MultipleSelectorV2
