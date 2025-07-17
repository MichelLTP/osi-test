import React, { useEffect, useRef, useState } from "react"
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../ui/Table/Table"
import {
  ColumnMeta,
  EditableTableProps,
} from "@/components/OMM/EditableTable/types"
import { clsx } from "clsx"
import { useVirtualizer } from "@tanstack/react-virtual"

const EditableTable = <TData, TValue>({
  columns,
  initialData,
  variant = "default",
}: EditableTableProps<TData, TValue>) => {
  const [data, setData] = React.useState<TData[]>(initialData)
  const skipPageResetRef = useRef(false)
  const virtualizedParent = React.useRef(null)
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})

  useEffect(() => {
    const initialVisibility = columns.reduce((acc, column) => {
      if ((column.meta as ColumnMeta)?.hidden && (column as any)?.accessorKey) {
        acc[(column as any).accessorKey as string] = false
      } else {
        acc[(column as any).accessorKey as string] = true
      }
      return acc
    }, {} as VisibilityState)
    setColumnVisibility(initialVisibility)
  }, [columns])

  const updateData = (
    rowIndex: number,
    columnId: string,
    value: any,
    number_format?: string
  ) => {
    skipPageResetRef.current = true // Prevent page reset

    setData((oldData) =>
      oldData.map((row, index) => {
        if (index === rowIndex) {
          return {
            ...row,
            [columnId]: number_format
              ? { value: Number(value) ?? value, format: number_format }
              : (Number(value) ?? value),
          }
        }
        return row
      })
    )
  }

  const table = useReactTable<TData>({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    meta: {
      updateData,
    },
    enableHiding: true,
    autoResetPageIndex: !skipPageResetRef.current,
    autoResetExpanded: !skipPageResetRef.current,
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      columnVisibility,
    },
  })

  useEffect(() => {
    skipPageResetRef.current = false
  })

  useEffect(() => {
    setData(initialData)
  }, [initialData])

  const { rows } = table.getRowModel()

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => virtualizedParent.current,
    estimateSize: () => 35,
    overscan: 20,
  })

  return (
    <div className="my-2 w-full" ref={virtualizedParent}>
      <Table
        style={{ height: `${rowVirtualizer.getTotalSize()}px` }}
        className={`${variant === "brandLaunch" || variant === "default" ? "w-full" : "!w-fit"}`}
      >
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header, index) => (
                <TableHead
                  key={header.id}
                  className={clsx(
                    "font-semibold py-4",
                    index === 0 && variant === "default"
                      ? "text-left whitespace-nowrap"
                      : "text-center",
                    variant === "BAN" && index === 0
                      ? "text-left"
                      : "whitespace-nowrap",
                    index === 0 && variant === "brandLaunch" && "pl-0 text-left"
                  )}
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            rowVirtualizer.getVirtualItems().map((row) => (
              <TableRow
                key={rows[row.index].id}
                data-state={rows[row.index].getIsSelected() && "selected"}
                className="py-4"
              >
                {rows[row.index].getVisibleCells().map((cell, index) => (
                  <TableCell
                    key={cell.id}
                    className={clsx(
                      "py-4 h-[45px]",
                      index === 0 && variant === "default"
                        ? "min-w-[100px] pr-4 whitespace-nowrap"
                        : "px-4 text-center",
                      variant === "BAN" && index === 0
                        ? "whitespace-nowrap pl-2 pr-10"
                        : "px-6",
                      index === 0 &&
                        variant === "brandLaunch" &&
                        "whitespace-nowrap pl-0 pr-16 text-left"
                    )}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}

export default React.memo(EditableTable)
