import * as TooltipPrimitive from "@radix-ui/react-tooltip"

export interface TooltipContentProps
  extends React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content> {
  className?: string
  sideOffset?: number
}
