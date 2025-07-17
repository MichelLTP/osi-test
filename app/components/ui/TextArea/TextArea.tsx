import { cn } from "@/utils/shadcn/utils"
import React from "react"

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<"textarea">
>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "bg-third block w-full p-4 focus:ring-0 border transition-border rounded-sm input-focus",
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
Textarea.displayName = "Textarea"

export default Textarea
