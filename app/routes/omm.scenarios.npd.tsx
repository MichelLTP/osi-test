import { requiredUserSession } from "@/data/auth/session.server"
import { getMenuVariables } from "@/data/menuvariables/menuvariables.server"
import type { LoaderFunctionArgs } from "@remix-run/node"
import { ErrorBoundaryComponent } from "@/components/ui/ErrorBoundaryComponent/ErrorBoundaryComponent"
import React, { useMemo, useState, useEffect, useCallback } from "react"
import { faCommentDots } from "@fortawesome/free-regular-svg-icons"
import Modal from "@/components/Shared/Modal/Modal"
import { Label } from "@/components/ui/Label/Label"
import SingleSelection from "@/components/Shared/SingleSelection/SingleSelection"
import { format, getMonth, getYear, Month, parse } from "date-fns"
import { Button } from "@/components/ui/Button/Button"
import { faCheck, faTrashCan } from "@fortawesome/free-solid-svg-icons"
import { NpdContent } from "@/components/OMM/NpdContent/NpdContent"
import YearMonthSelector from "@/components/OMM/YearMonthSelector/YearMonthSelector"
import {
  fetchMarket,
  fetchNpdCompanies,
  fetchNpdMarketSharePrice,
  fetchNpdProducts,
  fetchNpdVolumes,
  getBubblesTable,
  saveNpdData,
} from "@/data/omm/omm.server"
import {
  useFetcher,
  useLoaderData,
  useNavigate,
  useNavigation,
} from "@remix-run/react"
import useGraphData, {
  generateYearRange,
  YEAR_LIMIT,
} from "@/hooks/useGraphData"
import { SimpleMarketData } from "@/components/OMM/EditableTable/types"
import {
  MarketLevel,
  NpdBubbleData,
  NpdDataProps,
  NpdGraph,
  NpdMarketSharePriceData,
  NpdOptions,
  NpdProductMirrorMarket,
  NpdVolumeData,
} from "@/components/OMM/types"
import SectionSwitcher from "@/components/OMM/SectionSwitcher/SectionSwitcher"
import { NpdTabTypes } from "@/components/OMM/NpdContent/types"
import { NpdVariant, useScenarioTableStore } from "@/store/omm"
import { enUS } from "date-fns/locale"
import { clsx } from "clsx"
import { CountryFlag } from "@/components/OMM/CountryFlag/CountryFlag"
import ConfirmationPopover from "@/components/Shared/ConfirmationPopover/ConfirmationPopover"

