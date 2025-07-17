import { ColumnDef } from "@tanstack/react-table"
import React from "react"
import {
  BrandLaunchGraph,
  Category,
  NpdDataProps,
  SimpleBrandLaunchTable,
} from "@/components/OMM/types"
import { BaseEditableTableCellProps } from "@/components/OMM/EditableTable/EditableTableCell/types"

export interface EditableTableProps<TableRow, TableColumn> {
  columns: ColumnDef<TableRow, TableColumn>[]
  initialData: TableRow[]
  variant?: "default" | "BAN" | "brandLaunch"
}

export type SimpleMarketData = {
  years: string[]
  values: string[]
}

export type FullMarketData<
  T extends SimpleMarketData | BaseMonthlyMarketData = SimpleMarketData,
> = T & {
  format: string
  round_digits: number
}

export type BaseMonthlyMarketData = {
  months: string[]
  values: number[]
}

export type MonthlyMarketData = {
  [year: string]: FullMarketData<BaseMonthlyMarketData>
}

export type MonthlyHandlerProps = {
  tableData: {
    months: string[]
    values: number[]
    format: string
    round_digits: number
    product?: string
    company?: string
    baseline?: BaseMonthlyMarketData
  }
  tableTitle: string
  driverId: string
  marketId: number
  category: Category
}

export type TableHandlerProps = {
  tableData: {
    baseline: FullMarketData
    scenario: FullMarketData
    tableTitle: string
    isProduct: boolean
    isCompany: boolean
    company: string
    product: string
    category: Category
  }
  tableTitle: string
  hasPropagation?: boolean
  isAverage?: boolean
  propagationData?: SimpleMarketData & { product?: string }
  driverId: string
  marketId: number
}

export type BrandLaunchTableHandlerProps = {
  tableData: {
    [row: string]: SimpleMarketData
  }
  tableTitle: string
  startingYear: string
  syncChart:
    | ((data: BrandLaunchGraph[]) => void)
    | ((value: Partial<NpdDataProps>) => void)
}

export type NpdTableHandlerProps = BrandLaunchTableHandlerProps & {
  addRowList: string[]
  syncChart: (value: Partial<NpdDataProps>) => void
}

export type TableHandlerData = {
  headers: TableHeader[] | null
  table: TableRow[]
}

type TableHeader = {
  accessorKey: string
  header: React.ReactNode
  cell?: (
    props: BaseEditableTableCellProps<TableRow, CellValue>
  ) => React.ReactNode
  meta?: ColumnMeta
}

export type TableRow = {
  "scenario-type": string
  [year: string]: CellValue
}

export type CellValue = string | number

export type TableMeta<TData> = {
  updateData: (
    rowIndex: number,
    columnId: string,
    value: string | number,
    number_format?: string
  ) => void
  removeRow: (rowIndex: number) => TData[]
}

export type ColumnMeta = {
  type?: string
  driver?: string
  round_digits?: number
  format?: string
  hidden?: boolean
  isMeasure?: boolean
  isMonthly?: boolean
  isYearly?: boolean
  company?: string
  product?: string
  market: string
  scenario: number
  category: Category
  year?: string
  setSharedKeys?: (value: string[]) => void
  syncChart?: (data: SimpleBrandLaunchTable | Partial<NpdDataProps>) => void
}
