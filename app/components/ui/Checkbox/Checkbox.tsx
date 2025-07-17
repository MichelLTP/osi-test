import * as React from "react"
import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
import { Check } from "lucide-react"

import { cn } from "@/utils/shadcn/utils"
import { Label } from "../Label/Label"
import { CheckboxProps } from "./types"
import { clsx } from "clsx"

export interface StyledCheckboxProps
  extends React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root> {
  size?: "xs" | "sm" | "md"
}

export const StyledCheckbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  StyledCheckboxProps
>(({ className, size = "md", ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      "peer h-4 w-4 shrink-0 border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground",
      size === "xs" && "h-3.5 w-3.5",
      size === "sm" && "h-3.5 w-3.5",
      size === "md" && "h-4 w-4",
      className
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator
      className={cn("flex items-center justify-center text-current")}
    >
      <Check className="h-full w-full" />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
))
StyledCheckbox.displayName = CheckboxPrimitive.Root.displayName

export default function Checkbox({
  items,
  row = false,
  className,
  size = "md",
  onClick,
  namePrefix = "",
}: CheckboxProps) {
  return (
    <ul
      className={clsx(
        "flex",
        className,
        row
          ? "flex-row gap-y-4 gap-x-6 pt-0 px-2 flex-wrap"
          : "flex-col gap-8 pt-10 px-5"
      )}
    >
      {items.map((item, index) => (
        <li
          key={index}
          className={`flex items-center space-x-2 ${item.disabled && "pointer-events-none opacity-30"}`}
        >
          <StyledCheckbox
            className="text-primary data-[state=checked]:bg-transparent"
            id={`${namePrefix}-item-${index}-${item.value}`}
            name={`${namePrefix}-item-${index}-${item.value}`}
            onClick={() => onClick?.(item)}
            checked={item.checked ?? undefined}
            size={size}
          />
          <Label
            htmlFor={`${namePrefix}-item-${index}-${item.value}`}
            className={clsx(
              "cursor-pointer leading-normal",
              size === "xs" && "text-xs",
              size === "sm" && "text-sm",
              size === "md" && "text-base",
              row && "font-normal"
            )}
          >
            {item.value}
          </Label>
        </li>
      ))}
    </ul>
  )
}
