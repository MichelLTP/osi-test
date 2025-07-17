import React, { useMemo, useId, useState, useRef, useEffect } from "react"
import { SelectedBubblesProps, SelectedBubbleTypes } from "./type"
import { Ellipsis, XIcon } from "lucide-react"
import { LayoutGroup, motion } from "framer-motion"

const SelectedBubbles: React.FC<SelectedBubblesProps> = ({
  title = "Items",
  groups,
  options,
  selectedValues,
  isGroupFullySelected,
  isSubGroupFullySelected,
  handleGroupChange,
  handleSubGroupChange,
  handleOptionChange,
  handleDeselectAll,
  showAllBadge = "true",
  groupColumn = "group",
  labelColumn = "option",
  valueColumn = "value",
  subgroupColumn,
}) => {
  const baseButtonStyle =
    "text-white inline-flex items-center rounded-lg transition-colors focus:outline-none cursor-pointer text-base px-2.5 py-0.5 hover:bg-opacity-80 dark:hover:bg-opacity-40 border-0"
  const id = useId()
  const [maxBubbles, setMaxBubbles] = useState(4)
  const containerRef = useRef<HTMLDivElement>(null)
  const bubbleMeasureRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current || !bubbleMeasureRef.current) return

    const resizeObserver = new ResizeObserver(() => {
      const containerWidth = containerRef.current!.offsetWidth
      const bubbleNodes = bubbleMeasureRef.current!.children

      let total = 0
      let maxFit = 0
      for (let i = 0; i < bubbleNodes.length; i++) {
        const el = bubbleNodes[i] as HTMLElement
        const bubbleWidth = el.offsetWidth
        if (total + bubbleWidth > containerWidth) break
        total += bubbleWidth
        maxFit++
      }

      setMaxBubbles(Math.max(2, maxFit))
    })

    resizeObserver.observe(containerRef.current)
    return () => resizeObserver.disconnect()
  }, [selectedValues])

  const getButtonColor = (type: SelectedBubbleTypes) => {
    switch (type) {
      case "all":
        return "bg-success"
      case "group":
        return "bg-secondary"
      case "option":
        return "bg-primary"
      case "subgroup":
        return "bg-third-dark"
      default:
        return ""
    }
  }

  const isEmpty = selectedValues.length === 0

  const renderBadge = (
    value: string,
    label: string,
    type: SelectedBubbleTypes,
    subgroupParam?: string
  ) => {
    return (
      <motion.div
        key={value + id}
        layout={"preserve-aspect"}
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => {
          if (type === "all") {
            handleDeselectAll()
          } else if (type === "group") {
            handleGroupChange(value)
          } else if (
            type === "subgroup" &&
            handleSubGroupChange &&
            subgroupParam
          ) {
            handleSubGroupChange(subgroupParam, value)
          } else if (type === "option") {
            handleOptionChange(value)
          }
          e.stopPropagation()
        }}
        className={`${label.length >= 5 ? "min-w-[8ch]" : "min-w-fit"} ${baseButtonStyle} ${getButtonColor(type)}`}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0 }}
        transition={{ duration: 0.2 }}
      >
        <span className="text-base truncate">{label}</span>
        <XIcon className="h-4 w-4 ml-1.5 shrink-0" />
      </motion.div>
    )
  }

  const allBubbles = useMemo(() => {
    return groups.reduce<React.ReactNode[]>((acc, group) => {
      if (isGroupFullySelected(group)) {
        acc.push(renderBadge(group, group, "group"))
      } else if (
        isSubGroupFullySelected !== undefined &&
        handleSubGroupChange !== undefined &&
        subgroupColumn !== undefined
      ) {
        const subGroupsForGroup = Array.from(
          new Set(
            options
              .filter((option) => option[groupColumn] === group)
              .map((option) => option[subgroupColumn])
          )
        )
        subGroupsForGroup.forEach((subGroup) => {
          if (
            isSubGroupFullySelected(group, subGroup) &&
            options.filter(
              (option) =>
                option[groupColumn] === group &&
                option[subgroupColumn] === subGroup
            ).length > 1
          ) {
            acc.push(renderBadge(subGroup, subGroup, "subgroup", group))
          } else {
            const optionsForSubGroup = options.filter(
              (option) =>
                option[groupColumn] === group &&
                option[subgroupColumn] === subGroup &&
                selectedValues.includes(option[valueColumn])
            )
            acc.push(
              ...optionsForSubGroup.map((option) =>
                renderBadge(
                  option[valueColumn],
                  option[labelColumn],
                  "option",
                  "option"
                )
              )
            )
          }
        })
      } else {
        const optionsForGroup = options.filter(
          (option) =>
            option[groupColumn] === group &&
            selectedValues.includes(option[valueColumn])
        )
        acc.push(
          ...optionsForGroup.map((option) =>
            renderBadge(
              option[valueColumn],
              option[labelColumn],
              "option",
              "option"
            )
          )
        )
      }

      return acc
    }, [])
  }, [
    groups,
    options,
    selectedValues,
    isGroupFullySelected,
    isSubGroupFullySelected,
    handleGroupChange,
    handleSubGroupChange,
    subgroupColumn,
    groupColumn,
    valueColumn,
    labelColumn,
  ])

  const isTruncated = allBubbles.length > maxBubbles && !showAllBadge
  const limitedBubbles = isTruncated
    ? allBubbles.slice(0, maxBubbles)
    : allBubbles

  return (
    <section className="w-full overflow-hidden flex justify-start gap-2 px-2">
      <div
        ref={containerRef}
        className="flex-1 flex whitespace-nowrap truncate gap-1"
      >
        <div
          ref={bubbleMeasureRef}
          className="absolute invisible w-auto h-auto whitespace-nowrap pointer-events-none"
        >
          {allBubbles}
        </div>
        <LayoutGroup>
          {isEmpty ? (
            <span className={"opacity-50 ml-2"}>
              No {title.toLowerCase()} selected
            </span>
          ) : showAllBadge ? (
            renderBadge("all", `All ${title}`, "all")
          ) : (
            limitedBubbles
          )}
        </LayoutGroup>
      </div>
      {isTruncated && <Ellipsis className={"w-4 opacity-50"} />}
    </section>
  )
}

export default SelectedBubbles
