import { Button } from "@/components/ui/Button/Button"
import {
  Tooltip as ShadcnTooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ExternalComponents/Tooltip/Tooltip"
import React from "react"
import { TooltipProps } from "@/components/ui/Tooltip/types"

const Tooltip: React.FC<TooltipProps> = ({
  icon,
  text,
  disabled,
  onClick,
  className,
  children,
  sideOffset = 4,
}) => (
  <TooltipProvider>
    <ShadcnTooltip>
      <TooltipTrigger asChild className="disabled:pointer-events-none ">
        {icon ? (
          <Button
            variant="ghost"
            icon={icon}
            className={"relative " + className}
            disabled={disabled}
            onClick={onClick}
          >
            {children}
          </Button>
        ) : (
          <span>{children}</span>
        )}
      </TooltipTrigger>
      <TooltipContent sideOffset={sideOffset} className={"bg-third dark:bg-secondary-dark"}>
        {text}
      </TooltipContent>
    </ShadcnTooltip>
  </TooltipProvider>
)

export default Tooltip
