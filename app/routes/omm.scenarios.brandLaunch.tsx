import { requiredUserSession } from "@/data/auth/session.server"
import { getMenuVariables } from "@/data/menuvariables/menuvariables.server"
import { LoaderFunctionArgs } from "@remix-run/node"
import { ErrorBoundaryComponent } from "@/components/ui/ErrorBoundaryComponent/ErrorBoundaryComponent"
import React, { useCallback, useEffect, useState } from "react"
import { faCommentDots } from "@fortawesome/free-regular-svg-icons"
import Modal from "@/components/Shared/Modal/Modal"
import BarChart from "@/components/ui/BarChart/BarChart"
import { ChartConfig } from "@/components/ui/Chart/Chart"
import {
  fetchBrandLaunchData,
  fetchBrandLaunchCompanies,
  fetchBrandLaunchProducts,
  saveBrandLaunchData,
  getBubblesTable,
  fetchMarket,
} from "@/data/omm/omm.server"
import {
  useFetcher,
  useLoaderData,
  useNavigate,
  useNavigation,
} from "@remix-run/react"
import {
  BrandLaunchBubbleData,
  BrandLaunchData,
  BrandLaunchGraph,
  BrandLaunchOptions,
  SimpleBrandLaunchTable,
} from "@/components/OMM/types"
import { AnimatePresence, motion } from "framer-motion"
import { format, getMonth, getYear, Month, parse } from "date-fns"
import { Button } from "@/components/ui/Button/Button"
import ChartSkeleton from "@/components/Shared/ChartSkeleton/ChartSkeleton"
import {
  FullMarketData,
  SimpleMarketData,
} from "@/components/OMM/EditableTable/types"
import BrandLaunchTableHandler from "@/components/OMM/EditableTable/Handlers/BrandLaunchTableHandler"
import TableSkeleton from "@/components/Shared/TableSkeleton/TableSkeleton"
import { useScenarioTableStore } from "@/store/omm"
import BrandLaunchForm from "@/components/OMM/BrandLaunchForm/BrandLaunchForm"
import { faCheck, faTrashCan } from "@fortawesome/free-solid-svg-icons"
import useGraphData, {
  generateYearRange,
  YEAR_LIMIT,
} from "@/hooks/useGraphData"
import { enUS } from "date-fns/locale"
import { clsx } from "clsx"
import { CountryFlag } from "@/components/OMM/CountryFlag/CountryFlag"
import ConfirmationPopover from "@/components/Shared/ConfirmationPopover/ConfirmationPopover"

