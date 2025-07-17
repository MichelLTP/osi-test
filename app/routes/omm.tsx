import Header from "@/components/Layout/Header/Header"
import Sidebar from "@/components/Layout/Sidebar/Sidebar"
import Main from "@/components/Layout/Main/Main"
import { useCloseSidebar } from "@/store/layout"
import { useState, useEffect, useCallback } from "react"
import { Outlet, useLoaderData, useSearchParams } from "@remix-run/react"
import MobileMenu from "@/components/Layout/MobileMenu/MobileMenu"
import { clsx } from "clsx"
import { requiredUserSession } from "@/data/auth/session.server"
import { json, LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node"
import { getMenuVariables } from "@/data/menuvariables/menuvariables.server"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faCheckCircle } from "@fortawesome/free-solid-svg-icons"
import { AnimatePresence } from "framer-motion"
import { useFetcher } from "@remix-run/react"
import { ErrorBoundaryComponent } from "@/components/ui/ErrorBoundaryComponent/ErrorBoundaryComponent"
import DashboardEmptyComponent from "@/components/OMM/Dashboard/DashboardEmptyComponent/DashboardEmptyComponent"
import ScenarioChanges from "@/components/OMM/ScenarioChanges/ScenarioChanges"
import DashboardOptions from "@/components/OMM/Dashboard/DashboardOptions/DashboardOptions"
import DashboardFilters from "@/components/OMM/Dashboard/DashboardFilters/DashboardFilters"
import SingleSelection from "@/components/Shared/SingleSelection/SingleSelection"
import DashboardChart from "@/components/OMM/Dashboard/DashboardChart/DashboardChart"
import {
  fetchMarkets,
  fetchCompanies,
  fetchProducts,
  fetchMeasures,
  fetchDashboardData,
} from "@/data/omm/omm.server"
import { FetcherGraphData, GraphData } from "@/components/OMM/Dashboard/type"
import DynamicDataTable from "@/components/ui/DynamicDataTable/DynamicDataTable"
import { LoadingComponent } from "@/components/Layout/LoadingComponent/LoadingComponent"
import { useDashboardDataUpdater } from "@/hooks/useDashboardDataUpdater"
import { Label } from "@/components/ui/Label/Label"
import { Badge } from "@/components/ui/Badge/Badge"
import ExploreFurther from "@/components/OMM/ExploreFurther/ExploreFurther"
import { GraphOptions } from "@/components/OMM/Dashboard/DashboardOptions/type"
import { Measure } from "@/components/OMM/types"
import { Option } from "@/components/Shared/SingleSelection/types"
import { Skeleton } from "@/components/ui/Skeleton/Skeleton"

