import { requiredUserSession } from "@/data/auth/session.server"
import { getMenuVariables } from "@/data/menuvariables/menuvariables.server"
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node"
import {
  json,
  useFetcher,
  useLoaderData,
  useNavigate,
  useNavigation,
} from "@remix-run/react"
import { ErrorBoundaryComponent } from "@/components/ui/ErrorBoundaryComponent/ErrorBoundaryComponent"
import { Button } from "@/components/ui/Button/Button"
import {
  faCheck,
  faEquals,
  faList,
  faTrashCan,
} from "@fortawesome/free-solid-svg-icons"
import Modal from "@/components/Shared/Modal/Modal"
import {
  fetchMarket,
  getProductBans,
  getProductBanShares,
  saveBanData,
  updateScenarioName,
  getBubblesTable,
} from "@/data/omm/omm.server"
import React, { useState, useEffect } from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select/Select"
import { Label } from "@radix-ui/react-label"
import BanTableHandler from "@/components/OMM/EditableTable/Handlers/BanTableHandler"
import YearMonthPicker from "@/components/ui/DatePicker/YearMonthPicker"
import { useScenarioTableStore } from "@/store/omm"
import { getMonth, Month, parse as parse_date } from "date-fns"
import { CountryFlag } from "@/components/OMM/CountryFlag/CountryFlag"
import { enUS } from "date-fns/locale"
import TableSkeleton from "@/components/Shared/TableSkeleton/TableSkeleton"
import ConfirmationPopover from "@/components/Shared/ConfirmationPopover/ConfirmationPopover"

