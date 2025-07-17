import React, { useEffect, useState } from "react"
import { TableMeta, CellValue } from "../types"
import EditableTable from "@/components/OMM/EditableTable/EditableTable"
import { ColumnDef } from "@tanstack/react-table"
import { useScenarioTableStore } from "@/store/omm"

interface DataTableProps<TData extends object> {
  data: TData[]
  year: string
  month: number
  marketID: string
}

export function DynamicDataTableHandler<TData extends object>({
  data,
  year,
  month,
  marketID,
}: DataTableProps<TData>) {
  const { saveBanData } = useScenarioTableStore()

  const [tableData, setTableData] = useState<{
    headers: ColumnDef<TData>[]
    table: TData[]
  }>({
    headers: [],
    table: [],
  })

  // Method to transform row data
  const transformRowData = (year: string, row: TData) => {
    const data = {
      [year]: Object.keys(row)
        .filter((key) => key !== "LabelColumn")
        .reduce(
          (acc, key) => {
            acc[key] = {
              value: row[key]?.value || 0,
              format: row[key]?.format || "%",
            }
            return acc
          },
          {} as Record<string, { value: number; format: string }>
        ),
    }

    return data
  }

  // Editable cell component
  const EditableCell = ({
    row,
    table,
    column,
    getValue,
  }: {
    row: any
    table: any
    column: any
    value: number
    getValue: () => CellValue
  }) => {
    const initialValue = getValue()?.value ?? ""
    const [inputValue, setInputValue] = useState<CellValue>(
      initialValue.toFixed(0)
    )

    useEffect(() => {
      setInputValue(initialValue)
    }, [initialValue])

    const onBlur = (newValue: string) => {
      ;(table.options.meta as TableMeta).updateData(
        row.index,
        column.id,
        isNaN(parseFloat(newValue)) ? 0 : parseFloat(newValue),
        getValue()?.format
      )

      const newValues = row
        .getAllCells()
        .filter((cell: any) => cell.id !== "0_LabelColumn")
        .reduce((acc: any, cell: any) => {
          const cellId = cell.column.id
          acc[cellId] = {
            value:
              cellId === column.id
                ? parseFloat(newValue)
                : cell.getValue()?.value,
            format: cell.getValue()?.format,
          }
          return acc
        }, {})

      const transformedData = transformRowData(year, newValues)

      saveBanData({
        market_id: Number(marketID),
        month_launch: month,
        tableData: transformedData,
      })
    }

    return (
      <input
        type="number"
        inputMode={"decimal"}
        value={inputValue}
        onBlur={(e) => onBlur(e.target.value)}
        onChange={(e) => {
          setInputValue(parseFloat(e.target.value))
        }}
        className={
          "h-auto max-w-28 mx-auto input-focus text-center !pt-0 !px-0 bg-transparent border-b border-b-primary rounded-none transition-colors duration-300 focus:border-x-0 focus:border-t-0 focus:border-b-secondary dark:focus:border-b-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        }
      />
    )
  }

  // Generate columns based on data
  const generateColumns = (data: TData[]): ColumnDef<TData>[] => {
    if (data.length === 0) return [] // No data, no columns

    const firstRow = data[0]

    const labelColumn: ColumnDef<TData> = {
      accessorKey: "LabelColumn",
      header: "Product Segment",
      cell: () => <span className="font-bold">Volume Share %</span>,
    }

    const columns = Object.keys(firstRow).map((key) => ({
      accessorKey: key,
      header: key,
      cell: ({ row, column, table, getValue }) => (
        <EditableCell
          getValue={getValue}
          row={row}
          table={table}
          column={column}
          value={row.original[key]?.value}
        />
      ),
    }))

    return [labelColumn, ...columns]
  }

  useEffect(() => {
    setTableData({
      headers: generateColumns(data),
      table: data,
    })
  }, [year])

  return (
    <EditableTable
      columns={tableData.headers as ColumnDef<unknown>[]}
      initialData={tableData.table}
      variant={"BAN"}
    />
  )
}

export default DynamicDataTableHandler