export default function Omm() {
  const {
    markets,
    companies,
    products,
    filteredMeasures,
    allMeasures,
    measureGroups,
    options,
  } = useLoaderData<typeof loader>()
  const fetcher = useFetcher<FetcherGraphData>()
  const [activeTableMeasures, setActiveTableMeasures] = useState(
    allMeasures
      .filter(
        (measure) => measure.group === "Outcomes" && measure.label !== null
      )
      .map((measure) => measure.label)
  )
  const [activeGraphMeasures, setActiveGraphMeasures] =
    useState<Option[]>(filteredMeasures)
  const close = useCloseSidebar((state) => state.close)

  const [filters, setFilters] = useState({
    markets: markets.map((item) => item.market_id),
    products: products.map((item) => item.product_hier_id),
    companies: companies.map((item) => item.company_hier_id),
    markets_2: markets.map((item) => item.market_id),
    products_2: products.map((item) => item.product_hier_id),
    companies_2: companies.map((item) => item.company_hier_id),
  })
  const [activeMeasure, setActiveMeasure] = useState("32")
  const [tableOptions, setTableOptions] = useState(options)
  const [activeTableOption, setActiveTableOption] =
    useState<string>("baselineData")
  const [activeTableDomain, setActiveTableDomain] = useState<string>("Outcomes")
  const [searchParams, setSearchParams] = useSearchParams()
  const scenarioID = searchParams.get("scenario-id") ?? "0"
  const [graphOptions, setGraphOptions] = useState<GraphOptions>({
    baseline: "pure",
    period: "yearly",
    isDoubleContext: false,
    activeYear: undefined,
  })
  const [isPartialDataLoading, setIsPartialDataLoading] = useState(true)
  const [isFullDataLoading, setIsFullDataLoading] = useState(true)
  const {
    updatedGraphData,
    updatedTableData,
    updatedSourceData,
    availableYears,
  } = useDashboardDataUpdater({
    fetcherData: fetcher.data,
    activeMeasure,
    activePeriod: graphOptions.period,
    isDoubleContext: graphOptions.isDoubleContext,
    activeOption: activeTableOption,
    scenarioID: scenarioID ?? 0,
    tableMeasures: activeTableMeasures,
  })

  const handleFilterChange = useCallback(
    (filterField: keyof typeof filters, selectedValues: number[]) => {
      setFilters((prevFilters) => ({
        ...prevFilters,
        [filterField]: selectedValues,
      }))
    },
    []
  )

  const handleOptionsChange = useCallback(
    (
      optionsField: keyof typeof graphOptions,
      selectedValue: string | boolean
    ) => {
      setGraphOptions((prevOptions) => ({
        ...prevOptions,
        [optionsField]: selectedValue,
        ...(optionsField === "period" &&
          selectedValue === "yearly" && { activeYear: undefined }),
      }))
    },
    []
  )

  useEffect(() => {
    setIsPartialDataLoading(
      fetcher.state !== "idle" ||
        (!updatedGraphData.graphValues?.length && !fetcher.data?.error)
    )
    const hasScenarioKey = updatedGraphData?.graphValues?.some(
      (obj) => obj.scenario !== undefined && obj.scenario !== null
    )
    if (!hasScenarioKey) {
      setTableOptions((prevOptions) =>
        prevOptions.map((option) => ({
          ...option,
          disabled: option.value === "scenarioData",
        }))
      )
    } else {
      setTableOptions((prevOptions) =>
        prevOptions.map((option) => ({ ...option, disabled: false }))
      )
    }
  }, [fetcher.state, updatedGraphData])

  const fetchData = () => {
    const formData = new FormData()
    formData.append("activeMarkets", filters.markets.join(","))
    formData.append("activeProducts", filters.products.join(","))
    formData.append("activeCompanies", filters.companies.join(","))
    formData.append("activeBaseline", graphOptions.baseline)
    formData.append("activePeriod", graphOptions.period)
    formData.append("context", graphOptions.isDoubleContext ? "3" : "1")
    formData.append("activeMeasure", activeMeasure)
    if (scenarioID) formData.append("activeScenarioID", scenarioID.toString())
    if (graphOptions.activeYear)
      formData.append("currentYear", graphOptions.activeYear)

    if (graphOptions.isDoubleContext) {
      formData.append("activeMarkets_2", filters.markets_2.join(","))
      formData.append("activeProducts_2", filters.products_2.join(","))
      formData.append("activeCompanies_2", filters.companies_2.join(","))
      formData.append("activeBaseline", graphOptions.baseline)
      formData.append("activePeriod", graphOptions.period)
      formData.append("context", "2")
    }
    fetcher.submit(formData, { method: "post" })
  }

  useEffect(() => {
    if (graphOptions.period === "monthly" && !graphOptions.activeYear) {
      return
    }
    fetchData()
  }, [graphOptions, scenarioID, filters])

  useEffect(() => {
    const generated = searchParams.get("generated")
    if (generated) {
      setIsFullDataLoading(true)
      setTimeout(() => {
        fetchData()
      }, 1000)
      setSearchParams((prev) => {
        prev.delete("generated")
        return prev
      })
    }
  }, [searchParams])

  useEffect(() => {
    if (fetcher.data?.graphData) {
      let updatedFilteredMeasures = filteredMeasures.filter((measure) =>
        Object.keys(fetcher.data?.graphData as GraphData).includes(
          measure.value
        )
      )
      if (fetcher.data?.graphData2 && fetcher.data?.contextType !== "1") {
        updatedFilteredMeasures = updatedFilteredMeasures.filter((measure) =>
          Object.keys(fetcher.data?.graphData2 as GraphData).includes(
            measure.value
          )
        )
      }
      setActiveGraphMeasures(updatedFilteredMeasures)
      const volumeMeasure = updatedFilteredMeasures?.find(
        (measure) => measure.value.toString() === "32"
      )
      setActiveMeasure(
        volumeMeasure?.value ?? updatedFilteredMeasures?.[0]?.value
      )
    }
  }, [fetcher.data?.graphData])

  useEffect(() => {
    if (fetcher.state === "idle" && updatedGraphData) {
      setIsPartialDataLoading(false)
      setIsFullDataLoading(false)
    } else if (
      fetcher.state === "idle" &&
      (!markets || !companies || !products)
    ) {
      setIsPartialDataLoading(false)
      setIsFullDataLoading(true)
    } else {
      setIsPartialDataLoading(true)
      setIsFullDataLoading(false)
    }
  }, [fetcher.state])

  return (
    <>
      <Sidebar />
      <MobileMenu />
      <div
        className={clsx(
          "transition-all duration-300 w-full p-0 !m-0 h-[90vh]",
          close ? "md:pl-sidebarClosed" : "md:pl-sidebarOpen"
        )}
      >
        <Header />
        <div className="flex w-full">
          <main className={"flex flex-col flex-1 p-5 overflow-x-hidden"}>
            {searchParams.get("scenario-id") && (
              <ScenarioChanges markets={markets} />
            )}

            <Main hasMobileMenu>
              <header
                className={clsx(
                  "mb-12",
                  scenarioID === "0" ? "mt-1.5" : "-mt-12"
                )}
              >
                <h1 className={"text-3xlbold text-primary"}>
                  <span
                    className={"font-normal text-secondary dark:text-third"}
                  >
                    OMM{" "}
                  </span>
                  Playground
                </h1>
                <p className={"text-base text-secondary dark:text-third"}>
                  Powered by the latest machine learning models
                </p>
              </header>
              <DashboardOptions
                options={graphOptions}
                onOptionChange={handleOptionsChange}
                availableYears={availableYears}
                currentYear={graphOptions.activeYear}
              />

              {isFullDataLoading && fetcher.state == "idle" ? (
                <>
                  <LoadingComponent variant="Dashboard Filters" />
                  <LoadingComponent variant="Dashboard Chart" />
                </>
              ) : (
                <div className="mt-12 flex flex-col gap-6 flex-1">
                  <DashboardFilters
                    markets={markets}
                    activeMarkets={filters.markets}
                    products={products}
                    activeProducts={filters.products}
                    companies={companies}
                    activeCompanies={filters.companies}
                    handleValueChange={handleFilterChange}
                  />

                  {graphOptions.isDoubleContext && (
                    <DashboardFilters
                      markets={markets}
                      activeMarkets={filters.markets_2}
                      products={products}
                      activeProducts={filters.products_2}
                      companies={companies}
                      activeCompanies={filters.companies_2}
                      handleValueChange={handleFilterChange}
                      context={2}
                    />
                  )}

                  <section className="flex justify-between w-full mt-10 items-center">
                    <aside className="flex flex-row gap-4 items-center">
                      {(isPartialDataLoading ||
                        updatedSourceData.sourceValues.length > 0) && (
                        <Label className={"!text-basebold"}>Sources:</Label>
                      )}

                      {isPartialDataLoading &&
                        !updatedSourceData.sourceValues.length && (
                          <LoadingComponent variant="scenario-sources" />
                        )}

                      {updatedSourceData.sourceValues &&
                        updatedSourceData.sourceValues.map((source) => (
                          <Badge key={source} variant={"info"}>
                            <FontAwesomeIcon
                              icon={faCheckCircle}
                              className="mr-2"
                            />
                            {source}
                          </Badge>
                        ))}
                    </aside>
                    {isPartialDataLoading ? (
                      <Skeleton className={"block w-1/4 h-[45px] rounded-xs"} />
                    ) : !updatedGraphData?.graphValues?.length ? null : (
                      <SingleSelection
                        placeholder="Measure"
                        triggerClasses="w-1/4"
                        options={activeGraphMeasures}
                        defaultValue={
                          activeMeasure ?? activeGraphMeasures?.[0]?.value
                        }
                        handleValueChange={(value) => setActiveMeasure(value)}
                      />
                    )}
                  </section>
                  {isPartialDataLoading ? (
                    <LoadingComponent variant="Dashboard Chart" />
                  ) : !updatedGraphData?.graphValues?.length ? (
                    <DashboardEmptyComponent />
                  ) : (
                    <div>
                      <div className="flex-1 flex items-center justify-center mt-5  ">
                        <DashboardChart
                          graphData={updatedGraphData.graphValues}
                          granularity={
                            graphOptions.activeYear ? "monthly" : "yearly"
                          }
                          isDoubleContext={graphOptions.isDoubleContext}
                          hasScenario={updatedGraphData?.graphValues?.some(
                            (obj) => "scenario" in obj
                          )}
                          measureUnit={
                            filteredMeasures.find(
                              (measureData) =>
                                measureData.value === activeMeasure
                            )?.format
                          }
                        />
                      </div>
                      <div className="mt-8 mb-14 flex justify-end gap-6">
                        <SingleSelection
                          placeholder="Filter per Domain"
                          triggerClasses="w-1/4"
                          options={measureGroups}
                          value={activeTableDomain}
                          handleValueChange={(value) => {
                            setActiveTableDomain(value)
                            setActiveTableMeasures(
                              allMeasures
                                .filter(
                                  (measure) =>
                                    measure.group === value &&
                                    measure.label !== null
                                )
                                .map((measure) => measure.label)
                            )
                          }}
                        />
                        <SingleSelection
                          placeholder="Measure"
                          triggerClasses="w-1/4"
                          options={tableOptions}
                          defaultValue={activeTableOption}
                          handleValueChange={(value) =>
                            setActiveTableOption(value)
                          }
                        />
                      </div>
                      <DynamicDataTable
                        variant={"omm-custom"}
                        tableData={updatedTableData?.tableValues}
                      />
                    </div>
                  )}
                </div>
              )}
            </Main>
          </main>

          <AnimatePresence mode="wait" initial={false}>
            <Outlet />
          </AnimatePresence>

          <ExploreFurther
            dataToExport={filters}
            disabled={!updatedGraphData?.graphValues?.length} //FIXME: To be implemented after the dashboard has no local errors.
            period={graphOptions.period}
            year={graphOptions.activeYear}
          />
        </div>
      </div>
    </>
  )
}

