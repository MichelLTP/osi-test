export type DashboardChartProps = {
  graphData: graphValues[]
  granularity: string
  isDoubleContext?: boolean
  hasScenario?: boolean
  measureUnit?: string
}

export type graphValues = {
  baseline: number
  scenario?: number
  baseline_2?: number
  scenario_2?: number
}