export default function OmmScenariosBrandLaunch() {
  const {
    productData,
    baselineId,
    initialGraph,
    initialCompanies,
    initialTable,
    isChange,
    initialDates,
    marketName,
    marketCode,
  } = useLoaderData<typeof loader>()
  const { handleScenarioId } = useScenarioTableStore()
  const [currentDate, setCurrentDate] = useState<{
    year: string
    month: string
  }>({
    year: initialDates.year,
    month: initialDates.month,
  })
  const { graphData, updateGraph } = useGraphData(initialGraph)
  const [tableData, setTableData] = useState(initialTable)
  const [originalMirrorMarketChart, setOriginalMirrorMarketChart] =
    useState(initialGraph)
  const [syncChart, setSyncChart] = useState<BrandLaunchGraph[]>()
  const [loadingCompanies, setLoadingCompanies] = useState(false)
  const [loadingData, setLoadingData] = useState(false)
  const fetcher = useFetcher<typeof action>()
  const [currentOptions, setCurrentOptions] = useState<BrandLaunchOptions>({
    product: String(productData[0].product_id),
    product_name: productData[0].product_name,
    company: String(initialCompanies[0].company_hier_id),
    company_name: initialCompanies[0].company_hier_desc,
    mirror_market: String(productData[0].mirror_markets[0].mirror_market_id),
  })
  const [companyOptions, setCompanyOptions] = useState(
    initialCompanies.map((company) => ({
      value: String(company.company_hier_id),
      label: company.company_hier_desc,
    }))
  )
  const [saveData, setSaveData] = useState<{
    data: BrandLaunchGraph[] | undefined
  }>()
  const navigate = useNavigate()
  const navigation = useNavigation()
  const [resetTable, setResetTable] = useState(false)

  const handleProductData = useCallback(
    (selectedValue: string) => {
      const initialMirrorMarket = String(
        productData.find(
          (product) => String(product.product_id) === selectedValue
        )?.mirror_markets[0].mirror_market_id
      )
      setCurrentOptions({
        ...currentOptions,
        product: selectedValue,
        product_name:
          productData.find(
            (product) => String(product.product_id) === selectedValue
          )?.product_name ?? "",
        mirror_market: initialMirrorMarket,
      })

      setLoadingCompanies(true)
      setLoadingData(true)
      fetcher.submit(
        {
          intent: "fetch-company",
          product: selectedValue,
          mirrorMarket: initialMirrorMarket,
          baseline: baselineId,
        },
        { method: "post" }
      )
    },
    [baselineId, productData]
  )

  const revertToInitialChangeData = () => {
    updateGraph(currentDate.year, initialGraph)
    setResetTable(!resetTable)
    setTableData(initialTable)
    setSaveData(undefined)
    setSyncChart(undefined)
    setLoadingData(true)
    setTimeout(() => {
      setLoadingData(false)
    }, 500)
  }

  const handleMirrorMarkets = (selectedValue: string) => {
    setCurrentOptions({ ...currentOptions, mirror_market: selectedValue })
    setLoadingData(true)
    fetcher.submit(
      {
        intent: "fetch-data",
        mirrorMarket: Number(selectedValue),
        product: Number(currentOptions.product),
        baseline: baselineId,
      },
      { method: "post" }
    )
  }

  useEffect(() => {
    if (fetcher.state === "idle" && fetcher.data?.companies) {
      setCompanyOptions(
        fetcher.data.companies.map((company) => ({
          value: String(company.company_hier_id),
          label: company.company_hier_desc,
        }))
      )
      setCurrentOptions({
        ...currentOptions,
        company: String(fetcher.data.companies[0].company_hier_id),
        company_name: fetcher.data.companies[0].company_hier_desc,
      })
      setLoadingCompanies(false)
    }
    if (
      fetcher.state === "idle" &&
      fetcher.data?.graph &&
      fetcher.data?.table
    ) {
      updateGraph(currentDate.year, fetcher.data.graph)
      setOriginalMirrorMarketChart(fetcher.data.graph)
      setTableData(fetcher.data.table)
      setLoadingData(false)
    }
    if (fetcher.state === "idle" && fetcher.data?.scenarioId) {
      handleScenarioId(fetcher.data.scenarioId.toString())
      navigate(`/omm/scenarios?scenario-id=${fetcher.data.scenarioId}`)
    }
  }, [fetcher.state, fetcher.data])

  useEffect(() => {
    if (!syncChart) return
    setSaveData({ data: syncChart })
    const filteredPrice = syncChart.map(({ years, market_share }) => ({
      years: years,
      market_share,
    }))

    updateGraph(currentDate.year, filteredPrice)
    setSyncChart(undefined)
  }, [syncChart])

  const areMarketSharesEqual = (
    sourceGraph: BrandLaunchGraph[],
    targetGraph: BrandLaunchGraph[]
  ) => {
    if (!sourceGraph?.length || !targetGraph?.length) return false
    const yearsToCompare = generateYearRange(
      Number(currentDate.year),
      YEAR_LIMIT
    ).length
    const source = sourceGraph.slice(0, yearsToCompare)
    const target = targetGraph.slice(0, yearsToCompare)
    return source.every(
      (item, index) => item.market_share === target[index]?.market_share
    )
  }

  const isEdited = (
    sourceTable: Record<string, SimpleMarketData>,
    targetTable: {
      data: BrandLaunchGraph[] | undefined
    }
  ) => {
    if (!targetTable.data) return false
    const marketShareKey = Object.keys(sourceTable).find((key) =>
      key.includes("Market Share")
    )
    const priceKey = Object.keys(sourceTable).find((key) =>
      key.includes("Price")
    )
    const comparisonData = {
      market_share: {
        years: generateYearRange(Number(currentDate.year), YEAR_LIMIT),
        values: marketShareKey ? initialTable[marketShareKey].values : [],
      },
      price: {
        years: generateYearRange(Number(currentDate.year), YEAR_LIMIT),
        values: priceKey ? initialTable[priceKey].values : [],
      },
    }

    return targetTable.data.some(
      (item, index) =>
        item.market_share.toString() !==
          comparisonData.market_share.values[index].toString() ||
        item.price.toString() !== comparisonData.price.values[index].toString()
    )
  }

  const handleSave = () => {
    if (!saveData) return

    const processedData: {
      data: SimpleBrandLaunchTable<BrandLaunchGraph[]>
    } = {
      data: {
        market_share: {
          years: saveData.data?.map((item) => item.years),
          values: saveData.data?.map((item) => String(item.market_share)),
        },
        price: {
          years: saveData.data?.map((item) => item.years),
          values: saveData.data?.map((item) => String(item.price)),
        },
      },
    }

    fetcher.submit(
      {
        intent: "save",
        data: JSON.stringify(processedData),
        product: currentOptions.product,
        product_name: currentOptions.product_name,
        company: currentOptions.company,
        company_name: currentOptions.company_name,
        year: currentDate.year,
        month: format(parse(currentDate.month, "MMM", new Date()), "MMMM"),
        baselineId: baselineId,
        mirrorMarketId: currentOptions.mirror_market,
      },
      { method: "post" }
    )

    setSaveData({ data: undefined })
  }

  const handleDateChange = (date: { year: string; month: string }) => {
    setCurrentDate(date)
    if (date.year !== currentDate.year) {
      updateGraph(date.year, initialGraph)
    }
  }

  useEffect(() => {
    if (currentDate.year) updateGraph(currentDate.year)
  }, [])

  const isDisabled =
    !saveData?.data ||
    navigation.state === "loading" ||
    fetcher.state === "submitting" ||
    loadingCompanies ||
    loadingData

  const chartConfig = {
    years: { label: "Years" },
    market_share: {
      label: Object.keys(tableData).find((key) => key.includes("Market Share")),
    },
    value: {
      label: Object.keys(tableData).find((key) => key.includes("Market Share")),
    },
  } satisfies ChartConfig

  return (
    <Modal title={"Brand Launch"} icon={faCommentDots} size={"big"}>
      {marketName && (
        <h6 className={"-mt-6 mb-6 opacity-50 flex gap-2 items-center"}>
          <CountryFlag
            rounded
            countryCode={marketCode}
            className={"!bg-cover"}
          />
          {marketName}
        </h6>
      )}
      <main
        className={
          "max-h-[70vh] overflow-y-auto custom-scrollbar dark-scrollbar -mr-2 pr-2 w-full flex flex-col gap-9 mt-2"
        }
      >
        <BrandLaunchForm
          companyOptions={companyOptions}
          productData={productData}
          currentOptions={currentOptions}
          disabled={loadingData || loadingCompanies || isChange}
          currentDate={currentDate}
          onUpdate={{
            onProductChange: handleProductData,
            onCompanyChange: (value) => {
              setCurrentOptions({
                ...currentOptions,
                company: value,
                company_name:
                  companyOptions.find((option) => option.value === value)
                    ?.label ?? null,
              })
            },
            onMirrorMarketChange: handleMirrorMarkets,
            onDateChange: handleDateChange,
          }}
          loading={{ loadingCompanies }}
        />
        <div className={"flex w-full justify-end -mb-2"}>
          <ConfirmationPopover
            onConfirm={() => handleMirrorMarkets(currentOptions.mirror_market)}
            confirmationHeader={"Reset the table data?"}
            confirmationMessage={"All changes will be lost."}
            buttonAction={"Reset"}
          >
            <Button
              variant="underline"
              disabled={
                loadingData ||
                loadingCompanies ||
                areMarketSharesEqual(
                  graphData.original as BrandLaunchGraph[],
                  originalMirrorMarketChart
                )
              }
            >
              Reset to mirror market values
            </Button>
          </ConfirmationPopover>
        </div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          key={`chart-${currentOptions.product}-${currentOptions.mirror_market}`}
          className={"-mb-9"}
        >
          <AnimatePresence>
            {loadingData ? (
              <ChartSkeleton variant={"chart-only"} />
            ) : (
              <BarChart
                chartData={graphData.current}
                chartConfig={chartConfig}
                xAxisKey={"years"}
                isBrandLaunch
              />
            )}
          </AnimatePresence>
        </motion.div>

        {loadingData ? (
          <TableSkeleton rows={3} />
        ) : (
          <BrandLaunchTableHandler
            tableData={tableData}
            startingYear={currentDate.year}
            tableTitle={
              companyOptions.find(
                (company) => currentOptions?.company === company.value
              )?.label ?? companyOptions[0].label
            }
            syncChart={setSyncChart}
            key={resetTable + JSON.stringify(tableData)}
          />
        )}
        <footer className="flex flex-wrap gap-4 -mt-4 mb-4 justify-end">
          <ConfirmationPopover
            onConfirm={() => revertToInitialChangeData()}
            confirmationHeader={"Do you want to discard your changes?"}
            confirmationMessage={"All changes will be lost."}
          >
            <Button
              variant={"outline"}
              type={"button"}
              className={clsx(
                "!hidden !text-error !border-error hover:!border-secondary hover:!text-secondary hover:dark:!border-white hover:dark:!text-white",
                isChange && "!inline"
              )}
              icon={faTrashCan}
              disabled={isDisabled || !isEdited(initialTable, saveData)}
            >
              Discard
            </Button>
          </ConfirmationPopover>
          <Button
            type={"button"}
            disabled={isDisabled}
            icon={faCheck}
            isLoading={fetcher.state === "submitting"}
            onClick={() => handleSave()}
            name="intent"
            value="save"
          >
            Confirm
          </Button>
        </footer>
      </main>
    </Modal>
  )
}