export default function OmmScenariosNpd() {
  const {
    baselineId,
    products,
    initialVolumeGraph,
    initialMarketSharesGraph,
    initialVolumeTable,
    initialPriceTable,
    initialMarketSharesTable,
    isChange,
    initialDates,
    companies,
    marketName,
    marketCode,
    volumeProducts,
  } = useLoaderData<typeof loader>()
  const years = Array.from(
    { length: YEAR_LIMIT - getYear(new Date()) },
    (_, i) => (getYear(new Date()) + i).toString()
  )
  const [currentSelection, setCurrentSelection] = useState<NpdOptions>({
    product_name: products[0].product_name,
    product: String(products[0].product_id),
    year: initialDates.year,
    month: initialDates.month,
    volume_mirror_market: products[0].product_mirror_markets[0],
    market_share_mirror_market: products[0].market_share_mirror_markets[0],
  })
  const { graphData: volumeGraphData, updateGraph: updateVolumeGraph } =
    useGraphData(initialVolumeGraph)
  const navigation = useNavigation()
  const {
    graphData: marketSharesGraphData,
    updateGraph: updateMarketSharesGraph,
  } = useGraphData(initialMarketSharesGraph)
  const [syncChart, setSyncChart] = useState<Partial<NpdDataProps>>()
  const fetcher = useFetcher<typeof action>()
  const [loadingVolumeData, setLoadingVolumeData] = useState(false)
  const [loadingMarketData, setLoadingMarketData] = useState(false)
  const { npdData, setInitialNpdData, updateNpdValue } = useScenarioTableStore()
  const [dataForReset, setDataForReset] = useState({
    volumeTable: initialVolumeTable,
    volumeGraph: initialVolumeGraph,
    marketTable: initialMarketSharesTable,
    marketGraph: initialMarketSharesGraph,
    priceTable: initialPriceTable,
  })

  const transformInitialData = useCallback(
    (year: string, input: MarketLevel<SimpleMarketData>) => {
      if (!input || Object.keys(input).length === 0) return {}

      const targetYears = generateYearRange(Number(year), YEAR_LIMIT)
      const result: MarketLevel<SimpleMarketData> = {}

      for (const [key, { values }] of Object.entries(input)) {
        const cleanKey = key
          .replace(/\s*\(.*?\)\s*/, "")
          .trim() as keyof NpdDataProps
        result[cleanKey] = {
          years: targetYears,
          values: targetYears.map((_, i) => values[i]?.toString() ?? ""),
        }
      }

      return result
    },
    []
  )

  useEffect(() => {
    if (!Object.keys(npdData.volume_shares_data).length) {
      setInitialNpdData({
        price_data: transformInitialData(
          currentSelection.year,
          initialPriceTable
        ),
        market_shares_data: transformInitialData(
          currentSelection.year,
          initialMarketSharesTable
        ),
        volume_shares_data: transformInitialData(
          currentSelection.year,
          initialVolumeTable
        ),
      })
    }
  }, [initialVolumeTable])

  const { handleScenarioId } = useScenarioTableStore()
  const navigate = useNavigate()

  const productOptions = useMemo(
    () =>
      products.map((product) => ({
        value: product.product_name,
        label: product.product_name,
      })),
    [products]
  )

  const availableVolumeMirrorMarkets = useMemo(
    () =>
      products.find(
        (product) => product.product_name === currentSelection.product_name
      )?.product_mirror_markets || [],
    [products, currentSelection.product_name]
  )

  const availableMarketMirrorMarkets = useMemo(
    () =>
      products.find(
        (product) => product.product_name === currentSelection.product_name
      )?.market_share_mirror_markets || [],
    [products, currentSelection.product_name]
  )

  const handleProductChange = useCallback(
    (selectedProduct: string) => {
      const product = products?.find((p) => p.product_name === selectedProduct)
      if (!product) return

      const updates = {
        product_name: selectedProduct,
        product: product.product_id.toString(),
        volume_mirror_market: product.product_mirror_markets[0] ?? "",
        market_share_mirror_market:
          product.market_share_mirror_markets[0] ?? "",
      }

      setCurrentSelection((prev) => ({ ...prev, ...updates }))
      setLoadingVolumeData(true)
      setLoadingMarketData(true)

      fetcher.submit(
        {
          intent: "product-change",
          volumeMirrorMarket: updates.volume_mirror_market,
          marketShareMirrorMarket: updates.market_share_mirror_market,
          product: updates.product,
          baseline: baselineId,
        },
        { method: "post" }
      )
    },
    [products, baselineId]
  )

  const handleMirrorMarketSelection = (
    selectedMarket: string,
    type: NpdTabTypes
  ) => {
    setCurrentSelection({
      ...currentSelection,
      [type === "volume"
        ? "volume_mirror_market"
        : "market_share_mirror_market"]: selectedMarket,
    })
    if (type === "volume") {
      setLoadingVolumeData(true)
    } else {
      setLoadingMarketData(true)
    }
    fetcher.submit(
      {
        intent: `fetch-${type !== "price" ? type : "market-share"}-graph`,
        mirrorMarket: selectedMarket,
        product: currentSelection.product,
        baseline: baselineId,
      },
      { method: "post" }
    )
  }

  const tabs = [
    {
      label: "Global market NPD volume share evolution",
      children: (
        <NpdContent
          key={currentSelection.year}
          variant="volume"
          chartData={volumeGraphData.current}
          tableData={npdData.volume_shares_data}
          currentSelection={currentSelection}
          mirrorMarkets={availableVolumeMirrorMarkets}
          handleMirrorMarket={handleMirrorMarketSelection}
          syncChart={setSyncChart}
          loading={loadingVolumeData}
          isDisabled={isChange}
          addRowList={volumeProducts}
        />
      ),
      id: "volume",
    },
    {
      label: "NPD brand family market share evolution",
      children: (
        <NpdContent
          key={currentSelection.year}
          variant="market-share"
          chartData={marketSharesGraphData.current}
          tableData={npdData.market_shares_data}
          currentSelection={currentSelection}
          mirrorMarkets={availableMarketMirrorMarkets}
          handleMirrorMarket={handleMirrorMarketSelection}
          syncChart={setSyncChart}
          isStacked
          loading={loadingMarketData}
          isDisabled={isChange}
          addRowList={companies}
        />
      ),
      id: "market-share",
    },
    {
      label: "Price",
      children: (
        <NpdContent
          key={currentSelection.year}
          variant="price"
          tableData={npdData.price_data}
          currentSelection={currentSelection}
          mirrorMarkets={[currentSelection.market_share_mirror_market]}
          handleMirrorMarket={handleMirrorMarketSelection}
          syncChart={setSyncChart}
          loading={loadingMarketData}
          isDisabled={isChange}
          addRowList={companies}
        />
      ),
      id: "price",
    },
  ]

  useEffect(() => {
    if (currentSelection.year) {
      updateVolumeGraph(currentSelection.year, dataForReset.volumeGraph)
      updateMarketSharesGraph(currentSelection.year, dataForReset.marketGraph)
      setInitialNpdData({
        price_data: transformInitialData(
          currentSelection.year,
          dataForReset.priceTable
        ),
        market_shares_data: transformInitialData(
          currentSelection.year,
          dataForReset.marketTable
        ),
        volume_shares_data: transformInitialData(
          currentSelection.year,
          dataForReset.volumeTable
        ),
      })
    }
  }, [currentSelection.year])

  useEffect(() => {
    if (fetcher.state !== "idle" || !fetcher.data) return

    const {
      volumeGraph,
      volumeTable,
      marketGraph,
      marketTable,
      priceTable,
      scenarioId,
    } = fetcher.data

    if (scenarioId) {
      handleScenarioId(scenarioId.toString())
      navigate(`/omm/scenarios?scenario-id=${scenarioId}`)
      return
    }

    if (volumeGraph && volumeTable) {
      updateVolumeGraph(currentSelection.year, volumeGraph)
      updateNpdValue({
        variant: "volume_shares_data",
        newValue: transformInitialData(
          currentSelection.year,
          volumeTable as MarketLevel<SimpleMarketData>
        ),
      })
      if (!isChange) {
        setDataForReset((prev) => {
          return {
            ...prev,
            volumeGraph,
            volumeTable,
          }
        })
      }
      setLoadingVolumeData(false)
    }

    if (volumeTable && marketTable && priceTable) {
      const transformedData = {
        price_data: transformInitialData(
          currentSelection.year,
          priceTable as MarketLevel<SimpleMarketData>
        ),
        market_shares_data: transformInitialData(
          currentSelection.year,
          marketTable as MarketLevel<SimpleMarketData>
        ),
        volume_shares_data: transformInitialData(
          currentSelection.year,
          volumeTable as MarketLevel<SimpleMarketData>
        ),
      }
      setInitialNpdData(transformedData)
      if (!isChange) {
        setDataForReset((prev) => {
          return {
            ...prev,
            marketTable,
            volumeTable,
            priceTable,
          }
        })
      }
    }

    if (marketGraph && marketTable && priceTable) {
      updateMarketSharesGraph(currentSelection.year, marketGraph)
      setLoadingMarketData(false)
      updateNpdValue({
        variant: "market_shares_data",
        newValue: transformInitialData(
          currentSelection.year,
          marketTable as MarketLevel<SimpleMarketData>
        ),
      })
      updateNpdValue({
        variant: "price_data",
        newValue: transformInitialData(
          currentSelection.year,
          priceTable as MarketLevel<SimpleMarketData>
        ),
      })
      if (!isChange) {
        setDataForReset((prev) => {
          return {
            ...prev,
            marketGraph,
            marketTable,
            priceTable,
          }
        })
      }
    }
  }, [fetcher.state, fetcher.data])

  useEffect(() => {
    if (!syncChart || !Object.keys(syncChart).length) return
    const currentTab = Object.keys(syncChart)[0] as keyof NpdVariant

    const tabContent = syncChart[currentTab] as NpdGraph[]
    if ((currentTab as string).includes("volume")) {
      updateVolumeGraph(currentSelection.year, tabContent)
    }
    if ((currentTab as string).includes("market")) {
      updateMarketSharesGraph(currentSelection.year, tabContent)
    }
  }, [syncChart])

  const handleSave = () => {
    if (!npdData) return
    let dataToSave = { ...npdData }

    for (const key in dataToSave) {
      if (dataToSave.hasOwnProperty(key)) {
        const newData = {}
        const typedKey = key as keyof typeof dataToSave
        for (const subKey in dataToSave[typedKey]) {
          if (dataToSave[typedKey].hasOwnProperty(subKey)) {
            const cleanKey = subKey.startsWith("new_")
              ? subKey.slice(4)
              : subKey
            newData[cleanKey] = dataToSave[typedKey][subKey]
          }
        }
        dataToSave[typedKey] = newData
      }
    }

    fetcher.submit(
      {
        intent: "save",
        data: JSON.stringify(dataToSave),
        product: currentSelection.product,
        product_name: currentSelection.product_name,
        year: currentSelection.year,
        month: format(parse(currentSelection.month, "MMM", new Date()), "MMMM"),
        baselineId: baselineId,
        volumeMirrorMarketId: currentSelection.volume_mirror_market,
        marketShareMirrorMarketId: currentSelection.market_share_mirror_market,
      },
      { method: "post" }
    )
  }

  const containsAllData = Object.keys(npdData).length === 3

  const isDisabled =
    !npdData ||
    navigation.state === "loading" ||
    fetcher.state === "submitting" ||
    fetcher.state === "loading" ||
    !containsAllData

  const revertToInitialChangeData = () => {
    updateVolumeGraph(currentSelection.year, dataForReset.volumeGraph)
    updateMarketSharesGraph(currentSelection.year, dataForReset.marketGraph)
    setInitialNpdData({
      price_data: transformInitialData(
        currentSelection.year,
        dataForReset.priceTable
      ),
      market_shares_data: transformInitialData(
        currentSelection.year,
        dataForReset.marketTable
      ),
      volume_shares_data: transformInitialData(
        currentSelection.year,
        dataForReset.volumeTable
      ),
    })
    setSyncChart(undefined)
  }

  return (
    <Modal title={"NPD"} icon={faCommentDots} size={"big"}>
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
          "max-h-[70vh] overflow-y-auto overflow-x-hidden custom-scrollbar dark-scrollbar -mr-2 pr-2 mt-2"
        }
      >
        <fieldset className={"grid grid-cols-3 gap-8 mb-8"}>
          <div className={"flex flex-col gap-4 justify-between"}>
            <Label>Select the product:</Label>
            <SingleSelection
              placeholder={"Product"}
              options={productOptions}
              value={currentSelection.product_name}
              handleValueChange={handleProductChange}
              key={currentSelection.product}
              disabled={isChange}
            />
          </div>
          <div className={"flex flex-col justify-between h-full col-span-2"}>
            <Label>Define the year and month for the new NPD:</Label>
            <YearMonthSelector
              showConfirmationPopover
              classNames={"!gap-8"}
              currentDate={currentSelection}
              setCurrentDate={(date) => {
                setCurrentSelection({ ...currentSelection, ...date })
              }}
              years={years}
              disabled={isChange}
            />
          </div>
        </fieldset>
        <SectionSwitcher tabs={tabs} />
        <footer className="flex flex-wrap gap-4 my-4 justify-end w-full">
          <ConfirmationPopover
            onConfirm={() => revertToInitialChangeData()}
            confirmationHeader={"Do you want to discard your changes?"}
            confirmationMessage={"All changes will be lost."}
            direction={"top"}
          >
            <Button
              variant={"outline"}
              type={"button"}
              className={clsx(
                "!hidden !text-error !border-error hover:!border-secondary hover:!text-secondary hover:dark:!border-white hover:dark:!text-white",
                isChange && "!inline"
              )}
              icon={faTrashCan}
              disabled={isDisabled}
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

const addDataToTable = (
  object: MarketLevel<SimpleMarketData>,
  key: string,
  format: string,
  years: string[],
  values: string[]
) => {
  object[`${key} (${format})`] = {
    years,
    values,
  }
}

function transformVolumeTable(inputData: NpdVolumeData) {
  const volumeData = inputData.Table
  const volumeRows: MarketLevel<SimpleMarketData> = {}

  for (const volume in volumeData) {
    if (Object.prototype.hasOwnProperty.call(volumeData, volume)) {
      const { format, years, values } = volumeData[volume]
      addDataToTable(volumeRows, volume, format, years, values)
    }
  }

  return { volume: volumeRows }
}

function transformMarketShareTable(inputData: NpdMarketSharePriceData) {
  const marketShares = inputData.Table["Market Shares"]
  const priceData = inputData.Table["Price"] || inputData.Table["price"]

  const marketShareRows: MarketLevel<SimpleMarketData> = {}
  const priceRows: MarketLevel<SimpleMarketData> = {}

  for (const data of [marketShares, priceData]) {
    for (const company in data) {
      if (Object.prototype.hasOwnProperty.call(data, company)) {
        const { format, years, values } = data[company]
        const targetArray = data === marketShares ? marketShareRows : priceRows
        addDataToTable(targetArray, company, format, years, values)
      }
    }
  }

  return { marketShare: marketShareRows, price: priceRows }
}

export async function loader({ request }: LoaderFunctionArgs) {
  await requiredUserSession(request)
  const envVar = await getMenuVariables()
  const url = new URL(request.url)
  const marketId = url.searchParams.get("market-id")
  if (!marketId) throw new Error("Market ID is required")
  const scenarioChange = url.searchParams.get("scenario-change-id")
  const { market, code } = await fetchMarket("", marketId)

  if (scenarioChange) {
    const scenarioChangeData = await getBubblesTable<NpdBubbleData>(
      scenarioChange,
      "NPD"
    )
    const {
      baseline_id,
      product_id,
      volume_mirror_market_name,
      market_share_mirror_market_name,
      product_name,
      year,
      month,
      "Volume Data": volumeData,
      "Market Data": marketData,
    } = scenarioChangeData

    const npdCompanies = await fetchNpdCompanies(baseline_id, product_id)
    const products: NpdProductMirrorMarket[] = [
      {
        product_id,
        product_mirror_markets: [volume_mirror_market_name],
        market_share_mirror_markets: [market_share_mirror_market_name],
        product_name,
      },
    ]

    return {
      envVar,
      baselineId: baseline_id,
      products,
      companies: npdCompanies,
      initialVolumeGraph: volumeData?.Graphic,
      volumeProducts: scenarioChangeData?.Products,
      initialMarketSharesGraph: marketData?.Graphic,
      initialVolumeTable: transformVolumeTable(volumeData).volume,
      initialMarketSharesTable:
        transformMarketShareTable(marketData).marketShare,
      initialPriceTable: transformMarketShareTable(marketData).price,
      marketName: market,
      marketCode: code,
      initialDates: {
        year: String(year),
        month: enUS.localize.month((Number(month) - 1) as Month, {
          width: "abbreviated",
        }),
      },
      isChange: true,
    }
  }

  const npdData = await fetchNpdProducts(marketId)
  const initialProduct = npdData.products[0].product_id.toString()
  const initialMirrorMarket =
    npdData.products[0].product_mirror_markets[0].toString()
  const baseline = npdData.baseline_id.toString()
  const npdCompanies = await fetchNpdCompanies(baseline, initialProduct)

  const volumes = await fetchNpdVolumes(
    baseline,
    initialProduct,
    initialMirrorMarket
  )
  const initialVolumeGraph = volumes?.Graphic
  const initialVolumeTable = transformVolumeTable(volumes)

  const marketSharesPrice = await fetchNpdMarketSharePrice(
    baseline,
    initialProduct,
    initialMirrorMarket
  )
  const initialMarketSharesGraph = marketSharesPrice?.Graphic
  const initialMarketSharesTable = transformMarketShareTable(marketSharesPrice)
  return {
    envVar,
    baselineId: npdData.baseline_id,
    products: npdData.products,
    companies: npdCompanies,
    initialVolumeGraph,
    initialMarketSharesGraph,
    initialVolumeTable: initialVolumeTable.volume,
    volumeProducts: volumes?.Products,
    initialMarketSharesTable: initialMarketSharesTable.marketShare,
    initialPriceTable: initialMarketSharesTable.price,
    marketName: market,
    marketCode: code,
    initialDates: {
      year: String(getYear(new Date())),
      month: enUS.localize.month(Number(getMonth(new Date())) as Month, {
        width: "abbreviated",
      }),
    },
    isChange: false,
  }
}

export async function action({ request }: LoaderFunctionArgs) {
  const formData = await request.formData()
  const { intent, ...values } = Object.fromEntries(formData)

  switch (intent) {
    case "fetch-volume-graph": {
      const { mirrorMarket, product, baseline } = values
      if (!mirrorMarket || !product || !baseline)
        throw new Error("Mirror market, product and baseline are required")
      const data = await fetchNpdVolumes(
        String(baseline),
        String(product),
        String(mirrorMarket)
      )
      const volumeGraph = data?.Graphic
      const volumeTable = transformVolumeTable(data)
      return {
        volumeGraph,
        volumeTable: volumeTable.volume,
        marketGraph: null,
        marketTable: null,
        companies: null,
        volumeProducts: data?.Products,
        priceTable: null,
        scenarioId: null,
      }
    }
    case "fetch-market-share-graph": {
      const { mirrorMarket, product, baseline } = values
      if (!mirrorMarket || !product || !baseline)
        throw new Error("Mirror market, product and baseline are required")

      const data = await fetchNpdMarketSharePrice(
        String(baseline),
        String(product),
        String(mirrorMarket)
      )
      const marketGraph = data?.Graphic
      const marketTable = transformMarketShareTable(data)
      return {
        volumeGraph: null,
        volumeTable: null,
        volumeProducts: null,
        marketTable: marketTable.marketShare,
        marketGraph,
        companies: null,
        priceTable: marketTable.price,
        scenarioId: null,
      }
    }
    case "product-change": {
      const { volumeMirrorMarket, marketShareMirrorMarket, product, baseline } =
        values
      if (
        !volumeMirrorMarket ||
        !marketShareMirrorMarket ||
        !product ||
        !baseline
      )
        throw new Error("Mirror market, product and baseline are required")

      const [volumeData, marketData] = await Promise.all([
        fetchNpdVolumes(
          String(baseline),
          String(product),
          String(volumeMirrorMarket)
        ),
        fetchNpdMarketSharePrice(
          String(baseline),
          String(product),
          String(marketShareMirrorMarket)
        ),
      ])

      const { volume } = transformVolumeTable(volumeData)
      const { marketShare, price } = transformMarketShareTable(marketData)

      const companies = await fetchNpdCompanies(
        String(baseline),
        String(product)
      )

      return {
        volumeGraph: volumeData?.Graphic,
        volumeTable: volume,
        volumeProducts: volumeData?.Products,
        companies: companies,
        marketTable: marketShare,
        marketGraph: marketData?.Graphic,
        priceTable: price,
        scenarioId: null,
      }
    }
    case "save": {
      const {
        data,
        product,
        product_name,
        year,
        month,
        baselineId,
        volumeMirrorMarketId,
        marketShareMirrorMarketId,
      } = values as Record<string, string>
      const parsedData = JSON.parse(data as string)
      const url = new URL(request.url)
      const scenarioId = url.searchParams.get("scenario-id") ?? "0"
      const marketId = url.searchParams.get("market-id") ?? "13"
      const savedData = await saveNpdData(
        scenarioId,
        baselineId,
        marketId,
        product_name,
        product,
        year,
        month,
        volumeMirrorMarketId,
        marketShareMirrorMarketId,
        parsedData
      )
      return {
        scenarioId: savedData?.scenario_id,
        volumeGraph: null,
        volumeProducts: null,
        volumeTable: null,
        marketTable: null,
        marketGraph: null,
        companies: null,
        priceTable: null,
      }
    }
    default:
      return null
  }
}

export function ErrorBoundary() {
  return (
    <Modal title={"NPD Error"} icon={faCommentDots}>
      <ErrorBoundaryComponent isMainRoute={false} />
    </Modal>
  )
}
