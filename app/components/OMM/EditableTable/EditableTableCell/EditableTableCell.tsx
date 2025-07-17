import { CellValue, ColumnMeta } from "@/components/OMM/EditableTable/types"
import React, { useEffect, useState } from "react"
import { MeasureCell } from "@/components/OMM/EditableTable/EditableTableCell/MeasureCell"
import { BaseEditableTableCellProps } from "@/components/OMM/EditableTable/EditableTableCell/types"
import { MonthlyMeasureCell } from "@/components/OMM/EditableTable/EditableTableCell/MonthlyMeasureCell"

export const EditableTableCell = <TData, TValue>({
  getValue,
  row,
  column,
  table,
}: BaseEditableTableCellProps<TData, TValue>) => {
  const initialValue = getValue() ?? ""
  const columnMeta = column.columnDef.meta as ColumnMeta
  const [value, setValue] = useState<CellValue>(initialValue)

  useEffect(() => {
    setValue(initialValue)
  }, [initialValue])

  const isMeasure = columnMeta.isMeasure

  if (isMeasure && columnMeta.isMonthly) {
    return <MonthlyMeasureCell {...{ row, column, table, value, setValue }} />
  }

  if (isMeasure) {
    return <MeasureCell {...{ row, column, table, value, setValue }} />
  }

  return null
}

export default React.memo(EditableTableCell)
