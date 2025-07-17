import { useCallback } from "react"
import { MonthlyMarketData } from "@/components/OMM/EditableTable/types"
import { useScenarioTableStore } from "@/store/omm"
import { PropagationType } from "@/components/OMM/PropagationManagement/types"
import { findYearlyData } from "@/routes/omm.scenarios.$category.monthly.$driver"

const useMonthlyPropagation = ({
  initialData,
  driver,
  market,
}: {
  initialData: MonthlyMarketData
  product?: string | undefined
  driver: string
  market: string
  company?: string | undefined
}) => {
  const { updateMonthlyDataWithPropagation, monthlyData } =
    useScenarioTableStore()

  const applyPropagation = useCallback(
    (
      startingYear: number,
      startingMonth: string,
      type: PropagationType,
      valueToPropagate: number
    ) => {
      const { round_digits, product, company, months } = initialData
      const yearlyMonthlyData = findYearlyData(monthlyData)
      const yearKeys = Object.keys(yearlyMonthlyData)
      const startIndex = months.findIndex((month) => month === startingMonth)

      const currentCategory =
        !product && !company
          ? "market_level"
          : product && !company
            ? "product_level"
            : "company_level"

      const newValues = yearlyMonthlyData?.[startingYear].values.map(
        (value, index) => {
          if (index < startIndex) return value.toString()

          const previousValue = Number(value)

          if (type === "Absolute") {
            const adjustedValue = previousValue + valueToPropagate
            return adjustedValue.toFixed(round_digits)
          } else if (type === "Percentual") {
            const percentage = valueToPropagate / 100
            const adjustedValue = previousValue * (1 + percentage)
            return adjustedValue.toFixed(round_digits)
          }
          return value.toString()
        }
      )

      updateMonthlyDataWithPropagation({
        marketId: Number(market),
        driver,
        year: Number(startingYear),
        productKey: product,
        companyKey: company,
        category: currentCategory,
        values: newValues,
      })

      const propagateRemainingYears = yearKeys.filter(
        (year) => Number(year) > Number(startingYear)
      )

      propagateRemainingYears.map((year) => {
        const yearData = yearlyMonthlyData?.[year]
        const roundDigits = round_digits || 1
        const values = yearData?.values.map((value) => {
          const previousValue = Number(value)
          if (type === "Absolute") {
            const adjustedValue = previousValue + valueToPropagate
            return adjustedValue.toFixed(roundDigits)
          } else if (type === "Percentual") {
            const percentage = valueToPropagate / 100
            const adjustedValue = previousValue * (1 + percentage)
            return adjustedValue.toFixed(roundDigits)
          }
        })
        updateMonthlyDataWithPropagation({
          marketId: Number(market),
          driver,
          year: year,
          productKey: product,
          companyKey: company,
          category: currentCategory,
          values: values,
        })
      })
    },
    [updateMonthlyDataWithPropagation, driver, market, monthlyData]
  )
  return {
    applyPropagation,
  }
}

export default useMonthlyPropagation
