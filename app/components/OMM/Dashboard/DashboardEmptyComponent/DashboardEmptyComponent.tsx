import { Skeleton } from "@/components/ui/Skeleton/Skeleton"

const DashboardEmptyComponent = () => {
  return (
    <div className="flex flex-col gap-10 mt-2">
      <div className="w-full">
        <Skeleton className="h-[50vh] rounded-xs flex flex-col items-center animate-none justify-center text-secondary/90">
          <p className="text-2xlbold">No data to display.</p>
          <p className="text-xl">Please adjust your filter selection.</p>
        </Skeleton>
      </div>
      <div>
        <Skeleton className="h-[50vh] rounded-xs flex flex-col items-center animate-none justify-center  text-secondary/90">
          <p className="text-2xlbold">No data to display.</p>
          <p className="text-xl">Please adjust your filter selection.</p>
        </Skeleton>
      </div>
    </div>
  )
}

export default DashboardEmptyComponent
