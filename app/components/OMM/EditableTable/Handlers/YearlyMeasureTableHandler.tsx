import React, { useCallback, useEffect, useState } from "react"
import { ErrorBoundaryComponent } from "@/components/ui/ErrorBoundaryComponent/ErrorBoundaryComponent"
import EditableTable from "@/components/OMM/EditableTable/EditableTable"
import {
  FullMarketData,
  TableHandlerData,
  TableHandlerProps,
  TableRow,
} from "@/components/OMM/EditableTable/types"
import { EditableTableCell } from "@/components/OMM/EditableTable/EditableTableCell/EditableTableCell"
import { ColumnDef } from "@tanstack/react-table"
import { useScenarioTableStore } from "@/store/omm"

const YearlyMeasureTableHandler = ({
  tableData,
  tableTitle,
  driverId,
  marketId,
}: TableHandlerProps) => {
  const [data, setData] = useState<TableHandlerData>({
    headers: [],
    table: [],
  })
  const { scenarioData } = useScenarioTableStore()
  const generateColumns = useCallback(() => {
    const yearColumn = Object.keys(
      tableData.baseline
    )[0] as keyof FullMarketData

    if (!yearColumn || !Array.isArray(tableData.baseline[yearColumn])) {
      return null
    }

    const firstColumn = [
      {
        accessorKey: "scenario-type",
        header: (
          <p className={"flex flex-col"}>
            {`${tableTitle} (${tableData.baseline.format})`}
            <span className={"opacity-50 -mt-1 -mb-3 text-sm"}>average</span>
          </p>
        ),
        meta: {
          driver: driverId,
          market: marketId.toString(),
          scenario: scenarioData?.scenario_id || 0,
          category: tableData.category,
          isYearly: true,
        },
      },
    ]

    const dynamicColumns = (tableData.baseline[yearColumn] as string[]).map(
      (row) => ({
        accessorKey: row.toString(),
        header: <p className="mb-3">{row}</p>,
        cell: EditableTableCell,
        meta: {
          type: "number",
          isMeasure: true,
          year: row,
          round_digits: tableData.baseline.round_digits,
          format: tableData.baseline.format,
          driver: driverId,
          market: marketId.toString(),
          scenario: scenarioData?.scenario_id || 0,
          category: tableData.category,
          company:
            tableData.category === "company_level"
              ? tableData.monthly.company
              : "",
          product:
            tableData.category !== "market_level"
              ? tableData.monthly.product
              : "",
          isYearly: true,
        },
      }),
      [tableTitle, driverId, tableData.baseline.format]
    )

    return [...firstColumn, ...dynamicColumns]
  }, [driverId, tableTitle, tableData.baseline])

  const generateRow = useCallback(
    (scenarioType: string, years: string[], values: string[]) => {
      return {
        "scenario-type": scenarioType,
        ...years?.reduce(
          (acc, year, index) => {
            acc[year] =
              (Number(values[index]).toFixed(tableData.scenario.round_digits) ??
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
    const baselineRow = generateRow(
      "Baseline",
      tableData.baseline.years,
      tableData.baseline.values
    )

    return [
      baselineRow,
      generateRow(
        "New Scenario",
        tableData.scenario.years,
        tableData.scenario.values
      ),
    ]
  }, [scenarioData, marketId, driverId, tableData, tableTitle])

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

export default React.memo(YearlyMeasureTableHandler)
