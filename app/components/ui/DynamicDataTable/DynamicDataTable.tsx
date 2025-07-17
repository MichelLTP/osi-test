import React, { useEffect, useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../Table/Table"
import {
  CellValue,
  ParsedTableData,
  StyleProps,
  TableData,
  TableMatrix,
} from "./types"
import { clsx } from "clsx"
import { useNavigation } from "@remix-run/react"
import Pagination from "@/components/ui/Pagination/Pagination"
import { getPaginatedItems } from "@/utils/sharedFunctions"

function DynamicDataTable({
  tableData,
  variant = "default",
  onRowClick,
  isClickable,
  hasPagination,
  rowsPerPage,
}: {
  tableData: TableData
  variant?: "default" | "omm-custom"
  onRowClick?: (param1: CellValue, param2: CellValue) => void
  isClickable?: boolean
  hasPagination?: boolean
  rowsPerPage?: number
}) {
  const navigation = useNavigation()
  const [data, setData] = useState<ParsedTableData>({
    header: [],
    values: [],
  })
  const [currentPage, setCurrentPage] = useState(0)

  useEffect(() => {
    try {
      const parsedData: ParsedTableData = tableData.body
        ? typeof tableData.body === "string"
          ? JSON.parse(tableData.body)
          : tableData.body
        : tableData

      if (
        !Array.isArray(parsedData.values) ||
        !Array.isArray(parsedData.header)
      ) {
        console.error("Invalid table data format")
        return
      }

      const rowsData: TableMatrix =
        parsedData.values[0]?.map((_, rowIndex) =>
          parsedData.values.map((column) => column[rowIndex] ?? null)
        ) ?? []

      setData({
        header: parsedData.header,
        values: rowsData,
      })
    } catch (error) {
      console.error("Error parsing table data:", error)
      setData({ header: [], values: [] })
    }
  }, [tableData])

  const getColumnWidth = (columnIndex: number): number => {
    const headerLength = data.header[columnIndex]?.toString().length ?? 0
    const valuesLengths = data.values.map(
      (row) => row[columnIndex]?.toString().length ?? 0
    )
    const maxLength = Math.max(headerLength, ...valuesLengths)
    return Math.max(maxLength * 8, 60)
  }

  const getHeaderStyle = (index: number, isDate: boolean): StyleProps => ({
    minWidth: isDate ? "10ch" : `${getColumnWidth(index)}px`,
    position: "sticky",
    top: 0,
    backgroundColor: "inherit",
  })

  const getCellStyle = (
    index: number,
    cell?: CellValue,
    columnName?: string
  ): StyleProps => ({
    minWidth:
      columnName === "Created Date" ? "10ch" : `${getColumnWidth(index)}px`,
    fontWeight: columnName === "Name" ? "normal" : "",
    color:
      variant === "omm-custom" && cell
        ? {
            Generated: "#5ECC8A",
            Saved: "#5ECC8A",
            Draft: "orange",
            Deleted: "red",
          }[cell] || "inherit"
        : "inherit",
  })

  const formatCell = (cell: CellValue): string => {
    if (cell === null) return ""
    return typeof cell === "number" ? cell.toLocaleString() : String(cell)
  }

  const itemsPerPage = hasPagination ? (rowsPerPage ?? 1) : data.values.length
  const paginatedData = getPaginatedItems(
    data.values,
    itemsPerPage,
    currentPage
  )

  return (
    <div className="w-full overflow-auto custom-scrollbar dark-scrollbar scrollbar-gray">
      <Table>
        <TableHeader>
          <TableRow>
            {data.header.map((header, index) => (
              <TableHead
                key={`header-${header}-${index}`}
                className={clsx(
                  "font-bold pb-4 px-8 whitespace-nowrap text-secondary dark:text-white",
                  variant === "omm-custom" && "pl-0", // This ensures the text is aligned to the left in the modal
                  variant === "omm-custom" && header === "Metric" && "opacity-0"
                )}
                style={getHeaderStyle(index, header === "Created Date")}
              >
                {header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedData.map((row, rowIndex) => (
            <TableRow
              key={`header-${row[0]}-${row[1]}`}
              className={clsx(
                isClickable &&
                  "hover:bg-third hover:dark:bg-secondary-dark hover:cursor-pointer",
                isClickable &&
                  navigation.state === "loading" &&
                  "opacity-50 pointer-events-none animate-pulse"
              )}
              onClick={
                variant === "omm-custom" && isClickable && onRowClick
                  ? () => onRowClick(row[0], row[1]) // Pass the first row cell, that represents ID
                  : undefined
              }
            >
              {(variant === "omm-custom" && isClickable
                ? row.filter((_, cellIndex) => cellIndex !== 0)
                : row
              ).map((cell, cellIndex) => (
                <TableCell
                  key={`cell-${rowIndex}-${cellIndex}`}
                  style={getCellStyle(cellIndex, cell, data?.header[cellIndex])}
                  className={clsx(
                    "py-3 px-8 text-pretty hyphens-auto",
                    variant === "omm-custom" && "pl-0 break-all", // This ensures the text is aligned to the left in the modal
                    variant === "omm-custom" &&
                      formatCell(cell).length <= 25 &&
                      "!whitespace-nowrap", // This avoids breaking the text, specially at the dashboard
                    variant === "omm-custom" && cellIndex === 0 && "font-bold"
                  )}
                >
                  {formatCell(cell)}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {hasPagination && (
        <div className="mt-4 flex justify-center">
          <Pagination
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            totalItems={data.values.length}
            itemsPerPage={itemsPerPage}
            isModal={variant === "omm-custom"}
          />
        </div>
      )}
    </div>
  )
}

export default React.memo(DynamicDataTable)
