import { Skeleton } from "@/components/ui/Skeleton/Skeleton"
import { clsx } from "clsx"

export default function ChartSkeleton({
  variant = "default",
}: {
  variant?: "default" | "chart-only"
}) {
  return (
    <div className="space-y-14">
      {variant === "default" && (
        <div className="space-y-2">
          <Skeleton className="h-6 w-[300px] rounded-xs" />
          <Skeleton className="h-6 w-[100px] rounded-xs" />
        </div>
      )}
      <div
        className={`flex items-end gap-8 justify-center ${variant === "chart-only" ? "scale-y-125 my-16" : ""}`}
      >
        {Array.from({ length: variant === "default" ? 7 : 8 }, (_, index) => {
          const heights = [
            "h-[234px]",
            "h-[137px]",
            "h-[62px]",
            "h-[198px]",
            "h-[151px]",
            "h-[187px]",
            "h-[234px]",
            "h-[198px]",
          ]
          return (
            <Skeleton
              key={`skeleton-${index}`}
              className={clsx(
                heights[index],
                variant === "chart-only" ? "w-16" : "w-12",
                "rounded-xs"
              )}
            />
          )
        })}
      </div>
    </div>
  )
}
