export interface FetcherGraphData {
  graphData: GraphData
  graphData2: GraphData
  contextType: string
  tableData: TableData
  sourcesData: string[]
  availableYears: number[]
}

export interface GraphData {
  [key: string]: GraphDataItem[]
}

export interface GraphDataItem {
  year?: number
  month?: number
  baseline: number
  scenario?: number
}

export interface TableData {
  baselineData: TableDataItem
  scenarioData: TableDataItem
}

export interface TableDataItem {
  [key: string]: {
    unit: string
    values: {
      [year: string]: number
    }
  }
}
