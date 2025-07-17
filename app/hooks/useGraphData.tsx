import { BrandLaunchGraph, NpdGraph } from "@/components/OMM/types"
import { useState } from "react"

export const generateYearRange = (startYear: number, endYear: number) =>
  Array.from({ length: endYear - startYear }, (_, i) =>
    (startYear + i).toString()
  )

export const YEAR_LIMIT = 2036

const useGraphData = <T extends NpdGraph | BrandLaunchGraph>(
  initialData: T[]
) => {
  const [graphData, setGraphData] = useState<{
    original: T[]
    current: T[]
  }>({
    original: initialData,
    current: initialData,
  })

  const updateGraph = (year: string, newData?: T[]) => {
    const years = generateYearRange(Number(year), YEAR_LIMIT)
    const graphSource = newData ?? graphData.original

    setGraphData({
      original: graphSource,
      current: graphSource?.slice(0, years.length).map((data, index) => ({
        ...data,
        [data.hasOwnProperty("year") ? "year" : "years"]: Number(years[index]),
      })) as T[],
    })
  }

  return {
    graphData,
    setGraphData,
    updateGraph,
  }
}

export default useGraphData
