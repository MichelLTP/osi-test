import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { DropdownMenuItem } from "@radix-ui/react-dropdown-menu"
import { IRouteFiltersItem } from "../type"
import React from "react"
import { useSelectedRouter } from "@/store/chatsi"
import { cn } from "@/utils/shadcn/utils"
import { SVGIcon } from "@/components/ui/SvgIcons/SVGIcon"
import { IconDefinition } from "@fortawesome/free-solid-svg-icons"

export const renderIcon = (
  icon: string | IconDefinition,
  isSelected: boolean = false
) => {
  switch (icon) {
    case "chatGPT":
      return (
        <SVGIcon
          width={14}
          className={cn(
            "group-hover:stroke-primary transition-colors duration-300",
            isSelected && "stroke-primary dark:stroke-primary"
          )}
          variant="ChatGPT"
        />
      )
    default:
      return <FontAwesomeIcon icon={icon as IconDefinition} className="w-3" />
  }
}

const RouteFiltersItem = ({
  icon,
  title,
  description,
  onClick,
  disabled,
}: IRouteFiltersItem): React.ReactElement => {
  const { selectedRouter } = useSelectedRouter()

  return (
    <DropdownMenuItem
      className={`${
        selectedRouter.title === title
          ? "text-primary dark:text-primary"
          : "text-secondary dark:text-white"
      } ${
        disabled
          ? "text-secondary/50 dark:text-white/50 pointer-events-none"
          : "cursor-pointer hover:text-primary dark:hover:text-primary"
      } p-1 transition-colors duration-300 flex flex-col items-start focus-visible:outline-none group text-pretty`}
      onClick={onClick}
    >
      <div className="flex items-center">
        {renderIcon(icon, selectedRouter.title === title)}
        <button className="ml-2 text-sm whitespace-nowrap font-bold text-left leading-5">
          {title}
        </button>
      </div>
      <p className="text-xxs text-left opacity-60 mt-1 whitespace-normal md:flex flex-wrap w-fit leading-4 min-h-10">
        {description}
      </p>
    </DropdownMenuItem>
  )
}

export default RouteFiltersItem
