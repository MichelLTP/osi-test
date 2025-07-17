import { useVirtualizer } from "@tanstack/react-virtual"
import { ChevronsUpDown } from "lucide-react"
import * as React from "react"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/Command/Command"
import { cn } from "@/utils/shadcn/utils"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/Popover/Popover"
import { Button } from "@/components/ui/Button/Button"
import {
  Option,
  VirtualizedComboboxProps,
  VirtualizedCommandProps,
} from "@/components/ui/VirtualizedCombobox/types"

const VirtualizedCommand = ({
  height,
  options,
  placeholder,
  selectedOption,
  onSelectOption,
  sortAlphabetically = false,
}: VirtualizedCommandProps) => {
  const [filteredOptions, setFilteredOptions] = React.useState<Option[]>(
    sortAlphabetically
      ? options.sort((a, b) => a.label.localeCompare(b.label))
      : options
  )
  const [focusedIndex, setFocusedIndex] = React.useState(0)
  const [isKeyboardNavActive, setIsKeyboardNavActive] = React.useState(false)

  const parentRef = React.useRef(null)

  const virtualized = useVirtualizer({
    count: filteredOptions.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 40,
  })

  const virtualOptions = virtualized.getVirtualItems()

  const scrollToIndex = (index: number) => {
    virtualized.scrollToIndex(index, {
      align: "center",
    })
  }

  const handleSearch = (search: string) => {
    setIsKeyboardNavActive(false)
    setFilteredOptions(
      options.filter((option) =>
        option.value.toLowerCase().includes(search.toLowerCase() ?? [])
      )
    )
  }

  const handleKeyDown = (event: React.KeyboardEvent) => {
    switch (event.key) {
      case "ArrowDown": {
        event.preventDefault()
        setIsKeyboardNavActive(true)
        setFocusedIndex((prev) => {
          const newIndex =
            prev === -1 ? 0 : Math.min(prev + 1, filteredOptions.length - 1)
          scrollToIndex(newIndex)
          return newIndex
        })
        break
      }
      case "ArrowUp": {
        event.preventDefault()
        setIsKeyboardNavActive(true)
        setFocusedIndex((prev) => {
          const newIndex =
            prev === -1 ? filteredOptions.length - 1 : Math.max(prev - 1, 0)
          scrollToIndex(newIndex)
          return newIndex
        })
        break
      }
      case "Enter": {
        event.preventDefault()
        if (filteredOptions[focusedIndex]) {
          onSelectOption?.(filteredOptions[focusedIndex].value)
        }
        break
      }
      default:
        break
    }
  }

  React.useEffect(() => {
    if (selectedOption) {
      const option = filteredOptions.find(
        (option) => option.value === selectedOption
      )
      if (option) {
        const index = filteredOptions.indexOf(option)
        setFocusedIndex(index)
        virtualized.scrollToIndex(index, {
          align: "center",
        })
      }
    }
  }, [selectedOption, filteredOptions, virtualized])

  return (
    <Command shouldFilter={false} onKeyDown={handleKeyDown}>
      <CommandInput onValueChange={handleSearch} placeholder={placeholder} />
      <CommandList
        ref={parentRef}
        style={{
          height: height,
          width: "100%",
          overflow: "auto",
        }}
        onMouseDown={() => setIsKeyboardNavActive(false)}
        onMouseMove={() => setIsKeyboardNavActive(false)}
      >
        <CommandEmpty>No item found.</CommandEmpty>
        <CommandGroup>
          <div
            style={{
              height: `${virtualized.getTotalSize()}px`,
              width: "100%",
              position: "relative",
            }}
          >
            {virtualOptions.map((virtualOption) => (
              <CommandItem
                key={filteredOptions[virtualOption.index].value}
                disabled={isKeyboardNavActive}
                className={cn(
                  "absolute left-0 top-0 w-full bg-transparent rounded-xs hover:bg-primary hover:text-white cursor-pointer text-secondary dark:text-white dark:hover:text-white",
                  focusedIndex === virtualOption.index &&
                    "bg-accent text-accent-foreground",
                  isKeyboardNavActive &&
                    focusedIndex !== virtualOption.index &&
                    "aria-selected:bg-transparent aria-selected:text-primary"
                )}
                style={{
                  height: `${virtualOption.size}px`,
                  transform: `translateY(${virtualOption.start}px)`,
                }}
                value={filteredOptions[virtualOption.index].value}
                onMouseEnter={() =>
                  !isKeyboardNavActive && setFocusedIndex(virtualOption.index)
                }
                onMouseLeave={() => !isKeyboardNavActive && setFocusedIndex(-1)}
                onSelect={onSelectOption}
              >
                {filteredOptions[virtualOption.index].label}
              </CommandItem>
            ))}
          </div>
        </CommandGroup>
      </CommandList>
    </Command>
  )
}

export function VirtualizedCombobox({
  options,
  searchPlaceholder = "Search items...",
  selectedOption,
  onSelectOption,
  disabled = false,
  sortAlphabetically = false,
  customHeight = "300px",
}: VirtualizedComboboxProps) {
  const [open, setOpen] = React.useState(false)
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          role="combobox"
          aria-expanded={open}
          className={`text-ellipsis overflow-hidden whitespace-nowrap font-normal bg-third dark:bg-secondary-dark flex items-center justify-between w-full rounded-xs text-secondary dark:text-white opacity text-base px-4 h-[45px] cursor-pointer 
          ${disabled ? "opacity-50 pointer-events-none" : ""}`}
        >
          {selectedOption
            ? options.find((option) => option.value === selectedOption)?.label
            : searchPlaceholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="bg-third dark:bg-secondary-dark p-0 text-secondary dark:text-white rounded-xs !popover-content-width-full">
        <VirtualizedCommand
          sortAlphabetically={sortAlphabetically}
          height={customHeight}
          options={options.map((option) => ({
            value: option.value,
            label: option.label,
          }))}
          placeholder={searchPlaceholder}
          selectedOption={selectedOption}
          onSelectOption={(currentValue) => {
            onSelectOption(currentValue)
            setOpen(false)
          }}
        />
      </PopoverContent>
    </Popover>
  )
}