export async function loader({ request }: LoaderFunctionArgs) {
  const token = await requiredUserSession(request)

  const markets = await fetchMarkets(token)

  const companies = await fetchCompanies(token, "brand_family")

  const products = await fetchProducts(token)
  const filtered_products = products.filter(
    (row: any) => row.level === "product_definition"
  )

  const measures = await fetchMeasures(token)
  const measureGroups = [
    ...new Set(
      measures
        .map((measure) => measure.measure_group)
        .filter(
          (measure_group) =>
            measure_group !== null &&
            measure_group !== undefined &&
            measure_group != "Taxation" &&
            measure_group != "Illicit" &&
            measure_group != "Distribution"
        )
    ),
  ]
  const filtered_measures = measures.filter(
    (row: Measure) =>
      row.measure_type === "Market Outcomes" && row.web_app_display_name != null
  )

  const envVar = await getMenuVariables()
  return json({
    envVar,
    markets: markets,
    companies: companies,
    products: filtered_products,
    filteredMeasures: filtered_measures.map((item: Measure) => ({
      value: String(item.measure_id),
      label: `${item.web_app_display_name} (${
        item.measure_magnitude === 1000
          ? `k ${item.measure_unit ?? ""}`
          : item.measure_magnitude === 1000000
            ? `M${item.measure_unit ? ` ${item.measure_unit}` : ""}`
            : (item.measure_unit ?? "")
      })`,
      format: `${
        item.measure_magnitude === 1000
          ? `k ${item.measure_unit ?? ""}`
          : item.measure_magnitude === 1000000
            ? `M ${item.measure_unit ?? ""}`
            : (item.measure_unit ?? "")
      }`,
    })),
    allMeasures: measures.map((item: Measure) => ({
      value: item.measure_id,
      label: item.web_app_display_name,
      group: item.measure_group,
    })),
    measureGroups: measureGroups.map((group) => ({
      value: group,
      label: group,
    })),
    options: [
      { value: "baselineData", label: "Baseline", disabled: false },
      { value: "scenarioData", label: "Scenario", disabled: true },
    ],
  })
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData()
  const context = formData.get("context")
  const contextSuffix = context === "2" ? "_2" : ""
  const marketIDs = formData.get(`activeMarkets${contextSuffix}`)
  const companyIDs = formData.get(`activeCompanies${contextSuffix}`)
  const productIDs = formData.get(`activeProducts${contextSuffix}`)
  const granularity = formData.get("activePeriod") as string
  const year = (formData.get("currentYear") as string) ?? "2025"
  const baseline = formData.get("activeBaseline") as string

  const urlParams = new URL(request.url).searchParams
  const scenarioId = urlParams.get("scenario-id")
  const activeScenarioID =
    (formData.get("activeScenarioID") as string) ?? scenarioId

  try {
    if (marketIDs && companyIDs && productIDs) {
      const parsedMarketIDs = marketIDs
        .toString()
        .split(",")
        .map((id) => parseInt(id, 10))
      const parsedCompanyIDs = companyIDs
        .toString()
        .split(",")
        .map((id) => parseInt(id, 10))
      const parsedProductIDs = productIDs
        .toString()
        .split(",")
        .map((id) => parseInt(id, 10))

      const mandatoryParams = {
        granularity: granularity,
        baseline_type: baseline,
        product_hiers: parsedProductIDs,
        company_hiers: parsedCompanyIDs,
        market_ids: parsedMarketIDs,
      }

      let optionalParams: any = {}
      if (granularity === "monthly" && year) {
        optionalParams = {
          year: parseInt(year, 10),
        }
      }

      if (activeScenarioID && activeScenarioID !== "0") {
        optionalParams.scenario_id = parseInt(activeScenarioID, 10)
      }

      // Handle context "3" - both lines need to be updated
      if (context === "3") {
        const marketIDs_2 = formData.get(`activeMarkets_2`)
        const companyIDs_2 = formData.get(`activeCompanies_2`)
        const productIDs_2 = formData.get(`activeProducts_2`)

        if (marketIDs_2 && companyIDs_2 && productIDs_2) {
          const parsedMarketIDs_2 = marketIDs_2
            .toString()
            .split(",")
            .map((id) => parseInt(id, 10))
          const parsedCompanyIDs_2 = companyIDs_2
            .toString()
            .split(",")
            .map((id) => parseInt(id, 10))
          const parsedProductIDs_2 = productIDs_2
            .toString()
            .split(",")
            .map((id) => parseInt(id, 10))

          const mandatoryParams_2 = {
            granularity: granularity,
            baseline_type: baseline,
            product_hiers: parsedProductIDs_2,
            company_hiers: parsedCompanyIDs_2,
            market_ids: parsedMarketIDs_2,
          }

          let optionalParams_2: any = {}
          if (granularity === "monthly" && year) {
            optionalParams_2 = {
              year: parseInt(year, 10),
            }
          }

          if (activeScenarioID && activeScenarioID !== "0") {
            optionalParams.scenario_id = parseInt(activeScenarioID, 10)
            optionalParams_2.scenario_id = parseInt(activeScenarioID, 10)
          }

          // Fetch data for both contexts
          const dashboardData = await fetchDashboardData(
            "dummyToken",
            parsedMarketIDs[0],
            mandatoryParams,
            optionalParams
          )

          const dashboardData2 = await fetchDashboardData(
            "dummyToken",
            parsedMarketIDs_2[0],
            mandatoryParams_2,
            optionalParams_2
          )

          return json({
            graphData: dashboardData.chartData,
            contextType: context,
            graphData2: dashboardData2.chartData,
            tableData: dashboardData.tableData,
            sourcesData: dashboardData.sources,
            availableYears: dashboardData.availableYears,
          })
        } else {
          return json({ error: "Missing second context data" }, { status: 400 })
        }
      } else {
        const dashboardData = await fetchDashboardData(
          "dummyToken",
          parsedMarketIDs[0],
          mandatoryParams,
          optionalParams
        )

        return json({
          graphData: dashboardData.chartData,
          contextType: context,
          graphData2: [],
          tableData: dashboardData.tableData,
          sourcesData: dashboardData.sources,
          availableYears: dashboardData.availableYears,
        })
      }
    } else {
      return json({ error: "Missing required fields" }, { status: 400 })
    }
  } catch (error) {
    console.error(`Error updating dashboard:`, error)
    return json({ error: `Error updating dashboard` }, { status: 500 })
  }
}

export function ErrorBoundary() {
  return <ErrorBoundaryComponent isMainRoute={true} />
}
