import { ChartConfig } from "@/components/ui/Chart/Chart"

export interface BarConfig {
  dataKey: string
  fill: string
  label: string
}

export interface BarChartProps {
  chartData: { [key: string]: any }[]
  chartConfig: ChartConfig
  xAxisKey: string
  isStacked?: boolean
  isBrandLaunch?: boolean
}
