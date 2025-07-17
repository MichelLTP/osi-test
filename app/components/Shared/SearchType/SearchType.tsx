import React, { useState } from "react"
import { Card } from "@/components/ui/Card/Card"
import {
  faArrowsSplitUpAndLeft,
  faAtom,
  faBolt,
  faBrain,
  faChartColumn,
  faMagnifyingGlassPlus,
  faTableCellsLarge,
} from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { SearchOption, SearchTypeProps } from "./types"
import { useSearchMethod } from "@/store/chatsi"

const SearchType: React.FC<SearchTypeProps> = ({
  isDocumentRouter,
  onSelectOption,
  selectedOption,
}) => {
  const [hoveredOption, setHoveredOption] = useState<SearchOption["id"] | null>(
    "auto"
  )
  const { setSearchMethod } = useSearchMethod()

  const searchDocumentOptions: SearchOption[] = [
    {
      id: "quick",
      icon: faBolt,
      title: "Quick Search",
      description: "Fast responses, best for simple fact-based requests",
      disabled: false,
    },
    {
      id: "advanced",
      icon: faMagnifyingGlassPlus,
      title: "Advanced Search",
      description: "More sources, deeper reasoning, richer responses",
      disabled: false,
    },
    {
      id: "deep",
      icon: faBrain,
      title: "Deep Research",
      description:
        "Thorough investigation, comprehensive analysis, detailed exploration",
      disabled: false,
    },

    {
      id: "auto",
      icon: faArrowsSplitUpAndLeft,
      title: "Auto Search",
      description: "Chat SI will select between Quick or Advanced Search",
      disabled: false,
    },
  ]

  const analysisOptionsData: SearchOption[] = [
    {
      id: "concise",
      icon: faTableCellsLarge,
      title: "Concise",
      description: "Brief, direct answer only",
      disabled: true,
    },
    {
      id: "detailed",
      icon: faChartColumn,
      title: "Detailed",
      description: "More verbose and added visuals",
      disabled: false,
    },
    {
      id: "pro",
      icon: faAtom,
      title: "PRO",
      description: "Adds context or extra insights",
      disabled: true,
    },
  ]

  const optionsToDisplay: SearchOption[] = isDocumentRouter
    ? searchDocumentOptions
    : analysisOptionsData

  const handleOptionClick = (option: SearchOption): void => {
    if (option.disabled) return

    if (option.id) {
      setSearchMethod(option.id)
    }

    if (onSelectOption) {
      onSelectOption(option)
    }
  }

  return (
    <div className="w-full max-w-md mx-auto space-y-2">
      {optionsToDisplay.map((option) => {
        const isHovered = hoveredOption === option.id
        const isSelected = selectedOption?.id === option.id
        const isDisabled = option.disabled

        return (
          <Card
            key={option.id}
            className={`p-4 flex items-start rounded-xl gap-4 border-none transition-all shadow-none duration-200 ${
              isDisabled
                ? "opacity-50 cursor-not-allowed"
                : "cursor-pointer " +
                  (isHovered || isSelected
                    ? "bg-third dark:bg-primary-dark"
                    : "")
            }`}
            onClick={() => !isDisabled && handleOptionClick(option)}
            onMouseEnter={() => !isDisabled && setHoveredOption(option.id)}
            onMouseLeave={() => !isDisabled && setHoveredOption(null)}
          >
            <div
              className={`${
                isDisabled
                  ? "text-secondary dark:text-third"
                  : isSelected
                    ? "text-primary"
                    : "text-secondary dark:text-third" +
                      (isHovered && !isSelected ? "text-primary" : "")
              }`}
            >
              <FontAwesomeIcon
                icon={option.icon}
                className={"dark:text-third"}
              />
            </div>
            <div className="flex flex-col">
              <h3
                className={`text-basebold ${
                  isDisabled
                    ? "text-secondary dark:text-third"
                    : isSelected
                      ? "text-primary"
                      : "text-secondary dark:text-third"
                }`}
              >
                {option.title}
              </h3>
              <p
                className={`text-sm ${
                  isDisabled
                    ? "text-secondary dark:text-third"
                    : isSelected
                      ? "text-primary"
                      : "text-secondary dark:text-third"
                }`}
              >
                {option.description}
              </p>
            </div>
          </Card>
        )
      })}
    </div>
  )
}

export default SearchType
