import React, { useCallback, useEffect, useMemo, useState } from "react"
import { ErrorBoundaryComponent } from "@/components/ui/ErrorBoundaryComponent/ErrorBoundaryComponent"
import {
  BrandLaunchTableHandlerProps,
  TableHandlerData,
  TableRow,
} from "@/components/OMM/EditableTable/types"
import { getYear } from "date-fns"
import { generateYearRange, YEAR_LIMIT } from "@/hooks/useGraphData"
import { BrandLaunchGraph } from "@/components/OMM/types"
import EditableGraphTable from "@/components/OMM/EditableTable/EditableGraphTable"

const BrandLaunchTableHandler = ({
  tableData,
  tableTitle,
  startingYear,
  syncChart,
}: BrandLaunchTableHandlerProps) => {
  const [data, setData] = useState<TableHandlerData>({
    headers: [],
    table: [],
  })

  const yearColumn = useMemo(
    () => generateYearRange(Number(startingYear), YEAR_LIMIT),
    [startingYear]
  )

  const allYears = useMemo(
    () => generateYearRange(getYear(new Date()), YEAR_LIMIT),
    []
  )

  const generateColumns = useCallback(() => {
    const firstColumn = [
      {
        accessorKey: "scenario-type",
        header: tableTitle,
      },
    ]
    const dynamicColumns = allYears.map((year) => ({
      accessorKey: year.toString(),
      header: year,
    }))

    return [...firstColumn, ...dynamicColumns]
  }, [tableTitle, startingYear])

  const generateRow = useCallback(
    (title: string, years: string[], values: string[]) => {
      return {
        "scenario-type": title,
        ...years.reduce(
          (acc, year, index) => {
            acc[year] = values[index] ?? null
            return acc
          },
          {} as Record<string, string | null>
        ),
      }
    },
    []
  )

  const generateTable = useCallback(() => {
    return Object.entries(tableData).map(([title, data]) => {
      if (!data) return null
      const years = data.years
        .slice(0, allYears.length)
        .map((data, index) => yearColumn[index])
      return generateRow(title, years, data.values)
    })
  }, [tableData, generateRow, startingYear])

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

  const handleChartSync = useCallback(
    (options: Record<string, any>, newValue: string) => {
      const updatedTable = data.table.map((row) => {
        if (row["scenario-type"] === options["scenario-type"]) {
          return { ...row, [options.field]: newValue }
        }
        return row
      })

      updateTableData(updatedTable)
    },
    [data.table, syncChart]
  )

  const updateTableData = (updatedTable: TableRow[]) => {
    setData((prev) => ({
      ...prev,
      table: updatedTable,
    }))
    syncChart(calculateChartData(updatedTable))
  }

  const calculateChartData = (table: TableRow[]): BrandLaunchGraph[] =>
    Object.keys(table[0])
      .filter((key) => !isNaN(Number(key)))
      .map((year) => ({
        years: Number(year),
        ...table.reduce(
          (acc, row) => {
            if (row["scenario-type"].includes("Market")) {
              acc["market_share"] = Number(row[year]) || 0
            } else if (row["scenario-type"].includes("Price")) {
              acc["price"] = Number(row[year]) || 0
            }
            return acc
          },
          {} as Record<string, number>
        ),
      }))

  return (
    <EditableGraphTable
      data={data}
      startingYear={startingYear}
      handleChartSync={handleChartSync}
      variant="brandLaunch"
    />
  )
}

export default React.memo(BrandLaunchTableHandler)
