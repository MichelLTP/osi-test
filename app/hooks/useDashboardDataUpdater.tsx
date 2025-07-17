import { useState, useEffect } from "react"
import {
  FetcherGraphData,
  GraphDataItem,
  TableData,
} from "@/components/OMM/Dashboard/type"
import { PeriodGranularity } from "@/components/OMM/Dashboard/DashboardOptions/type"

interface UseDashboardDataUpdaterProps {
  fetcherData: FetcherGraphData
  activeMeasure: string
  activePeriod: PeriodGranularity
  isDoubleContext: boolean
  activeOption: keyof TableData
  scenarioID: number | null
  tableMeasures: string[]
  transformData: (data: any) => any
}

export const useDashboardDataUpdater = ({
  fetcherData,
  activeMeasure,
  activePeriod,
  isDoubleContext,
  activeOption,
  scenarioID,
  tableMeasures,
}: UseDashboardDataUpdaterProps) => {
  const [updatedGraphData, setUpdatedGraphData] = useState<{
    graphValues: GraphDataItem[]
  }>({ graphValues: [] })
  const [updatedTableData, setUpdatedTableData] = useState<{ tableValues: {} }>(
    { tableValues: {} }
  )
  const [updatedSourceData, setUpdatedSourceData] = useState<{
    sourceValues: string[]
  }>({
    sourceValues: [],
  })
  const [availableYears, setAvailableYears] = useState([
    new Date().getFullYear(),
  ])

  const generateTransformedTable = (
    tableData: TableData,
    tableMeasures: string[],
    activeOption: keyof TableData
  ) => {
    const optionData = tableData?.[activeOption]
    const tableDataKeys = Object.keys(
      optionData ?? {}
    ) as (keyof typeof optionData)[]
    if (tableDataKeys.length === 0) return { header: [], values: [] }

    const firstEntry = optionData?.[tableDataKeys[0]]
    const years = Object.keys(firstEntry?.values ?? {})

    const filteredTableData = Object.fromEntries(
      Object.entries(optionData ?? {}).filter(([key]) =>
        tableMeasures.includes(key)
      )
    )
    const filteredTableDataKeys = Object.keys(filteredTableData)
    const filteredTableDataUnits = filteredTableDataKeys.map(
      (metric) =>
        `${metric}${
          filteredTableData[metric]?.unit
            ? ` (${filteredTableData[metric]?.unit})`
            : ""
        }`
    )

    return {
      header: ["Metric", ...years],
      values: [
        filteredTableDataUnits,
        ...years.map((year: string) =>
          filteredTableDataKeys.map(
            (metric) => filteredTableData[metric]?.values?.[year] ?? null
          )
        ),
      ],
    }
  }

  const getAllXValues = <T extends PeriodGranularity>(
    dataSets: GraphDataItem[][],
    period: T
  ): T extends "monthly" ? string[] : number[] => {
    const allValues = dataSets
      .flat()
      .map((item) => (period === "monthly" ? item?.month : item?.year))

    const unique = Array.from(new Set(allValues))

    return (
      period === "monthly"
        ? unique
        : unique.sort((a, b) => (a as number) - (b as number))
    ) as any
  }

  useEffect(() => {
    if (fetcherData?.graphData) {
      const {
        graphData,
        contextType,
        graphData2,
        tableData,
        sourcesData,
        availableYears: yearsFromData,
      } = fetcherData

      if (!isDoubleContext) {
        setUpdatedGraphData({ graphValues: graphData?.[activeMeasure] ?? [] })
        setUpdatedTableData({
          tableValues: generateTransformedTable(
            tableData,
            tableMeasures,
            activeOption
          ),
        })
        setUpdatedSourceData({ sourceValues: sourcesData ?? [] })
        setAvailableYears(yearsFromData ?? [new Date().getFullYear()])
      } else {
        let allXValues: string[] | number[] = []

        if (updatedGraphData && contextType !== "3") {
          allXValues = getAllXValues(
            [
              graphData?.[activeMeasure] ?? [],
              updatedGraphData.graphValues ?? [],
            ],
            activePeriod
          )
        } else {
          allXValues = getAllXValues(
            [
              graphData?.[activeMeasure] ?? [],
              graphData2?.[activeMeasure] ?? [],
            ],
            activePeriod
          )
        }
        setUpdatedGraphData((prevData = { graphValues: [] }) => {
          const getItem = (dataArr: any[], XValue: any) =>
            (dataArr ?? []).find((dataItem: any) =>
              activePeriod === "monthly"
                ? dataItem?.month === XValue
                : dataItem?.year === XValue
            )

          if (contextType === "1") {
            return {
              graphValues: allXValues.map((XValue) => {
                const item1 = getItem(graphData?.[activeMeasure], XValue)
                const item2 = getItem(prevData.graphValues, XValue)
                return {
                  ...(activePeriod === "monthly"
                    ? { month: XValue }
                    : { year: XValue }),
                  baseline: item1?.baseline ?? null,
                  baseline_2: item2?.baseline ?? null,
                  ...(typeof scenarioID === "number"
                    ? { scenario: item1?.scenario, scenario_2: item2?.scenario }
                    : {}),
                }
              }),
            }
          } else if (contextType === "2") {
            return {
              graphValues: allXValues.map((XValue) => {
                const item1 = getItem(prevData.graphValues, XValue)
                const item2 = getItem(graphData?.[activeMeasure], XValue)
                return {
                  ...(activePeriod === "monthly"
                    ? { month: XValue }
                    : { year: XValue }),
                  baseline: item1?.baseline ?? null,
                  baseline_2: item2?.baseline ?? null,
                  ...(typeof scenarioID === "number"
                    ? { scenario: item1?.scenario, scenario_2: item2?.scenario }
                    : {}),
                }
              }),
            }
          } else {
            return {
              graphValues: allXValues.map((XValue) => {
                const item1 = getItem(graphData?.[activeMeasure], XValue)
                const item2 = getItem(graphData2?.[activeMeasure], XValue)
                return {
                  ...(activePeriod === "monthly"
                    ? { month: XValue }
                    : { year: XValue }),
                  baseline: item1?.baseline ?? null,
                  baseline_2: item2?.baseline ?? null,
                  ...(typeof scenarioID === "number"
                    ? { scenario: item1?.scenario, scenario_2: item2?.scenario }
                    : {}),
                }
              }),
            }
          }
        })

        setUpdatedTableData({
          tableValues: generateTransformedTable(
            tableData,
            tableMeasures,
            activeOption
          ),
        })
        setUpdatedSourceData({ sourceValues: sourcesData ?? [] })
        setAvailableYears(yearsFromData ?? [new Date().getFullYear()])
      }
    } else {
      setUpdatedGraphData({ graphValues: [] })
      setUpdatedTableData({ tableValues: {} })
      setUpdatedSourceData({ sourceValues: [] })
      setAvailableYears([new Date().getFullYear()])
    }
  }, [fetcherData, activeMeasure, activeOption])

  useEffect(() => {
    if (fetcherData?.tableData) {
      setUpdatedTableData({
        tableValues: generateTransformedTable(
          fetcherData.tableData,
          tableMeasures,
          activeOption
        ),
      })
    }
  }, [tableMeasures])

  return {
    updatedGraphData,
    updatedTableData,
    updatedSourceData,
    availableYears,
  }
}