export default function OmmMarketDrivers() {
  const navigation = useNavigation()
  const navigate = useNavigate()
  const fetcher = useFetcher()
  const {
    marketId,
    finalProductList,
    scenarioChangeId,
    initialYear,
    initialMonth,
    defaultProductBanShares,
    marketName,
    marketCode,
  } = useLoaderData<typeof loader>()
  const productOptions: {
    value: string
    label: string
  }[] = finalProductList.map((product: string) => ({
    value: product,
    label: product,
  }))
  const [banShares, setBanShares] = useState(defaultProductBanShares)
  const [banMonth, setBanMonth] = useState<string | null>(initialMonth)
  const [banYear, setBanYear] = useState<string | null>(initialYear.toString())
  const [loading, setLoading] = useState(false)
  const [banProduct, setBanProduct] = useState<string>(finalProductList[0])
  const [availableYears, setAvailableYears] = useState<string[] | number[]>(
    Object.keys(defaultProductBanShares)
  )
  const { banData, saveBanData } = useScenarioTableStore()
  const [tableKey, setTableKey] = useState(1)
  const [isNormalizeEnabled, setIsNormalizeEnabled] = useState(false)

  useEffect(() => {
    saveBanData({
      market_id: Number(marketId),
      month_launch: initialMonth
        ? getMonth(parse_date(initialMonth, "MMM", new Date())) + 1
        : 1,
      tableData: { [Number(initialYear)]: banShares[initialYear] },
    })
  }, [])

  useEffect(() => {
    setBanShares(defaultProductBanShares)
  }, [])

  const isDisabled =
    navigation.state !== "idle" ||
    fetcher.state !== "idle" ||
    !banYear ||
    !banMonth

  const handleProductChange = (product: string) => {
    setBanProduct(product)
    fetcher.submit(
      { intent: "load", data: JSON.stringify({ product: product }) },
      { method: "POST" }
    )
    setLoading(true)
  }

  const normalizeScenarioChanges = () => {
    if (banYear && banData.tableData && banYear in banData.tableData) {
      const rawData = banData.tableData[banYear]

      const total = Object.values(rawData).reduce(
        (sum, pair) => sum + pair.value,
        0
      )

      if (total === 0) return

      const normalizedData = Object.fromEntries(
        Object.entries(rawData).map(([key, entry]) => [
          key,
          {
            value: Number(((entry.value / total) * 100).toFixed(2)),
            format: entry.format,
          },
        ])
      )

      saveBanData({
        market_id: Number(marketId),
        month_launch: banMonth
          ? getMonth(parse_date(banMonth, "MMM", new Date())) + 1
          : 1,
        tableData: { [banYear]: normalizedData },
      })

      setBanShares((prev) => ({
        ...prev,
        [banYear]: normalizedData,
      }))

      setTableKey((prev) => prev + 1)
      setIsNormalizeEnabled(false)
    }
  }

  const saveScenarioChanges = () => {
    fetcher.submit(
      {
        intent: "save",
        data: JSON.stringify(banData),
        product: banProduct,
      },
      { method: "POST" }
    )
  }

  const resetScenarioChanges = () => {
    if (banYear) {
      saveBanData({
        market_id: Number(marketId),
        month_launch: banMonth
          ? getMonth(parse_date(banMonth, "MMM", new Date())) + 1
          : 1,
        tableData: { [Number(banYear)]: defaultProductBanShares[banYear] },
      })
      setTableKey((prev) => prev + 1)
    }
  }

  useEffect(() => {
    if (fetcher.data) {
      if (fetcher.data.productBanShares) {
        setBanShares(fetcher.data.productBanShares)
        setTableKey((prev) => prev + 1)
        setAvailableYears(Object.keys(fetcher.data.productBanShares))
        setBanYear(Object.keys(fetcher.data.productBanShares)[0])
        setLoading(false)
      }

      if (fetcher.data.scenarioId) {
        navigate("/omm/scenarios?scenario-id=" + fetcher.data.scenarioId)
      }
    }
  }, [fetcher.data])

  const handleDateChange = (type: "year" | "month", value: string) => {
    if (type === "year") setBanYear(value)
    if (type === "month") setBanMonth(value)

    saveBanData({
      market_id: Number(marketId),
      month_launch:
        type === "month" && value
          ? getMonth(parse_date(value, "MMM", new Date())) + 1
          : banData.month_launch || 1,
      tableData:
        type === "year" ? { [value]: banShares[value] } : banData.tableData,
    })

    if (type === "year") setTableKey((prev) => prev + 1)
  }

  const isNormalized = () => {
    if (banYear && banData.tableData && banYear in banData.tableData) {
      const rawData = banData.tableData[banYear]
      const total = Object.values(rawData).reduce(
        (sum, pair) => sum + pair.value,
        0
      )
      return total === 100
    }
    return false
  }

  useEffect(() => {
    setIsNormalizeEnabled(
      !!banData.tableData &&
        Object.keys(banData.tableData).length > 0 &&
        !isNormalized() &&
        navigation.state === "idle" &&
        !loading &&
        fetcher.state === "idle"
    )
  }, [banData.tableData, isNormalized, navigation.state])

  return (
    <Modal title={"Ban"} icon={faList}>
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
          "max-h-[60vh] overflow-y-auto custom-scrollbar dark-scrollbar -mr-2 pr-2"
        }
      >
        <div>
          <fieldset className="grid grid-cols-2 gap-12">
            <div>
              <Label>Select a product:</Label>
              <Select
                defaultValue={finalProductList[0]}
                onValueChange={handleProductChange}
                disabled={!!scenarioChangeId}
              >
                <SelectTrigger className="bg-third dark:bg-secondary-dark mt-3">
                  <SelectValue placeholder="Select a product" />
                </SelectTrigger>
                <SelectContent className="rounded-xs shadow-md border border-input bg-white dark:bg-secondary-dark dark:text-white">
                  {productOptions.map((option) => (
                    <SelectItem
                      key={option.value}
                      value={option.value}
                      className="hover:bg-primary transition-colors rounded-xs"
                    >
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3 ">
              <Label>Define a period for the product ban:</Label>
              <div className="flex flex-row gap-4 flex-1">
                <YearMonthPicker
                  value={banYear}
                  variant="year"
                  years={availableYears}
                  onChange={(year) => handleDateChange("year", year)}
                  className="w-full"
                  disabled={!!scenarioChangeId}
                />
                <YearMonthPicker
                  value={banMonth}
                  variant={"month"}
                  onChange={(month) => handleDateChange("month", month)}
                  className="w-full"
                  disabled={!!scenarioChangeId}
                />
              </div>
            </div>
          </fieldset>

          <div className="mt-8 flex flex-col align-baseline w-full ">
            {loading ? (
              <TableSkeleton rows={2} classNames={"mt-4"} />
            ) : (
              <BanTableHandler
                key={`${banYear}-${tableKey}-${banProduct}`}
                data={[banShares[banYear]]}
                year={banYear}
                month={
                  banMonth
                    ? getMonth(parse_date(banMonth, "MMM", new Date())) + 1
                    : 1
                }
                marketID={marketId}
              />
            )}
            <Button
              icon={faEquals}
              className="self-end -mt-2 text-primary dark:text-primary dark:hover:text-primary hover:underline"
              variant="ghost"
              onClick={() => {
                normalizeScenarioChanges()
              }}
              disabled={!isNormalizeEnabled}
            >
              Normalize values
            </Button>
          </div>

          <footer className="flex flex-wrap gap-4 mt-10 justify-end">
            {scenarioChangeId && (
              <ConfirmationPopover
                onConfirm={() => resetScenarioChanges()}
                confirmationHeader={"Do you want to discard your changes?"}
                confirmationMessage={"All changes will be lost."}
                direction={"top"}
              >
                <Button
                  variant={"outline"}
                  type={"button"}
                  className={
                    "!inline !text-error !border-error hover:!border-secondary hover:!text-secondary hover:dark:!border-white hover:dark:!text-white"
                  }
                  icon={faTrashCan}
                  disabled={isDisabled}
                >
                  Discard
                </Button>
              </ConfirmationPopover>
            )}
            <Button
              type={"button"}
              icon={faCheck}
              disabled={isDisabled}
              isLoading={fetcher.state === "submitting"}
              name="intent"
              value="save"
              onClick={() => {
                saveScenarioChanges()
              }}
            >
              Confirm
            </Button>
          </footer>
        </div>
      </main>
    </Modal>
  )
}

export async function loader({ request }: LoaderFunctionArgs) {
  await requiredUserSession(request)
  const envVar = await getMenuVariables()

  // Get market
  const url = new URL(request.url)
  const urlParams = new URLSearchParams(url.search)
  const marketId = urlParams.get("market-id")
  const scenarioChangeId = urlParams.get("scenario-change-id")
  if (!marketId) throw new Response("Missing Market ID!", { status: 400 })
  const { market, code } = await fetchMarket("", marketId)

  const productsBan = await getProductBans(marketId)

  let finalProductList
  let initialYear
  let initialMonth
  let defaultProductBanShares

  if (scenarioChangeId) {
    const savedProductShares = await getBubblesTable(scenarioChangeId, "Ban")
    finalProductList = [savedProductShares.product_name]
    //To convert to Jan, Feb, Mar
    initialMonth = new Date(
      2000,
      Number(savedProductShares.month) - 1,
      1
    ).toLocaleString("en-US", { month: "short" })
    initialYear = savedProductShares.year
    defaultProductBanShares = {
      [savedProductShares.year]: savedProductShares.table,
    }
  } else {
    finalProductList = productsBan
    initialMonth = enUS.localize.month(Number(getMonth(new Date())) as Month, {
      width: "abbreviated",
    })
    defaultProductBanShares = await getProductBanShares(
      marketId,
      finalProductList[0]
    )
    initialYear = Object.keys(defaultProductBanShares)[0]
  }

  if (!productsBan)
    throw new Response("Ban Products Not Found:", { status: 404 })

  return {
    envVar,
    marketId,
    marketName: market,
    marketCode: code,
    finalProductList,
    defaultProductBanShares,
    scenarioChangeId,
    initialYear,
    initialMonth,
  }
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData()
  const { intent, data, product } = Object.fromEntries(formData)

  const url = new URL(request.url)
  const urlParams = new URLSearchParams(url.search)
  const marketId = urlParams.get("market-id")?.toString() || 13
  const paramScenarioId = Number(urlParams.get("scenario-id")) || 0

  switch (intent) {
    case "save": {
      const parsed_data = JSON.parse(data as string)
      const scenarioId = await saveBanData(
        parsed_data,
        product.toString(),
        paramScenarioId
      )
      await updateScenarioName(
        scenarioId.scenario_id,
        parsed_data.scenario_name
      )
      return json({
        status: 200,
        scenarioId: await scenarioId.scenario_id,
        productBanShares: null,
      })
    }
    case "load": {
      const parsed = JSON.parse(data as string)
      if (parsed.product) {
        const productBanShares = await getProductBanShares(
          marketId,
          parsed.product
        )
        return json({
          status: null,
          scenarioId: null,
          productBanShares,
        })
      }
    }
    default: {
      throw new Response("Unknown intent", { status: 400 })
    }
  }
}

export function ErrorBoundary() {
  return (
    <Modal title={"Ban"} icon={faList}>
      <ErrorBoundaryComponent isMainRoute={false} />
    </Modal>
  )
}
