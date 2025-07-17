import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/utils/shadcn/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-lg border px-4 py-1 text-xs transition-colors focus:outline-none",
  {
    variants: {
      variant: {
        default: "bg-primary text-white ml-auto",
        secondary: "",
        info: "text-sm border-transparent bg-primary pointer-events-none text-white !py-0 !block",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
