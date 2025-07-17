import { cn } from "@/utils/shadcn/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-zinc-200 bg-gradient-to-r from-zinc-200 to-stone-200 dark:bg-zinc-500 dark:from-zinc-600 dark:to-zinc-500",
        className
      )}
      {...props}
    />
  )
}

export { Skeleton }
