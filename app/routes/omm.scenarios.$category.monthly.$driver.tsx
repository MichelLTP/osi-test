import { requiredUserSession } from "@/data/auth/session.server"
import { getMenuVariables } from "@/data/menuvariables/menuvariables.server"
import type { LoaderFunctionArgs } from "@remix-run/node"
import { ShouldRevalidateFunction, useLoaderData } from "@remix-run/react"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import {
  getBrandAndCompanies,
  getBubblesTable,
  getMeasureDisplayName,
  getTableBaseline,
} from "@/data/omm/omm.server"
import {
  BubbleTableData,
  Category,
  ProductLevel,
  ProductCompanySelection,
} from "@/components/OMM/types"
import {
  BaseMonthlyMarketData,
  FullMarketData,
  MonthlyMarketData,
} from "@/components/OMM/EditableTable/types"
import { useScenarioTableStore } from "@/store/omm"
import { UseMonthlyDriverData } from "@/hooks/useMonthlyDriverData"
import YearMonthToggle from "@/components/OMM/YearMonthToggle/YearMonthToggle"
import MonthlyMeasureTableHandler from "@/components/OMM/EditableTable/Handlers/MonthlyMeasureTableHandler"
import MonthlyPropagationManagement from "@/components/OMM/PropagationManagement/MonthlyPropagationManagement"
import { Label } from "@/components/ui/Label/Label"
import YearlyMeasureTableHandler from "@/components/OMM/EditableTable/Handlers/YearlyMeasureTableHandler"
import { AnimatePresence, motion } from "framer-motion"
import SingleSelection from "@/components/Shared/SingleSelection/SingleSelection"
import useMonthlyPropagation from "@/hooks/useMonthlyPropagation"

