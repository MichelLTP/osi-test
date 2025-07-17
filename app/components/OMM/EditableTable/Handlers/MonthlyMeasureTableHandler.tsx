import React, { useCallback, useEffect, useState } from "react"
import { ErrorBoundaryComponent } from "@/components/ui/ErrorBoundaryComponent/ErrorBoundaryComponent"
import EditableTable from "@/components/OMM/EditableTable/EditableTable"
import {
  MonthlyHandlerProps,
  MonthlyMarketData,
  TableHandlerData,
  TableRow,
} from "@/components/OMM/EditableTable/types"
import { EditableTableCell } from "@/components/OMM/EditableTable/EditableTableCell/EditableTableCell"
import { ColumnDef } from "@tanstack/react-table"
import { useScenarioTableStore } from "@/store/omm"
import { Category } from "@/components/OMM/types"

const MonthlyMeasureTableHandler = ({
  tableData,
  tableTitle,
  driverId,
  marketId,
  category,
}: MonthlyHandlerProps) => {
  const [data, setData] = useState<TableHandlerData>({
    headers: [],
    table: [],
  })
  const { monthlyData } = useScenarioTableStore()
  const sharedMetadata = {
    isMeasure: true,
    driver: driverId,
    market: marketId.toString(),
    year: tableTitle,
    category: category as Category,
    company: tableData?.company ?? undefined,
    product: tableData?.product ?? undefined,
    isMonthly: true,
  }

  const generateColumns = useCallback(() => {
    const firstColumn = [
      {
        accessorKey: "scenario-type",
        header: (
          <p className={"flex flex-col"}>
            {tableTitle}
            <span className={"opacity-50 -mt-1 -mb-3 text-sm"}>monthly</span>
          </p>
        ),
        meta: sharedMetadata,
      },
    ]

    const dynamicColumns = (tableData.months as string[])?.map(
      (row) => ({
        accessorKey: row.toString(),
        header: row,
        cell: EditableTableCell,
        meta: {
          type: "number",
          ...sharedMetadata,
        },
      }),
      [tableTitle, driverId]
    )
    if (!dynamicColumns) {
      return [...firstColumn]
    }
    return [...firstColumn, ...dynamicColumns]
  }, [driverId, tableTitle, tableData])

  const generateRow = useCallback(
    (scenarioType: string, months: string[], values: string[] | number[]) => {
      return {
        "scenario-type": scenarioType,
        ...months?.reduce(
          (acc, month, index) => {
            acc[month] =
              (Number(values[index]).toFixed(tableData.round_digits) ??
                values[index]) ||
              null
            return acc
          },
          {} as Record<string, string | null>
        ),
      }
    },
    []
  )

  const generateTable = useCallback(() => {
    let baselineRow

    if (tableData.baseline) {
      baselineRow = generateRow(
        "Baseline",
        tableData.months,
        Array.isArray(tableData.baseline.values)
          ? tableData.baseline.values
          : tableData.values
      )
    } else {
      baselineRow = generateRow("Baseline", tableData.months, tableData.values)
    }
    const marketData = monthlyData[Number(marketId)]
    const isMarketLevel = category === "market_level"
    const isCompanyLevel = category === "company_level"

    const storedData = isMarketLevel
      ? ((marketData?.["market_level"]?.[driverId] ??
          []) as MonthlyMarketData[])
      : isCompanyLevel
        ? (marketData?.["company_level"]?.[driverId]?.[tableData.product]?.[
            tableData.company
          ] as MonthlyMarketData[])
        : (marketData?.["product_level"]?.[driverId]?.[
            tableData.product
          ] as MonthlyMarketData[])

    const yearlyData = storedData?.[tableTitle.toString()] as MonthlyMarketData

    const handleStoredData = () => {
      if (!storedData) return null
      return generateRow(
        "New Scenario",
        tableData.months,
        Array.isArray(yearlyData.values) ? yearlyData.values : tableData.values
      )
    }

    if (yearlyData?.values?.length) {
      return [baselineRow, handleStoredData()]
    }
    return [
      baselineRow,
      generateRow("New Scenario", tableData.months, tableData.values),
    ]
  }, [marketId, driverId, tableData, tableTitle, monthlyData])

  useEffect(() => {
    setData({
      headers: generateColumns(),
      table: generateTable().filter(
        (row): row is TableRow => row !== null && row !== undefined
      ),
    })
  }, [generateColumns, generateTable, tableData])

  if (data.headers === null || data.table === null) {
    return <ErrorBoundaryComponent isMainRoute={false} />
  }

  return (
    <EditableTable
      columns={data.headers as ColumnDef<unknown>[]}
      initialData={data.table}
    />
  )
}

export default React.memo(MonthlyMeasureTableHandler)
