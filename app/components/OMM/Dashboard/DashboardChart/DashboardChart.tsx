import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faMinus } from "@fortawesome/free-solid-svg-icons"
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/Chart/Chart"

import { DashboardChartProps } from "./types"
import { Theme, useTheme } from "@/utils/darkTheme/theme-provider"

const DashboardChart = ({
  graphData,
  granularity,
  isDoubleContext = false,
  measureUnit = "",
  hasScenario = false,
}: DashboardChartProps): React.ReactNode => {
  const [theme] = useTheme()

  if (!graphData || graphData.length === 0) {
    return
  }

  const chartConfig: ChartConfig = {
    solid_line: {
      label: "baseline",
      icon: () => (
        <span>
          <FontAwesomeIcon icon={faMinus} size="lg" />
          <FontAwesomeIcon icon={faMinus} size="lg" className="-ml-1" />
        </span>
      ),
    },

    dashed_line: {
      label: "scenario",
      icon: () => (
        <span className="space-x-0.5">
          <FontAwesomeIcon icon={faMinus} size="lg" />
          <FontAwesomeIcon icon={faMinus} size="lg" />
        </span>
      ),
    },

    baseline: {
      label: "context 1 baseline",
      color: "#5ECC8A",
    },

    baseline_2: {
      label: "context 2 baseline",
      color: "#6785FB",
    },
  }

  const scenarioConfig: ChartConfig = {
    ...chartConfig,
    scenario: {
      label: "context 1 scenario",
      color: "#3D9F64",
    },

    scenario_2: {
      label: "context 2 scenario",
      color: "#485DB0",
    },
  }

  const getXAxisDataKey = () => {
    if (granularity === "monthly") {
      return "month"
    } else if (granularity === "yearly") {
      return "year"
    } else {
      return "year"
    }
  }

  return (
    <ChartContainer
      config={hasScenario ? scenarioConfig : chartConfig}
      className="flex flex-1 max-h-[50vh] my-6 text-base text-secondary"
    >
      <LineChart accessibilityLayer data={graphData}>
        <CartesianGrid
          horizontal={false}
          vertical={false}
          stroke={
            theme ? (theme === Theme.DARK ? "#F4F5FB11" : "#e8e9ed") : "#F4F5FB"
          } // secondary (less opacity) or third
        />
        <XAxis
          dataKey={getXAxisDataKey()}
          tickLine={false}
          axisLine={true}
          stroke={
            theme ? (theme === Theme.DARK ? "#F4F5FB" : "#1F3044") : "#1F3044"
          } //secondary or third
          tickMargin={8}
          interval="preserveStartEnd"
        />
        <YAxis
          interval="preserveEnd"
          tickLine={false}
          axisLine={false}
          stroke={
            theme ? (theme === Theme.DARK ? "#F4F5FB" : "#1F3044") : "#1F3044"
          }
          tick={({ y, payload }) => (
            <text
              className="bg-red-500"
              fill={
                theme
                  ? theme === Theme.DARK
                    ? "#F4F5FB"
                    : "#1F3044"
                  : "#1F3044"
              }
              y={y}
            >
              {payload.value > 0 ? payload.value : ""}
            </text>
          )}
          width={70}
        />
        <ChartTooltip
          cursor={false}
          content={
            <ChartTooltipContent
              indicator={Object.keys(chartConfig).length > 1 ? "dot" : "line"}
              labelFormatter={(label, payload) => {
                const xAxisValue = payload?.[0]?.payload[getXAxisDataKey()]
                return xAxisValue ? xAxisValue.toString() : label
              }}
              valueFormatter={(value) => `${value} ${measureUnit}`}
            />
          }
        />

        <Line dataKey="solid_line"></Line>

        {hasScenario && <Line dataKey="dashed_line"></Line>}

        <Line
          dataKey="baseline"
          type="monotone"
          stroke="#5ECC8A"
          strokeWidth={2}
          dot={false}
        />

        {hasScenario && (
          <Line
            dataKey="scenario"
            type="monotone"
            stroke="#3D9F64"
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={false}
          ></Line>
        )}

        {isDoubleContext && (
          <Line
            dataKey="baseline_2"
            type="monotone"
            stroke="#6785FB"
            strokeWidth={2}
            dot={false}
          />
        )}

        {hasScenario && isDoubleContext && (
          <Line
            dataKey="scenario_2"
            type="monotone"
            stroke="#485DB0"
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={false}
          ></Line>
        )}
        <ChartLegend content={<ChartLegendContent />} />
      </LineChart>
    </ChartContainer>
  )
}

export default DashboardChart