export default function OmmMarketDriversDynamic() {
  const {
    baselineDriverData,
    scenarioDriverData,
    initialYears,
    bubbleChange,
    initialBaselineAverage,
    driverLabel,
    brandsCompanies,
    driverId,
    marketId,
    category,
  } = useLoaderData<typeof loader>()
  const [companyBrandType, setCompanyBrandType] = useState<"company" | "brand">(
    bubbleChange?.scenarioChange
      ? bubbleChange?.isBrand
        ? "brand"
        : "company"
      : "company"
  )
  const [currentSelection, setCurrentSelection] =
    useState<ProductCompanySelection>({
      product: bubbleChange?.product_name ?? "",
      company: bubbleChange?.company_name ?? "",
    })

  const filteredData = useMemo<Record<string, string[]>>(() => {
    if (
      category === "company_level" &&
      !bubbleChange.scenarioChange &&
      brandsCompanies
    ) {
      const filter: Record<string, string[]> = {}
      Object.keys(baselineDriverData).forEach((product) => {
        const allKeys = Object.keys(baselineDriverData[product] || {})
        const filtered = allKeys.filter((item) =>
          companyBrandType === "company"
            ? brandsCompanies.companies?.includes(item)
            : brandsCompanies.brands?.includes(item)
        )
        if (filtered.length > 0) {
          filter[product] = filtered
        }
      })
      return filter
    }
    return {}
  }, [
    baselineDriverData,
    brandsCompanies,
    bubbleChange.scenarioChange,
    companyBrandType,
    category,
  ])

  useEffect(() => {
    if (
      category === "company_level" &&
      !bubbleChange.scenarioChange &&
      currentSelection.product &&
      filteredData[currentSelection.product]
    ) {
      const defaultCompany = filteredData[currentSelection.product]?.sort(
        (a, b) => a.localeCompare(b)
      )[0]
      if (defaultCompany && currentSelection.company !== defaultCompany) {
        setCurrentSelection((prevState) => ({
          ...prevState,
          company: defaultCompany,
        }))
      }
    }
  }, [
    filteredData,
    currentSelection.product,
    category,
    bubbleChange.scenarioChange,
  ])
  const [view, setView] = useState<{
    period: "yearly" | "monthly"
    activeYear: string | number
  }>({
    period: "yearly",
    activeYear: initialYears?.[0] || "",
  })
  const {
    saveMonthlyData,
    isMonthlyDataDiscard,
    discardMonthlyData,
    monthlyData,
    emptyMonthlyData,
  } = useScenarioTableStore()
  const [availableYears, setAvailableYears] = useState<string[]>(initialYears)

  if (!baselineDriverData)
    throw new Error("An error has occurred while fetching the data.")
  const { driverData } = UseMonthlyDriverData({
    category: category as Category,
    baselineDriverData,
    scenarioDriverData,
    driverId,
    activeYear: view.activeYear,
    years: initialYears,
    bubbleChange: bubbleChange,
    averages: initialBaselineAverage,
    driverLabel,
    marketId,
    currentSelection,
    setCurrentSelection,
  })

  if (!driverData)
    throw new Error("An error has occurred while fetching the data.")

  const { applyPropagation } = useMonthlyPropagation({
    initialData: driverData?.monthly,
    driver: driverId,
    market: marketId,
  })

  const handleProductChange = useCallback(
    (product: string) => {
      let defaultCompany = ""
      if (category === "company_level" && filteredData[product]?.length) {
        defaultCompany = filteredData[product][0]
      } else if (baselineDriverData[product]) {
        defaultCompany =
          Object.keys(baselineDriverData[product]).sort((a, b) =>
            a.localeCompare(b)
          )[0] ?? ""
      }

      let newYears: string[] = []
      if (
        category === "company_level" &&
        baselineDriverData[product]?.[defaultCompany]
      ) {
        newYears = Object.keys(
          baselineDriverData[product][defaultCompany]
        ).sort()
      } else if (baselineDriverData[product]) {
        newYears = Object.keys(baselineDriverData[product]).sort()
      }

      setCurrentSelection((prev) => ({
        ...prev,
        product,
        company: category === "company_level" ? defaultCompany : "",
      }))

      setView((prev) => {
        if (newYears.length && !newYears.includes(String(prev.activeYear))) {
          return { ...prev, activeYear: newYears[0] }
        }
        return prev
      })
      setAvailableYears(newYears.length ? newYears : [])
    },
    [baselineDriverData]
  )

  const handleCompanyChange = (company: string) => {
    setCurrentSelection((prev) => {
      const newCompany = filteredData[currentSelection.product]?.[0] || ""
      let newYears: string[] = []
      if (
        category === "company_level" &&
        baselineDriverData[currentSelection.product]?.[company]
      ) {
        newYears = Object.keys(
          baselineDriverData[currentSelection.product][company]
        ).sort()
      }
      setView((prevView) => {
        if (
          newYears.length &&
          !newYears.includes(String(prevView.activeYear))
        ) {
          return { ...prevView, activeYear: newYears[0] }
        }
        return prevView
      })
      setAvailableYears(newYears.length ? newYears : [])
      return {
        ...prev,
        company: company,
      }
    })
  }

  useEffect(() => {
    if (driverData?.monthly || isMonthlyDataDiscard) {
      if (Object.keys(monthlyData).length > 0) {
        emptyMonthlyData()
      }
      driverData.baseline?.years.map((year: number) => {
        const { product, company } = driverData.monthly
        const isMarketLevel = category === "market_level"
        let baseData: FullMarketData<BaseMonthlyMarketData>
        if (!!bubbleChange.scenarioChange && scenarioDriverData) {
          baseData = scenarioDriverData[
            year
          ] as FullMarketData<BaseMonthlyMarketData>
        } else if (isMarketLevel) {
          baseData = baselineDriverData[
            year
          ] as FullMarketData<BaseMonthlyMarketData>
        } else if (category === "company_level") {
          baseData = baselineDriverData[product]?.[company]?.[year]
        } else {
          baseData = baselineDriverData[product]?.[year]
        }
        if (!baseData) return
        saveMonthlyData({
          market_id: Number(marketId),
          driver: driverId,
          year: year.toString(),
          productKey: product ?? "",
          companyKey: company ?? "",
          months: baseData.months as string[],
          values: baseData.values as number[],
          category: category as Category,
        })
      })
      if (isMonthlyDataDiscard) {
        discardMonthlyData()
      }
    }
  }, [baselineDriverData, currentSelection, isMonthlyDataDiscard])

  const productKeys: string[] = bubbleChange?.product_name
    ? [bubbleChange.product_name]
    : category === "product_level" || category === "company_level"
      ? Object.keys(baselineDriverData)
      : []

  const productOptions = useMemo<{ value: string; label: string }[]>(
    () =>
      productKeys.map((product) => ({
        value: product,
        label: product,
      })),
    [productKeys]
  )

  const companyOptions = (
    product: string
  ): { value: string; label: string }[] => {
    if (bubbleChange.scenarioChange && bubbleChange?.company_name) {
      return [
        {
          value: bubbleChange.company_name,
          label: bubbleChange.company_name,
        },
      ]
    }
    if (filteredData[product]) {
      return filteredData[product]
        .map((company) => ({ value: company, label: company }))
        .sort((a, b) => {
          return a.label.localeCompare(b.label)
        })
    }

    const firstProduct = Object.keys(baselineDriverData).sort((a, b) =>
      a.localeCompare(b)
    )[0]
    if (firstProduct) {
      return Object.keys(
        baselineDriverData[firstProduct] as ProductLevel<MonthlyMarketData>
      )
        .map((company) => ({ value: company, label: company }))
        .sort((a, b) => {
          return a.label.localeCompare(b.label)
        })
    }
    return []
  }

  const handleViewChange = useCallback(
    (type: "period" | "activeYear", value: string) => {
      setView((prev) => {
        if (type === "activeYear" && value) {
          return { ...prev, activeYear: value }
        }
        return { ...prev, [type]: value }
      })
    },
    []
  )

  useEffect(() => {
    if (
      driverData?.baseline?.years &&
      Array.isArray(driverData.baseline.years) &&
      !bubbleChange.scenarioChange
    ) {
      setAvailableYears((prev) => {
        const prevStr = (prev || []).join(",")
        const newStr = driverData.baseline.years.join(",")
        if (prevStr !== newStr) {
          return driverData.baseline.years
        }
        return prev
      })
    }
  }, [driverData?.baseline?.years, bubbleChange.scenarioChange])

  const yearMonthSelection = (
    <YearMonthToggle
      showLabel
      period={view.period}
      availableYears={availableYears || []}
      currentYear={view.activeYear || availableYears[0] || ""}
      onOptionChange={handleViewChange}
    />
  )

  return (
    <>
      {category === "market_level" && (
        <section className="w-full flex ml-auto justify-end align-end mb-6">
          {yearMonthSelection}
        </section>
      )}
      {["product_level", "company_level"].includes(category) && (
        <fieldset className={`grid sm:grid-cols-3 gap-4 mb-6`}>
          <div>
            <Label>
              {!bubbleChange.product_name ? "Select a product:" : "Product:"}
            </Label>
            <SingleSelection
              placeholder={productKeys[0] ?? ""}
              handleValueChange={handleProductChange}
              key={`product-${currentSelection?.product || ""}`}
              defaultValue={currentSelection?.product || productKeys[0] || ""}
              triggerClasses={"mt-3"}
              options={productOptions}
              disabled={!!bubbleChange.product_name}
            />
          </div>
          {category === "product_level" && (
            <section className="col-span-2 ml-auto mt-4">
              {yearMonthSelection}
            </section>
          )}
          {category === "company_level" && (
            <>
              <div>
                <Label>
                  {!bubbleChange.product_name ? "Select a Type:" : "Type:"}
                </Label>
                <SingleSelection
                  placeholder={companyBrandType}
                  handleValueChange={(type) => {
                    setCompanyBrandType(type as "company" | "brand")
                  }}
                  key={`company-brand-${companyBrandType}`}
                  defaultValue={companyBrandType}
                  triggerClasses={"mt-3"}
                  options={[
                    { value: "brand", label: "Brands" },
                    { value: "company", label: "Companies" },
                  ]}
                  disabled={!!bubbleChange.company_name}
                />
              </div>
              <div>
                <Label>
                  {!bubbleChange.company_name
                    ? `Select a ${companyBrandType === "company" ? "Company" : "Brand"}:`
                    : companyBrandType === "company"
                      ? "Company:"
                      : "Brand:"}
                </Label>
                <SingleSelection
                  placeholder={currentSelection?.company || ""}
                  handleValueChange={(company) =>
                    handleCompanyChange(company as string)
                  }
                  key={`company-${currentSelection?.company || ""}`}
                  defaultValue={
                    currentSelection?.company ||
                    filteredData[currentSelection?.product || ""]?.[0] ||
                    ""
                  }
                  triggerClasses={"mt-3"}
                  options={companyOptions(currentSelection.product)}
                  disabled={!!bubbleChange.company_name}
                />
              </div>
            </>
          )}
        </fieldset>
      )}
      {category === "company_level" && (
        <section className="ml-8 my-8">{yearMonthSelection}</section>
      )}
      <section
        className={
          view.period === "monthly" ? "opacity-50 pointer-events-none" : ""
        }
      >
        <YearlyMeasureTableHandler
          driverId={driverId}
          tableData={driverData}
          tableTitle={driverData.tableTitle}
          marketId={Number(marketId)}
        />
      </section>

      <AnimatePresence mode={"wait"}>
        {view.period === "monthly" && (
          <motion.section
            className="px-4 my-10 rounded-sm bg-third dark:bg-secondary-dark"
            key={`months-${view.activeYear}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            <MonthlyMeasureTableHandler
              category={category as Category}
              driverId={driverId}
              tableData={driverData.monthly}
              key={`months-${view.activeYear}`}
              tableTitle={view.activeYear.toString()}
              marketId={Number(marketId)}
            />
          </motion.section>
        )}
      </AnimatePresence>

      {driverData?.baseline?.years?.length && (
        <MonthlyPropagationManagement
          applyPropagation={applyPropagation}
          years={availableYears}
        />
      )}
    </>
  )
}

export const shouldRevalidate: ShouldRevalidateFunction = ({
  currentParams,
  defaultShouldRevalidate,
  nextParams,
}) => {
  if (currentParams === nextParams) return false
  return defaultShouldRevalidate
}

export const getYearlyAverages = (
  yearData: MonthlyMarketData
): {
  years: string[]
  averages: string[]
} => {
  const years: string[] = []
  const averages: string[] = []

  if (!yearData) return { years, averages }

  Object.entries(yearData).forEach(([year, data]) => {
    const average =
      data.values?.length > 0
        ? data.values.reduce((sum, val) => sum + val, 0) / data.values.length
        : 0
    years.push(year)
    averages.push(average.toFixed(data?.round_digits || 1))
  })
  return { years, averages }
}

export function findYearlyData(
  data: Record<string, any>
): MonthlyMarketData | undefined {
  if (!data || typeof data !== "object") return undefined

  if (
    Object.keys(data).length > 0 &&
    Object.values(data).some(
      (val) => val && typeof val === "object" && "months" in val
    )
  ) {
    return data as MonthlyMarketData
  }
  for (const key in data) {
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      const result = findYearlyData(data[key])
      if (result) {
        return result
      }
    }
  }

  return undefined
}

export async function loader({ params, request }: LoaderFunctionArgs) {
  await requiredUserSession(request)
  const envVar = await getMenuVariables()

  const { driver, category } = params
  const urlParams = new URL(request.url).searchParams
  const marketId = urlParams.get("market-id")
  let driverLabel

  if (!driver) throw new Response("Missing Market Driver!", { status: 400 })
  if (!category) throw new Response("Missing Market Category!", { status: 400 })
  if (!marketId) throw new Response("Missing Market ID", { status: 400 })

  let brandsCompanies = {
    brands: [],
    companies: [],
  }
  if (category === "company_level") {
    brandsCompanies = await getBrandAndCompanies()
  }

  if (driver === "change") {
    const scenarioChange = urlParams.get("scenario-change-id")
    const bubbleData = await getBubblesTable<BubbleTableData>(
      scenarioChange ?? "580"
    )
    const baselineDriverData = bubbleData?.Baseline
    const scenarioDriverData = bubbleData?.Scenario

    const yearlyBaselineDriverData = findYearlyData(baselineDriverData)
    const yearlyScenarioDriverData = findYearlyData(scenarioDriverData)
    const { years, averages: baselineAverages } = yearlyBaselineDriverData
      ? getYearlyAverages(yearlyBaselineDriverData)
      : { years: [], averages: [] }
    return {
      envVar,
      scenarioDriverData: yearlyScenarioDriverData,
      baselineDriverData: yearlyBaselineDriverData,
      driverLabel: bubbleData.display_name,
      driverId: bubbleData.measure_name,
      initialYears: years,
      brandsCompanies: brandsCompanies,
      initialBaselineAverage: baselineAverages,
      marketId,
      bubbleChange: {
        product_id: bubbleData?.product_id,
        product_name: bubbleData?.product_name,
        company_id: bubbleData?.company_id,
        company_name: bubbleData?.company_name,
        isBrand: brandsCompanies.brands?.includes(bubbleData?.company_name),
        scenarioChange: true,
      },
      category,
    }
  } else if (marketId) {
    driverLabel = await getMeasureDisplayName(driver, marketId)

    let baselineDriverData = await getTableBaseline(marketId, driver, category)

    const yearlyData = findYearlyData(baselineDriverData)
    const { years, averages } = yearlyData
      ? getYearlyAverages(yearlyData)
      : { years: [], averages: [] }

    return {
      envVar,
      scenarioDriverData:
        category === "market_level"
          ? baselineDriverData[driverLabel]
          : baselineDriverData,
      baselineDriverData:
        category === "market_level"
          ? baselineDriverData[driverLabel]
          : baselineDriverData,
      initialYears: years,
      initialBaselineAverage: averages,
      driverLabel,
      brandsCompanies,
      driverId: driver,
      marketId,
      bubbleChange: {
        product_id: null,
        product_name: null,
        company_id: null,
        company_name: null,
        isBrand: null,
        scenarioChange: false,
      },
      category,
    }
  } else {
    throw new Response("Missing necessary params!", { status: 400 })
  }
}
