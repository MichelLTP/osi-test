import { useEffect, useMemo, useState } from "react"
import { useScenarioTableStore } from "@/store/omm"
import {
  Category,
  MarketLevel,
  ProductCompanySelection,
  ProductCompanyTableData,
} from "@/components/OMM/types"
import { MonthlyMarketData } from "@/components/OMM/EditableTable/types"
import { getYearlyAverages } from "@/routes/omm.scenarios.$category.monthly.$driver"

interface DriverDataProps {
  category: Category
  baselineDriverData: MarketLevel<MonthlyMarketData>
  scenarioDriverData: MarketLevel<MonthlyMarketData>
  driverLabel: string
  marketId: string
  currentSelection: ProductCompanySelection
  setCurrentSelection: (
    update: (prev: ProductCompanySelection) => ProductCompanySelection
  ) => void
  years: number[] | string[]
  averages: string[]
  activeYear: string | number
  driverId: string
  bubbleChange: ProductCompanyTableData
}

export function UseMonthlyDriverData({
  category,
  baselineDriverData,
  scenarioDriverData,
  years,
  averages,
  activeYear,
  driverLabel,
  driverId,
  marketId,
  bubbleChange,
  currentSelection,
  setCurrentSelection,
}: DriverDataProps) {
  const { monthlyData } = useScenarioTableStore()
  const hasBubbleChange = bubbleChange.scenarioChange

  const [currentAverages, setCurrentAverages] = useState<string[]>(
    averages ?? []
  )

  const getStoredData = () => {
    const baseData = monthlyData[Number(marketId)]
    if (!baseData) return null

    if (category === "market_level") return baseData["market_level"]?.[driverId]
    if (
      category === "company_level" &&
      currentSelection.product &&
      currentSelection.company
    )
      return baseData["company_level"]?.[driverId]?.[
        currentSelection.product
      ]?.[currentSelection.company]
    if (category === "product_level" && currentSelection.product)
      return baseData["product_level"]?.[driverId]?.[currentSelection.product]
    return null
  }

  useEffect(() => {
    const storedData = getStoredData()
    if (!storedData) return

    const storedYears = Object.keys(storedData)
    const storedAverages = storedYears.map((year) => {
      let roundDigits: number | undefined
      if (category === "market_level" || hasBubbleChange) {
        roundDigits = baselineDriverData[year]?.round_digits
      } else if (
        category === "company_level" &&
        currentSelection.product &&
        currentSelection.company
      ) {
        roundDigits =
          baselineDriverData[currentSelection.product]?.[
            currentSelection.company
          ]?.[year]?.round_digits
      } else if (category === "product_level" && currentSelection.product) {
        roundDigits =
          baselineDriverData[currentSelection.product]?.[year]?.round_digits
      }
      const avgValue =
        storedData[year].values.reduce(
          (sum: number, val: number) => sum + Number(val),
          0
        ) / storedData[year].values.length
      return avgValue.toFixed(roundDigits || 1)
    })

    setCurrentAverages(storedAverages)
  }, [monthlyData, currentSelection])

  const getTableData = (
    data: MonthlyMarketData,
    yearKey: string,
    customYears?: string[]
  ) => ({
    years: customYears || years,
    format: data?.[yearKey]?.format || "",
    round_digits: data?.[yearKey]?.round_digits || 1,
  })

  const getBaselineAndScenario = (baseline: any, values: string[]) => ({
    baseline: { ...baseline, values },
    scenario: { ...baseline, values: currentAverages ?? values },
  })

  const driverData = useMemo(() => {
    if (category === "market_level" || hasBubbleChange) {
      const tableData = getTableData(
        baselineDriverData as MonthlyMarketData,
        years[0] as string
      )
      return {
        ...getBaselineAndScenario(tableData, averages),
        tableTitle: driverLabel,
        monthly: bubbleChange
          ? {
              ...(scenarioDriverData as MonthlyMarketData)[
                activeYear as string
              ],
              baseline: (baselineDriverData as MonthlyMarketData)[
                activeYear as string
              ],
              product: bubbleChange?.product_name,
              company: bubbleChange?.company_name,
            }
          : (baselineDriverData as MonthlyMarketData)[activeYear as string],
        category,
      }
    }

    if (category === "product_level" || category === "company_level") {
      const productEntries = Object.entries(baselineDriverData)
      const selectedProduct =
        productEntries.find(
          ([key]) => key === (currentSelection.product || "")
        ) || productEntries[0]
      const productKey = selectedProduct[0]
      const yearlyData = selectedProduct[1] as
        | MonthlyMarketData
        | Record<string, any>

      if (category === "product_level") {
        const tableData = getTableData(
          yearlyData as MonthlyMarketData,
          activeYear as string,
          Object.keys(yearlyData)
        )
        return {
          ...getBaselineAndScenario(
            tableData,
            getYearlyAverages(yearlyData as MonthlyMarketData).averages
          ),
          tableTitle: driverLabel,
          monthly: {
            ...(yearlyData as MonthlyMarketData)[activeYear as string],
            product: productKey,
          },
          category,
        }
      }
      // company_level
      const companyEntries = Object.entries(yearlyData)
      const selectedCompany =
        companyEntries.find(
          ([key]) => key === (currentSelection.company || "")
        ) || companyEntries[0]
      const companyKey = selectedCompany[0]
      const companyData = selectedCompany[1] as MonthlyMarketData
      const companyYears = Object.keys(companyData)
      const companyAverages = getYearlyAverages(companyData).averages

      const tableData = getTableData(
        companyData,
        (activeYear as string) ?? companyYears[0],
        companyYears
      )
      return {
        ...getBaselineAndScenario(tableData, companyAverages),
        tableTitle: driverLabel,
        monthly: {
          ...(companyData as MonthlyMarketData)[
            (activeYear as string) ?? companyYears[0]
          ],
          product: productKey,
          company: companyKey,
        },
        category,
      }
    }

    return null
  }, [
    baselineDriverData,
    scenarioDriverData,
    category,
    currentSelection,
    activeYear,
    averages,
    currentAverages,
  ])

  useEffect(() => {
    if (
      ["product_level", "company_level"].includes(category) &&
      !hasBubbleChange
    ) {
      const productKeys = Object.keys(baselineDriverData)
      setCurrentSelection((prev) => ({ ...prev, product: productKeys[0] }))
      if (category === "company_level") {
        const companyKeys = Object.keys(
          baselineDriverData[productKeys[0]]
        ).sort((a, b) => a.localeCompare(b))
        setCurrentSelection((prev) => ({ ...prev, company: companyKeys[0] }))
      }
    }
  }, [])

  return { driverData }
}
