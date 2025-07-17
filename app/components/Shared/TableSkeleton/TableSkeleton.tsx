import { Skeleton } from "@/components/ui/Skeleton/Skeleton"

export default function TableSkeleton({
  rows,
  classNames,
}: {
  rows: number
  classNames?: string
}) {
  return (
    <div className={"flex flex-col " + classNames}>
      {Array(rows)
        .fill(null)
        .map((_, index) => (
          <div key={index}>
            {index === 0 && <div className="border w-full" />}
            <Skeleton key={index} className="h-5 w-full my-3" />
            {<div className="border w-full" />}
          </div>
        ))}
    </div>
  )
}
