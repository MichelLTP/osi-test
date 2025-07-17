import { Column, Row, Table } from "@tanstack/table-core"
import React from "react"
import {
  CellValue,
  TableHandlerData,
  TableRow,
} from "@/components/OMM/EditableTable/types"
import { NpdVariant } from "@/store/omm"

interface ColumnRows<TData, TValue> {
  column: Column<TData, TValue>
  row: Row<TData>
}

interface InputValueProps {
  value: CellValue
  setValue: React.Dispatch<React.SetStateAction<CellValue>>
}

export interface BaseEditableTableCellProps<TData, TValue>
  extends ColumnRows<TData, TValue> {
  getValue: () => CellValue
  table: Table<TData>
}

export interface EditableTableCellProps<TData, TValue>
  extends InputValueProps,
    ColumnRows<TData, TValue> {
  table: Table<TData>
}

export type SharedInputProps<TData, TValue> = ColumnRows<TData, TValue> &
  InputValueProps & {
    onBlur: () => void
  }

export type NpdTableProps = {
  npdType: NpdVariant
  allAvailableOptions: { value: string; label: string }[]
  handleRemoveRow: (scenarioType: string) => void
  handleOptionChange: (value: string, options: TableRow) => void
  handleValueChange: (
    options: TableRow & {
      field: string
    },
    value: string
  ) => void
} & BrandLaunchTableProps

export type BrandLaunchTableProps = {
  data: TableHandlerData
  startingYear: string
  handleChartSync: (
    options: TableRow & {
      field: string
    },
    value: string
  ) => void
}
