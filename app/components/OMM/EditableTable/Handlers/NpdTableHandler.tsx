import React, { useCallback, useEffect, useMemo, useState } from "react"
import {
  ErrorBoundaryComponent,
} from "@/components/ui/ErrorBoundaryComponent/ErrorBoundaryComponent"
import {
  NpdTableHandlerProps,
  TableHandlerData,
  TableRow,
} from "@/components/OMM/EditableTable/types"
import { getYear } from "date-fns"
import { generateYearRange, YEAR_LIMIT } from "@/hooks/useGraphData"
// @ts-ignore
import { PrimeReactProvider } from "primereact/api"
import { Button } from "@/components/ui/Button/Button"
import { faEquals, faPlus } from "@fortawesome/free-solid-svg-icons"
import { NpdVariant, useScenarioTableStore } from "@/store/omm"
import EditableGraphTable
  from "@/components/OMM/EditableTable/EditableGraphTable"

const NpdTableHandler = ({
                           tableData,
                           tableTitle,
                           startingYear,
                           syncChart,
                           addRowList,
                         }: NpdTableHandlerProps) => {
  const { removeNpdRow, updateNpdValue, addNpdRow, modifyNpdKey } =
    useScenarioTableStore()
  const [data, setData] = useState<TableHandlerData>({
    headers: [],
    table: [],
  })

  const npdType = useMemo((): NpdVariant | null => {
    if (tableTitle.toLowerCase().includes("price")) return "price_data"
    if (tableTitle.toLowerCase().includes("volume")) return "volume_shares_data"
    if (tableTitle.toLowerCase().includes("market")) return "market_shares_data"
    return null
  }, [tableTitle])

  if (!npdType) return null

  const yearColumn = useMemo(
    () => generateYearRange(Number(startingYear), YEAR_LIMIT),
    [startingYear],
  )

  const allYears = useMemo(
    () => generateYearRange(getYear(new Date()), YEAR_LIMIT),
    [],
  )

  const generateColumns = useCallback(() => {
    return [
      { accessorKey: "remove-row", header: "" },
      { accessorKey: "scenario-type", header: tableTitle },
      ...allYears.map((year) => ({
        accessorKey: year.toString(),
        header: year,
      })),
    ]
  }, [tableTitle, allYears])

  const generateRow = useCallback(
    (title: string, years: string[], values: string[]) => {
      return {
        "scenario-type": title,
        ...years.reduce(
          (acc, year, index) => {
            acc[year] = values[index] ?? null
            return acc
          },
          {} as Record<string, string | null>,
        ),
      }
    },
    [],
  )

  const generateTable = useCallback(() => {
    if (!tableData || Object.keys(tableData).length === 0) return []

    return Object.entries(tableData)
      .filter(([_, data]) => data)
      .map(([title, data]) =>
        generateRow(
          title,
          data.years
            .slice(0, allYears.length)
            .map((_, index) => yearColumn[index]),
          data.values,
        ),
      )
  }, [tableData, allYears, yearColumn, generateRow])

  useEffect(() => {
    setData({
      headers: generateColumns(),
      table: generateTable().filter(
        (row): row is TableRow => row !== null && row !== undefined,
      ),
    })
  }, [generateColumns, generateTable])

  if (data.headers === null || data.table === null) {
    return <ErrorBoundaryComponent isMainRoute={false} />
  }

  const updateTableData = (updatedTable: TableRow[]) => {
    setData((prev) => ({
      ...prev,
      table: updatedTable,
    }))

    syncChart(calculateChartData(updatedTable))
  }

  const calculateChartData = (table: TableRow[]) => ({
    [npdType]: Object.keys(table[0])
      .filter((key) => !isNaN(Number(key)))
      .map((year) => ({
        year: year,
        ...table.reduce(
          (acc, row) => ({
            ...acc,
            [row["scenario-type"].replace(/^new_/, "")]: row[year] || 0,
          }),
          {},
        ),
      })),
  })

  const availableOptions = useMemo(
    () =>
      addRowList
        .filter((item) => {
          const tableDataKeys = Object.keys(tableData).map((key) =>
            key.replace(/\s*\([^)]*\)/g, ""),
          )
          const normalizedItem = item.replace(/^new_/, "")
          const normalizedTableKeys = tableDataKeys.map((key) =>
            key.replace(/^new_/, ""),
          )
          return !normalizedTableKeys.includes(normalizedItem)
        })
        .map((item) => ({
          value: "new_" + item,
          label: item,
        })),
    [tableData],
  )

  const handleRemoveRow = useCallback(
    (scenarioType: string) => {
      if (!syncChart) return
      removeNpdRow(npdType, scenarioType)
      const updatedTable = data.table.filter(
        (row) => row["scenario-type"] !== scenarioType,
      )
      updateTableData(updatedTable)
    },
    [syncChart, data.table, removeNpdRow, npdType],
  )

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
    [data.table, syncChart, updateNpdValue, npdType],
  )

  const handleValueChange = useCallback(
    (options: Record<string, any>) => {
      const rowToUpdate = data.table.find(
        (row) => row["scenario-type"] === options["scenario-type"],
      )
      if (!rowToUpdate) return
      updateNpdValue({
        variant: npdType,
        newValue: rowToUpdate,
        isManualChange: true,
      })
    },
    [data.table, updateNpdValue, npdType],
  )

  const handleAddRow = useCallback(() => {
    const newRow = {
      "scenario-type": availableOptions[0].value,
      ...yearColumn.reduce(
        (acc, year) => {
          acc[year] = "0"
          return acc
        },
        {} as Record<string, string | null>,
      ),
    }
    const updatedTable = [...data.table, newRow]
    addNpdRow(npdType, availableOptions[0].value, {
      years: yearColumn,
      values: yearColumn.map(() => "0"),
    })
    updateTableData(updatedTable)
  }, [npdType, addRowList, yearColumn, data.table, addNpdRow])

  const handleOptionChange = useCallback(
    (selectedOption: string, options: TableRow) => {
      modifyNpdKey(options["scenario-type"], selectedOption, npdType)

      const updatedTable = data.table.map((row) => {
        if (row["scenario-type"] === options["scenario-type"]) {
          return { ...row, "scenario-type": selectedOption }
        }
        return row
      })

      updateTableData(updatedTable)
    },
    [data.table],
  )

  const handleNormalize = useCallback(() => {
    const updatedTable = [...data.table]
    const yearColumns = Object.keys(updatedTable[0]).filter(
      (key) => key !== "scenario-type" && key !== "remove-row"
    )

    yearColumns.forEach((year) => {
      const total = updatedTable.reduce((sum, row) => {
        const cellValue = row[year]
        return sum + (cellValue ? parseFloat(String(cellValue)) : 0)
      }, 0)

      if (total === 0) return

      const targetTotal = 100
      const factor = targetTotal / total

      updatedTable.forEach((row) => {
        const cellValue = row[year]
        const value = cellValue ? parseFloat(String(cellValue)) : 0
        const decimalParts = String(value).split(".")
        const hasDecimals = decimalParts.length > 1
        const roundDigits = hasDecimals
          ? Math.min(decimalParts[1].length, 3)
          : 1
        row[year] = (value * factor).toFixed(roundDigits)
      })
    })

    updateTableData(updatedTable)

    updatedTable.map((row) => {
      updateNpdValue({
        variant: npdType,
        newValue: row,
        isManualChange: true,
      })
    })
  }, [data.table])

  return (
    <PrimeReactProvider value={{ unstyled: true }}>
      {data.table.length && (
        <EditableGraphTable
          npdType={npdType}
          data={data}
          allAvailableOptions={availableOptions}
          startingYear={startingYear}
          handleRemoveRow={handleRemoveRow}
          handleOptionChange={handleOptionChange}
          handleValueChange={handleValueChange}
          handleChartSync={handleChartSync}
          variant="npd"
        />
      )}
      {availableOptions.length >= 1 && (
        <section className={"flex w-full justify-end border-t"}>
          {npdType === "market_shares_data" && (
            <Button
              className="!flex text-primary dark:text-primary dark:hover:text-primary hover:underline"
              variant="ghost"
              icon={faEquals}
              onClick={handleNormalize}
            >
              Normalize
            </Button>
          )}
          <Button
            className="!flex text-primary dark:text-primary dark:hover:text-primary hover:underline"
            variant="ghost"
            icon={faPlus}
            onClick={handleAddRow}
          >
            Add row
          </Button>
        </section>
      )}
    </PrimeReactProvider>
  )
}

export default React.memo(NpdTableHandler)
