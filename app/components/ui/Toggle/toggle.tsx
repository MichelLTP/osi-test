"use client"

import * as React from "react"
import * as TogglePrimitive from "@radix-ui/react-toggle"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/utils/shadcn/utils"

const toggleVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors hover:bg-secondary hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=on]:bg-secondary data-[state=on]:text-white data-[state=on]:z-40 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 -ml-6",
  {
    variants: {
      variant: {
        default:
          "bg-third dark:bg-third-dark dark:data-[state=on]:bg-primary dark:hover:bg-primary",
        outline:
          "ease-in-out duration-150 border border-input bg-transparent bg-third dark:bg-secondary-dark hover:bg-input hover:text-secondary hover:dark:text-third dark:hover:bg-input dark:data-[state=on]:bg-primary dark:data-[state=on]:border-transparent",
      },
      size: {
        default: "h-8 px-8 min-w-32",
        sm: "h-9 px-2.5 min-w-9",
        lg: "h-11 px-5 min-w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const Toggle = React.forwardRef<
  React.ElementRef<typeof TogglePrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof TogglePrimitive.Root> &
    VariantProps<typeof toggleVariants>
>(({ className, variant, size, ...props }, ref) => (
  <TogglePrimitive.Root
    ref={ref}
    className={cn(toggleVariants({ variant, size, className }))}
    {...props}
  />
))

Toggle.displayName = TogglePrimitive.Root.displayName

export { Toggle, toggleVariants }
