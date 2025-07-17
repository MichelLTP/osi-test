import * as React from "react"
import { useState, useMemo, useCallback, useEffect, useRef } from "react"
import {
  Command,
  CommandInput,
  CommandList,
} from "@/components/ui/Command/Command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/Popover/Popover"
import { Button } from "@/components/ui/Button/Button"
import { Label } from "@/components/ui/Label/Label"
import { StyledCheckbox } from "@/components/ui/Checkbox/Checkbox"
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/Accordion/Accordion"
import SelectedBubbles from "./SelectedBubbles"
import { FilterSelectProps } from "./type"
import GroupItem from "./GroupItem"

const SearchDashboardFilters: React.FC<FilterSelectProps> = ({
  options,
  groupColumn,
  valueColumn,
  labelColumn,
  handleValueChange,
  subgroupColumn = "",
  title = "Select",
  defaultValues = [],
}) => {
  const [selectedValues, setSelectedValues] = useState<number[]>(defaultValues)
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [isConsolidatedBadgeVisible, setIsConsolidatedBadgeVisible] =
    useState(true)
  const [visibleGroupsCount, setVisibleGroupsCount] = useState(30)
  const [hasMoreItems, setHasMoreItems] = useState(true)
  const commandListRef = useRef<HTMLDivElement>(null)
  const loadingRef = useRef(false)
  const observer = useRef<IntersectionObserver>()

  const groups = useMemo(() => {
    return Array.from(
      new Set(options.map((option) => option[groupColumn]))
    ).sort()
  }, [options, groupColumn])

  const groupedOptions = useMemo(() => {
    const map = new Map<string, typeof options>()
    for (const option of options) {
      const group = option[groupColumn]
      if (!map.has(group)) map.set(group, [])
      map.get(group)!.push(option)
    }
    return map
  }, [options, groupColumn])

  const filteredGroups = useMemo(() => {
    if (!searchQuery) return groups
    const lower = searchQuery.toLowerCase()
    return groups.filter(
      (group) =>
        group.toLowerCase().includes(lower) ||
        (groupedOptions.get(group) || []).some((option) =>
          (option[labelColumn] as string).toLowerCase().includes(lower)
        )
    )
  }, [groups, groupedOptions, labelColumn, searchQuery])

  const visibleFilteredGroups = useMemo(() => {
    return filteredGroups.slice(0, visibleGroupsCount)
  }, [filteredGroups, visibleGroupsCount])

  const groupOptionsMap = useMemo(() => {
    const map = new Map<string, Record<string, any>[]>()
    visibleFilteredGroups.forEach((group) => {
      map.set(
        group,
        (groupedOptions.get(group) || []).filter((option) =>
          (option[labelColumn] as string)
            .toLowerCase()
            .includes(searchQuery.toLowerCase())
        )
      )
    })
    return map
  }, [visibleFilteredGroups, groupedOptions, labelColumn, searchQuery])

  const subGroupsMap = useMemo(() => {
    const map = new Map<string, string[]>()
    visibleFilteredGroups.forEach((group) => {
      const groupOptions = groupOptionsMap.get(group) || []
      map.set(
        group,
        subgroupColumn
          ? Array.from(
              new Set(groupOptions.map((option) => option[subgroupColumn]))
            )
          : []
      )
    })
    return map
  }, [visibleFilteredGroups, groupOptionsMap, subgroupColumn])

  const loadMoreGroups = useCallback(() => {
    if (visibleGroupsCount < filteredGroups.length) {
      setVisibleGroupsCount((prev) => prev + 30)
    } else {
      setHasMoreItems(false)
    }
  }, [visibleGroupsCount, filteredGroups.length])

  const lastGroupRef = useCallback(
    (node: HTMLDivElement) => {
      if (observer.current) observer.current.disconnect()
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMoreItems) {
          loadMoreGroups()
        }
      })
      if (node) observer.current.observe(node)
    },
    [hasMoreItems, loadMoreGroups]
  )

  const handleOptionChange = useCallback(
    (value: number) => {
      setSelectedValues((prev) => {
        const updatedValues = prev.includes(value)
          ? prev.filter((val) => val !== value)
          : [...prev, value]
        handleValueChange(updatedValues)
        return updatedValues
      })
    },
    [handleValueChange]
  )

  const handleDeselectAll = () => {
    setIsConsolidatedBadgeVisible(false)
  }

  const handleGroupChange = useCallback(
    (group: string) => {
      const isSelected = isGroupFullySelected(group)
      const updatedValues = isSelected
        ? selectedValues.filter(
            (value) =>
              !(groupedOptions.get(group) || []).some(
                (option) => Number(option[valueColumn]) === value
              )
          )
        : [
            ...selectedValues,
            ...(groupedOptions.get(group) || []).map(
              (option) => option[valueColumn]
            ),
          ]

      setSelectedValues(updatedValues as number[])
      handleValueChange(updatedValues as number[])
    },
    [selectedValues, groupedOptions, valueColumn, handleValueChange]
  )

  const handleSubGroupChange = useCallback(
    (group: string, subGroup: string) => {
      const isSelected = isSubGroupFullySelected(group, subGroup)
      const subGroupOptions = options.filter(
        (option) =>
          option[groupColumn] === group && option[subgroupColumn] === subGroup
      )

      const updatedValues = isSelected
        ? selectedValues.filter(
            (value) =>
              !subGroupOptions.some(
                (option) => Number(option[valueColumn]) === value
              )
          )
        : [
            ...selectedValues,
            ...subGroupOptions.map((option) => option[valueColumn]),
          ]

      setSelectedValues(updatedValues as number[])
      handleValueChange(updatedValues as number[])
    },
    [
      selectedValues,
      options,
      groupColumn,
      subgroupColumn,
      valueColumn,
      handleValueChange,
    ]
  )

  const handleSelectAllToggle = () => {
    const allSelected = groups.every((g) => isGroupFullySelected(g))
    if (allSelected) {
      setSelectedValues([])
      handleValueChange([])
    } else {
      const newValues = options.map((option) => Number(option[valueColumn]))
      setSelectedValues(newValues)
      handleValueChange(newValues)
      setIsConsolidatedBadgeVisible(true)
    }
  }

  const isGroupFullySelected = useCallback(
    (group: string) => {
      const groupOptions = groupedOptions.get(group) || []
      return groupOptions.every((option) =>
        selectedValues.includes(Number(option[valueColumn]))
      )
    },
    [groupedOptions, selectedValues, valueColumn]
  )

  const isSubGroupFullySelected = useCallback(
    (group: string, subGroup: string) => {
      const subGroupOptions = options.filter(
        (option) =>
          option[groupColumn] === group && option[subgroupColumn] === subGroup
      )
      return subGroupOptions.every((option) =>
        selectedValues.includes(Number(option[valueColumn]))
      )
    },
    [options, groupColumn, subgroupColumn, selectedValues, valueColumn]
  )

  useEffect(() => {
    if (!isOpen) return

    const checkScroll = () => {
      if (!commandListRef.current || !hasMoreItems || loadingRef.current) return

      const { scrollTop, scrollHeight, clientHeight } = commandListRef.current
      const scrollPercentage = (scrollTop + clientHeight) / scrollHeight

      if (scrollPercentage > 0.8) {
        loadingRef.current = true
        setVisibleGroupsCount((prev) => {
          const newCount = prev + 15
          setHasMoreItems(newCount < filteredGroups.length)
          loadingRef.current = false
          return newCount
        })
      }
    }

    const observer = new MutationObserver(checkScroll)
    const commandList = commandListRef.current

    if (commandList) {
      observer.observe(commandList, {
        childList: true,
        subtree: true,
        attributes: true,
      })

      commandList.addEventListener("scroll", checkScroll)
    }

    return () => {
      if (commandList) {
        observer.disconnect()
        commandList.removeEventListener("scroll", checkScroll)
      }
    }
  }, [isOpen, hasMoreItems, filteredGroups.length])

  useEffect(() => {
    if (!isOpen || !searchQuery) {
      setVisibleGroupsCount(30)
      setHasMoreItems(filteredGroups.length > 30)
    }

    if (!isOpen && searchQuery) {
      setSearchQuery("")
    }
  }, [isOpen, filteredGroups.length, searchQuery])

  const renderOption = useCallback(
    (option: Record<string, string | number>) => (
      <div
        key={option[valueColumn]}
        className={"flex items-center mb-2 ml-4 space-x-2"}
      >
        <StyledCheckbox
          className={
            "text-primary bg-white border-gray-400 border-1 data-[state=checked]:bg-white"
          }
          checked={selectedValues.includes(option[valueColumn] as number)}
          onClick={() => handleOptionChange(option[valueColumn] as number)}
        />
        <span>{option[labelColumn]}</span>
      </div>
    ),
    [selectedValues, valueColumn, labelColumn, handleOptionChange]
  )

  const renderSubGroup = useCallback(
    (group: string, subGroup: string) => {
      const subGroupOptions = options.filter(
        (option) =>
          option[groupColumn] === group && option[subgroupColumn] === subGroup
      )
      const isSubGroupSelected = isSubGroupFullySelected(group, subGroup)

      if (subGroupOptions.length === 1) {
        return renderOption(subGroupOptions[0])
      }

      return (
        <AccordionItem key={subGroup} value={subGroup}>
          <AccordionTrigger
            iconStyle="arrow"
            className={"text-sm flex space-between p-2 !text-left"}
          >
            <div
              className={`w-full pl-2 py-2 m-0 rounded-xs flex items-center justify-start gap-4 ${
                isSubGroupSelected ? "font-bold text-primary" : ""
              }`}
            >
              <StyledCheckbox
                className={
                  "text-primary bg-white border-gray-400 border-1 data-[state=checked]:bg-white"
                }
                checked={isSubGroupSelected}
                onClick={(e) => {
                  e.stopPropagation()
                  handleSubGroupChange(group, subGroup)
                }}
              />
              <span>{subGroup}</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className={"ml-4"}>
            {subGroupOptions.map(renderOption)}
          </AccordionContent>
        </AccordionItem>
      )
    },
    [options, groupColumn, subgroupColumn, renderOption]
  )

  return (
    <div className="flex flex-col gap-2">
      <Label className="text-base">{title}</Label>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            role="combobox"
            aria-expanded={isOpen}
            className="w-full h-full min-h-[45px] group px-2 flex flex-1 items-center justify-between bg-third rounded-xs text-secondary-dark dark:bg-secondary-dark dark:text-white outline-none"
          >
            <SelectedBubbles
              title={title}
              groups={groups}
              options={options}
              selectedValues={selectedValues}
              isGroupFullySelected={isGroupFullySelected}
              showAllBadge={
                isConsolidatedBadgeVisible &&
                groups.every((g) => isGroupFullySelected(g))
              }
              handleGroupChange={handleGroupChange}
              handleOptionChange={handleOptionChange}
              handleDeselectAll={handleDeselectAll}
              groupColumn={groupColumn}
              valueColumn={valueColumn}
              labelColumn={labelColumn}
              subgroupColumn={subgroupColumn}
              {...(subgroupColumn !== "" && {
                handleSubGroupChange: handleSubGroupChange,
                isSubGroupFullySelected: isSubGroupFullySelected,
              })}
            />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="bg-third dark:bg-secondary-dark p-0 text-secondary dark:text-white rounded-xs !popover-content-width-full">
          <Command shouldFilter={true}>
            <CommandInput
              placeholder="Search..."
              value={searchQuery}
              onValueChange={setSearchQuery}
            />
            <div className="flex items-center justify-end w-full p-2">
              <Button variant="underline" onClick={handleSelectAllToggle}>
                {groups.every((g) => isGroupFullySelected(g))
                  ? "Deselect All"
                  : "Select All"}
              </Button>
            </div>
            <CommandList className={"scrollbar-thin dark-scrollbar"}>
              <Accordion type="multiple" className="w-full p-0">
                {visibleFilteredGroups.map((group, index) => {
                  const isLastGroup = index === visibleFilteredGroups.length - 1
                  const groupOptions = groupOptionsMap.get(group) || []
                  const subGroups = subGroupsMap.get(group) || []
                  const isGroupSelected = isGroupFullySelected(group)

                  return (
                    <GroupItem
                      key={group}
                      group={group}
                      groupOptions={groupOptions}
                      subGroups={subGroups}
                      isGroupSelected={isGroupSelected}
                      handleGroupClick={(e) => {
                        e.stopPropagation()
                        handleGroupChange(group)
                      }}
                      renderOption={renderOption}
                      renderSubGroup={renderSubGroup}
                      isLastGroup={isLastGroup}
                      lastGroupRef={lastGroupRef}
                    />
                  )
                })}
              </Accordion>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}

export default SearchDashboardFilters
