// Define more specific types for table data
export type CellValue = string | number | null
export type TableRow = CellValue[]
export type TableMatrix = TableRow[]

export interface ParsedTableData {
  header: string[]
  values: TableMatrix
}

export interface TableData {
  type?: string
  body?: string
  header?: string[]
  values?: TableMatrix
}

export interface StyleProps {
  minWidth: string
  position?: "sticky"
  color?: string
  top?: number
  backgroundColor?: string
  fontWeight?: string
}
