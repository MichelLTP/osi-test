import type React from "react"
import {
  Bar,
  BarChart as OriginalBarChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts"
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/Chart/Chart"
import { Theme, useTheme } from "@/utils/darkTheme/theme-provider"
import { BarChartProps, BarConfig } from "@/components/ui/BarChart/types"

const BarChart = ({
  chartData,
  chartConfig,
  xAxisKey,
  isStacked = false,
  isBrandLaunch = false,
}: BarChartProps) => {
  const [theme] = useTheme()

  const isDarkTheme = theme === Theme.DARK
  const textColor = isDarkTheme ? "#F4F5FB" : "#1F3044"
  const gridColor = isDarkTheme ? "#F4F5FB11" : "#e8e9ed"

  const generateBarConfig = (
    chartData: { [key: string]: any }[]
  ): BarConfig[] => {
    if (!chartData?.length) return []

    const colors = [
      "#6785FB",
      !isDarkTheme ? "#1F3044" : "#F4F5FB",
      "#DE574D",
      "#00AF86",
      "#BAC6CC",
      "#F5AF00",
      "#b056c7",
      "#9e6333",
    ]

    return Object.keys(chartData[0])
      .filter((key) => key !== xAxisKey)
      .map((key, index) => ({
        dataKey: key,
        fill: colors[index % colors.length],
        label: key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, " "),
      }))
  }

  const bars = generateBarConfig(chartData)

  return (
    <ChartContainer
      config={chartConfig}
      className="my-6 max-w-full mx-auto text-base text-secondary dark:text-white"
      isBrandLaunch={isBrandLaunch}
    >
      <OriginalBarChart
        accessibilityLayer
        data={chartData}
        stackOffset={isStacked ? "expand" : "none"}
      >
        <CartesianGrid horizontal={true} vertical={false} stroke={gridColor} />
        <XAxis
          dataKey={xAxisKey}
          tickLine={false}
          tickMargin={10}
          interval="preserveStartEnd"
          axisLine={false}
          stroke={textColor}
        />
        <YAxis
          interval="preserveEnd"
          tickLine={false}
          axisLine={false}
          stroke={textColor}
          tick={({ y, payload }) => (
            <text fill={textColor} y={y}>
              {payload.value > 0 ? payload.value : ""}
            </text>
          )}
          width={40}
        />
        <ChartTooltip
          cursor={false}
          content={
            <ChartTooltipContent
              labelFormatter={(label, payload) => {
                const xAxisValue = payload?.[0]?.payload[xAxisKey]
                return xAxisValue ? (
                  <strong>{xAxisValue.toString()}</strong>
                ) : (
                  label
                )
              }}
            />
          }
        />
        {bars.map((bar, index) => (
          <Bar
            key={index}
            dataKey={bar.dataKey}
            fill={bar.fill}
            radius={
              index === bars.length - 1 && !isStacked ? [12, 12, 0, 0] : 0
            }
            stackId="a"
          />
        ))}
        <ChartLegend content={<ChartLegendContent />} />
      </OriginalBarChart>
    </ChartContainer>
  )
}

export default BarChart
