import { ColumnMeta } from "@/components/OMM/EditableTable/types"
import React, { useMemo } from "react"
import { Cell } from "@tanstack/table-core"
import { Input } from "@/components/ui/Input/Input"
import { SharedInputProps } from "@/components/OMM/EditableTable/EditableTableCell/types"

export const SharedInput = <TData, TValue>({
  value,
  setValue,
  onBlur,
  column,
  row,
}: SharedInputProps<TData, TValue>) => {
  const columnMeta = column.columnDef.meta as ColumnMeta

  const maxWidth = useMemo(
    () =>
      row.getAllCells().reduce((acc: number, cell: Cell<any, unknown>) => {
        const cellValue = cell.getValue()
        const stringValue =
          cellValue != null &&
          cellValue !== "New Scenario" &&
          !isNaN(Number(cellValue))
            ? String(cellValue)
            : ""
        return Math.max(acc, stringValue.length)
      }, 0),
    [row]
  )

  return (
    <Input
      value={value}
      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
        setValue(e.target.value)
      }
      inputMode={"decimal"}
      onBlur={onBlur}
      type={columnMeta.type ?? "text"}
      className={
        "h-auto mx-auto input-focus text-center !pt-0 !px-0 bg-transparent border-b " +
        "border-b-primary rounded-none transition-colors duration-300 focus:border-x-0 " +
        "focus:border-t-0 focus:border-b-secondary dark:focus:border-b-white [appearance:textfield] " +
        "[&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
      }
      style={{ width: maxWidth ? `${maxWidth * 10}px` : "100px" }}
    />
  )
}
