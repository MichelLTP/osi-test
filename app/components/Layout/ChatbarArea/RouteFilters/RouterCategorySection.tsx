import { AnimatePresence, motion } from "framer-motion"
import React, { useState, useEffect } from "react"
import { faMinus, faPlus } from "@fortawesome/free-solid-svg-icons"
import { Button } from "@/components/ui/Button/Button"
import RouteFiltersItem from "./RouteFiltersItem"
import { CloseSidebar, useCloseSidebar } from "@/store/layout"
import { IRouteItem, IRouterCategoryProps } from "../type"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { cn } from "@/utils/shadcn/utils"

const useViewportCalculation = (
  options: IRouteItem[],
  isSidebarClosed: boolean
) => {
  const [visibleOptions, setVisibleOptions] = useState(options.slice(0, 2))

  useEffect(() => {
    const calculateVisibleOptions = () => {
      const width = window.innerWidth
      let itemCount = options.length

      if (width >= 1280) {
        // xl
        itemCount = isSidebarClosed ? 5 : 4
      } else if (width >= 1024) {
        // lg
        itemCount = isSidebarClosed ? 3 : 2
      }

      setVisibleOptions(options.slice(0, itemCount))
    }

    calculateVisibleOptions()
    window.addEventListener("resize", calculateVisibleOptions)

    return () => window.removeEventListener("resize", calculateVisibleOptions)
  }, [options, isSidebarClosed])

  return visibleOptions
}

const shouldShowExpandButton = (
  itemLength: number,
  isSidebarClosed: boolean
) => {
  return {
    lg: itemLength > (isSidebarClosed ? 3 : 2),
    xl: itemLength > (isSidebarClosed ? 5 : 4),
  }
}

export const RouterCategorySection: React.FC<IRouterCategoryProps> = ({
  item,
  isExpanded,
  onToggle,
  onRouterClick,
}) => {
  const close = useCloseSidebar((state: CloseSidebar) => state.close)
  const visibleOptions = useViewportCalculation(item.options, close)
  const showExpand = shouldShowExpandButton(item.options.length, close)
  const displayOptions = isExpanded ? item.options : visibleOptions

  return (
    <div className="text-secondary dark:text-white">
      <div className="flex items-center border-b border-secondary/20 dark:border-white/10 pb-1 mb-3">
        <span>{item.category}</span>
      </div>
      <div
        className={cn(
          "grid grid-cols-2 gap-4",
          close
            ? "sm:grid-cols-3 xl:grid-cols-5"
            : "lg:grid-cols-2 xl:grid-cols-4"
        )}
      >
        <AnimatePresence initial={false}>
          {displayOptions.map((option) => (
            <motion.div
              layout
              key={option.title}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
            >
              <RouteFiltersItem
                icon={option.icon}
                title={option.title}
                description={option.description}
                onClick={() => onRouterClick(option)}
                disabled={option.disabled}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <Button
        className={cn(
          "text-primary dark:text-primary hover:underline hidden h-6",
          showExpand.lg ? "lg:flex" : "lg:hidden",
          showExpand.xl ? "xl:flex" : "xl:hidden"
        )}
        variant="ghost"
        onClick={onToggle}
      >
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <FontAwesomeIcon icon={isExpanded ? faMinus : faPlus} />
        </motion.div>
      </Button>
    </div>
  )
}