const transformTableData = (data: BrandLaunchData) => {
  const transformed: Record<string, SimpleMarketData> = {}

  Object.entries(data.Table).forEach(([category, subCategories]) => {
    Object.entries(subCategories).forEach(([subCategory, entries]) => {
      Object.entries(entries).forEach(([key, { years, values, format }]) => {
        const newKey = `${subCategory} (${format ?? ""})`
        transformed[newKey] = { years, values }
      })
    })
  })

  return transformed
}

export async function loader({ request }: LoaderFunctionArgs) {
  const token = await requiredUserSession(request)
  const envVar = await getMenuVariables()

  const url = new URL(request.url)
  const marketId = url.searchParams.get("market-id")
  if (!marketId) throw new Error("Market ID is required")
  const scenarioChange = url.searchParams.get("scenario-change-id")
  const { market, code } = await fetchMarket("", marketId)

  if (scenarioChange) {
    const scenarioChangeData = await getBubblesTable<BrandLaunchBubbleData>(
      scenarioChange,
      "Brand Launch"
    )
    const {
      baseline_id,
      product_id,
      mirror_market_id,
      mirror_market_name,
      product_name,
      company_id,
      company_name,
      year,
      month,
      Table,
      Graphic,
    } = scenarioChangeData
    const productData = [
      {
        product_id,
        product_name,
        mirror_markets: [
          { mirror_market_id, mirror_market_name: mirror_market_name },
        ],
      },
    ]
    const initialCompanies = [
      { company_hier_id: company_id, company_hier_desc: company_name },
    ]
    const modifiedTable: Record<string, FullMarketData> = {
      [`Market Share (${(Table?.market_share as FullMarketData)?.format ?? ""})`]:
        Table?.market_share as FullMarketData,
      [`Price (${(Table?.price as FullMarketData)?.format ?? ""})`]:
        Table?.price as FullMarketData,
    }
    return {
      envVar,
      productData,
      initialCompanies,
      initialGraph: Graphic,
      initialTable: modifiedTable,
      baselineId: baseline_id,
      isChange: true,
      marketName: market,
      marketCode: code,
      initialDates: {
        year: String(year),
        month: enUS.localize.month((Number(month) - 1) as Month, {
          width: "abbreviated",
        }),
      },
    }
  }

  const productData = await fetchBrandLaunchProducts(marketId)
  const baselineId = productData.baseline_id
  const initialCompanies = await fetchBrandLaunchCompanies(
    String(productData.products[0].product_id),
    String(baselineId)
  )
  const initialData = await fetchBrandLaunchData(
    String(baselineId),
    String(productData.products[0].product_id),
    String(productData.products[0].mirror_markets[0].mirror_market_id)
  )
  const initialGraph = initialData?.Graphic
  const initialTable = transformTableData(initialData)
  return {
    envVar,
    productData: productData.products,
    initialCompanies,
    initialGraph,
    initialTable,
    marketName: market,
    marketCode: code,
    baselineId,
    isChange: false,
    initialDates: {
      year: String(getYear(new Date())),
      month: String(
        enUS.localize.month(Number(getMonth(new Date())) as Month, {
          width: "abbreviated",
        })
      ),
    },
  }
}

