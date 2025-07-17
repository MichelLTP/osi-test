import { CloseSidebar, useCloseSidebar } from "@/store/layout"
import React, { useEffect, useRef } from "react"
import { routeFiltersItems } from "@/utils/routers/routeFiltersItems"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ExternalComponents/DropdownMenu/dropdown-menu"
import { useRouterID, useSelectedRouter } from "@/store/chatsi"
import { IRouteItem } from "../type"

import { RouterCategorySection } from "./RouterCategorySection"
import { cn } from "@/utils/shadcn/utils"
import { renderIcon } from "./RouteFiltersItem"

const RouteFiltersDropdown = ({
  isResponseRendered,
  maxWidth,
}: {
  isResponseRendered: boolean | undefined
  maxWidth?: number
}) => {
  const boundary = useRef<HTMLDivElement>(null)
  const close = useCloseSidebar((state: CloseSidebar) => state.close)
  const { routerID, setRouterID } = useRouterID()
  const { selectedRouter, setSelectedRouter } = useSelectedRouter()
  const [expandedCategory, setExpandedCategory] = React.useState<string | null>(
    null
  )

  useEffect(() => {
    const foundItem = routeFiltersItems
      .flatMap(({ options }) => options)
      .find(({ id }) => id === routerID)
    if (foundItem) setSelectedRouter(foundItem)
  }, [routerID])

  const handleRouterClick = (item: IRouteItem) => {
    item.id && setRouterID(item.id)
  }

  const toggleCategory = (category: string) => {
    setExpandedCategory((prevCategory) =>
      prevCategory === category ? null : category
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="inline-flex items-center justify-center focus-visible:outline-none rounded-none h-auto w-auto ml-0 font-normal mr-2 whitespace-nowrap disabled:pointer-events-none disabled:opacity-50 group space-x-2">
        <div className="md:block group-hover:text-primary transition-colors duration-300">
          {renderIcon(selectedRouter.icon)}
        </div>
        <span className="md:inline-block text-secondary dark:text-white hover:text-primary dark:hover:text-primary group-hover:text-primary transition-colors duration-300">
          {selectedRouter.title}
        </span>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className={cn(
          "flex bg-white dark:bg-secondary-dark shadow-lg border-secondary/20 dark:border-third/20 rounded-xs mb-7 w-full",
          isResponseRendered ? "lg:max-w-[1135px]" : "lg:max-w-[828px]"
        )}
        align="start"
        alignOffset={-22}
        side="top"
        avoidCollisions={false}
        collisionBoundary={boundary.current}
        style={maxWidth ? { maxWidth: maxWidth } : undefined}
      >
        <div className="flex flex-col gap-y-6 max-h-[60vh] overflow-y-auto p-6 styled-scrollbar text-secondary dark:text-white min-w-[250px] md:w-full">
          {routeFiltersItems.map((item) => (
            <RouterCategorySection
              key={item.category}
              item={item}
              isExpanded={expandedCategory === item.category}
              onToggle={() => toggleCategory(item.category)}
              onRouterClick={handleRouterClick}
            />
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default RouteFiltersDropdown
