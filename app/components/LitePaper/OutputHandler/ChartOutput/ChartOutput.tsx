import React from "react"
import PlotlyThemeWrapper from "@/components/ui/PlotlyWrapper/PlotlyThemeWrapper"
import PlotlyWrapper from "@/components/ui/PlotlyWrapper/PlotlyWrapper"
import { Theme, useTheme } from "@/utils/darkTheme/theme-provider"
import { OutputSectionResponse } from "@/components/LitePaper/Output/types"

const ChartOutput = ({ content }: { content: OutputSectionResponse }) => {
  if (!content.chartData) return <></>

  const { body: data } = content.chartData
  const [theme] = useTheme()

  return (
    <section className="p-4 rounded-sm my-4 text-secondary dark:text-white">
      {typeof data !== "string" && data?.light ? (
        <PlotlyThemeWrapper
          index={content?.uuid}
          lightContent={data?.light}
          darkContent={data?.dark}
          theme={theme as Theme}
        />
      ) : (
        <PlotlyWrapper
          index={content?.uuid}
          content={JSON.parse(data as string)}
        />
      )}
    </section>
  )
}
export default ChartOutput
