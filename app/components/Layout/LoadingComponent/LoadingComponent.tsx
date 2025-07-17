import { Button } from "@/components/ui/Button/Button"
import { Skeleton } from "@/components/ui/Skeleton/Skeleton"
import { cn } from "@/utils/shadcn/utils"
import { LoadingComponentVariant } from "./types"

export const LoadingComponent = ({
  variant,
}: {
  variant?: LoadingComponentVariant
}) => {
  let content
  if (variant === "history") {
    content = (
      <div className="flex flex-col items-center">
        {Array(3)
          .fill(null)
          .map((_, index) => (
            <Skeleton
              key={index}
              className="p-6 rounded-[19px] my-2 w-[226px] h-[60px]"
            />
          ))}
      </div>
    )
  } else if (variant === "Example Questions") {
    content = (
      <div className="grid grid-cols-1 gap-4 max-w-[620px] sm:grid-cols-2 sm:grid-rows-2 sm:gap-7 w-full">
        {Array(4)
          .fill(null)
          .map((_, index) => (
            <Skeleton
              key={index}
              className={cn(
                "h-[95px] w-full max-w-[320px] p-5 rounded-[20px] mx-auto",
                index === 2 && "hidden sm:block",
                index === 3 && "hidden sm:block"
              )}
            />
          ))}
        <Button className="p-0 -mr-2 invisible" aria-hidden />
      </div>
    )
  } else if (variant === "carousel") {
    content = (
      <>
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
      </>
    )
  } else if (variant === "source-images") {
    content = (
      <div className="flex flex-col gap-3">
        <Skeleton className="w-full h-[284px] rounded-[10px]" />
        <div className="flex gap-2">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton
              key={index}
              className="w-[77px] h-[45px] rounded-[10px]"
            />
          ))}
        </div>
      </div>
    )
  } else if (variant === "Dashboard Chart") {
    content = (
      <div className="flex flex-col gap-10 mt-5">
        <div className="w-full">
          <Skeleton className="h-[50vh] rounded-xs" />
        </div>
        <div>
          <Skeleton className="h-[50vh] rounded-xs" />
        </div>
      </div>
    )
  } else if (variant === "Dashboard Filters") {
    content = (
      <div className="mt-10 flex flex-col gap-2 w-full">
        <div className="flex flex-row justify-between mt-20">
          {Array(3)
            .fill(null)
            .map((_, index) => (
              <Skeleton
                key={index}
                className={"h-[45px] w-[32%]  rounded-xs"}
              />
            ))}
        </div>
        <div className="flex flex-row justify-end w-full mt-11 ">
          <Skeleton className={"w-1/4 h-[45px] rounded-xs"} />
        </div>
      </div>
    )
  } else if (variant === "scenario-bubbles") {
    content = (
      <section className="flex flex-col gap-4 mt-5">
        <Skeleton className="h-[80px] rounded-sm" />
        <Skeleton className="h-[80px] rounded-sm" />
      </section>
    )
  } else if (variant === "scenario-sources") {
    content = (
      <div className="flex flex-row gap-3">
        <Skeleton className="min-w-20 py-3 rounded-sm" />
        <Skeleton className="min-w-20 py-3 rounded-sm" />
      </div>
    )
  } else if (variant === "full-filters-loading") {
    const SkeletonField = () => (
      <div className="space-y-2">
        <Skeleton className="rounded-xs h-4 w-36" />
        <Skeleton className="rounded-xs h-[45px] w-full" />
      </div>
    )

    const SkeletonColumn = ({ fieldCount = 5 }: { fieldCount?: number }) => (
      <div className="space-y-8">
        <Skeleton className="rounded-xs h-7 w-52" />
        {Array.from({ length: fieldCount }, (_, index) => (
          <SkeletonField key={index} />
        ))}
      </div>
    )

    const columns = [
      { fieldCount: 5 },
      { fieldCount: 5 },
      { fieldCount: 4 },
      { fieldCount: 4 },
    ]

    content = (
      <div className="mt-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12">
          {columns.map((column, index) => (
            <SkeletonColumn key={index} fieldCount={column.fieldCount} />
          ))}
        </div>
      </div>
    )
  } else {
    content = (
      <>
        {Array(7)
          .fill(null)
          .map((_, index) => (
            <Skeleton key={index} className="h-[23px] w-full mb-2" />
          ))}
      </>
    )
  }

  return content
}
