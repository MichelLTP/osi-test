import {
  ColumnMeta,
  SimpleMarketData,
  TableMeta,
} from "@/components/OMM/EditableTable/types"
import React, { useMemo } from "react"
import { useScenarioTableStore } from "@/store/omm"
import { SharedInput } from "@/components/OMM/EditableTable/EditableTableCell/SharedInput"
import { EditableTableCellProps } from "@/components/OMM/EditableTable/EditableTableCell/types"

export const MeasureCell = <TData, TValue>({
  row,
  column,
  table,
  value,
  setValue,
}: EditableTableCellProps<TData, TValue>) => {
  const { updateMonthlyData } = useScenarioTableStore()
  const tableMeta = table.options.meta as TableMeta<TData>
  const columnMeta = column.columnDef.meta as ColumnMeta

  const isBaseline = useMemo(
    () => row.getAllCells().some((cell) => cell.getValue() === "Baseline"),
    [row]
  )

  const onBlur = () => {
    tableMeta.updateData(row.index, column.id, value)
    if (columnMeta.isYearly) {
      const updateObject = {
        marketId: Number(columnMeta.market),
        driver: columnMeta.driver ?? "",
        year: columnMeta.year ?? "",
        productKey: columnMeta.product ?? "",
        companyKey: columnMeta.company ?? "",
        category: columnMeta.category,
        round_digits: columnMeta.round_digits ?? 2,
        value: value,
      }
      updateMonthlyData(updateObject)
    }
  }

  if (isBaseline) {
    return <>{value}</>
  }

  return (
    <SharedInput
      value={value}
      setValue={setValue}
      onBlur={onBlur}
      column={column}
      row={row}
    />
  )
}