export async function action({ request }: LoaderFunctionArgs) {
  const formData = await request.formData()
  const { intent, ...values } = Object.fromEntries(formData)

  switch (intent) {
    case "fetch-company": {
      const { product, baseline, mirrorMarket } = values
      if (!product || !baseline)
        throw new Error("Product and baseline are required")
      const companies = await fetchBrandLaunchCompanies(
        String(product),
        String(baseline)
      )
      const data = await fetchBrandLaunchData(
        String(baseline),
        String(product),
        String(mirrorMarket)
      )
      const graph = data?.Graphic
      const table = transformTableData(data)
      return { graph, companies, table, scenarioId: null }
    }
    case "fetch-data": {
      const { mirrorMarket, product, baseline } = values
      if (!mirrorMarket || !product || !baseline)
        throw new Error("Mirror market, product and baseline are required")
      const data = await fetchBrandLaunchData(
        String(baseline),
        String(product),
        String(mirrorMarket)
      )
      const graph = data?.Graphic
      const table = transformTableData(data)
      return { graph, companies: null, table, scenarioId: null }
    }
    case "save": {
      const {
        data,
        product,
        product_name,
        company,
        company_name,
        year,
        month,
        baselineId,
        mirrorMarketId,
      } = values as Record<string, string>
      const parsedData = JSON.parse(data as string)
      const url = new URL(request.url)
      const scenarioId = url.searchParams.get("scenario-id") ?? "0"
      const marketId = url.searchParams.get("market-id") ?? "13"
      const savedData = await saveBrandLaunchData(
        scenarioId,
        baselineId,
        marketId,
        product_name,
        product,
        company,
        company_name,
        year,
        month,
        mirrorMarketId,
        parsedData
      )
      return {
        scenarioId: savedData?.scenario_id,
        graph: null,
        companies: null,
        table: null,
      }
    }
    default:
      return null
  }
}

export function ErrorBoundary() {
  return (
    <Modal title={"Brand Launch Error"} icon={faCommentDots}>
      <ErrorBoundaryComponent isMainRoute={false} />
    </Modal>
  )
}
