import React from "react"
import { TableData } from "@/components/ui/DynamicDataTable/types"
import DynamicDataTable from "@/components/ui/DynamicDataTable/DynamicDataTable"
import { cn } from "@/utils/shadcn/utils"

const TableOutput = ({
  tableData,
  className,
  variant,
}: {
  tableData: TableData
  className?: string
  variant?: "default" | "omm-custom" | undefined
}) => {
  return (
    <section
      className={cn(
        "p-4 rounded-sm my-4 text-secondary dark:text-white",
        className
      )}
    >
      <DynamicDataTable tableData={tableData} variant={variant} />
    </section>
  )
}

export default TableOutput
