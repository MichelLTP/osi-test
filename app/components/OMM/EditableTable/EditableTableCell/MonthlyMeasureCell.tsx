import { ColumnMeta, TableMeta } from "@/components/OMM/EditableTable/types"
import React, { useMemo } from "react"
import { useScenarioTableStore } from "@/store/omm"
import { SharedInput } from "@/components/OMM/EditableTable/EditableTableCell/SharedInput"
import { EditableTableCellProps } from "@/components/OMM/EditableTable/EditableTableCell/types"

export const MonthlyMeasureCell = <TData, TValue>({
  row,
  column,
  table,
  value,
  setValue,
}: EditableTableCellProps<TData, TValue>) => {
  const { saveMonthlyData } = useScenarioTableStore()
  const tableMeta = table.options.meta as TableMeta<TData>
  const columnMeta = column.columnDef.meta as ColumnMeta

  const isBaseline = useMemo(
    () => row.getAllCells().some((cell) => cell.getValue() === "Baseline"),
    [row]
  )

  const onBlur = () => {
    tableMeta.updateData(row.index, column.id, value)
    const newValues = row
      .getAllCells()
      .filter((cell) => cell.getValue() !== "New Scenario")
      .map((cell) => {
        const cellId = cell.column.id
        return cellId === column.id
          ? [cellId, value]
          : [cellId, cell.getValue()]
      })

    const monthlyObject = {
      months: newValues.map((item) => item[0] as string),
      values: newValues.map((value) => value[1] as number),
      driver: columnMeta.driver ?? "",
      market_id: Number(columnMeta.market) ?? "",
      companyKey: columnMeta.company ?? "",
      productKey: columnMeta.product ?? "",
      category: columnMeta.category,
      year: columnMeta.year,
      scenario_id: columnMeta.scenario ?? "",
    }
    saveMonthlyData(monthlyObject)
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
