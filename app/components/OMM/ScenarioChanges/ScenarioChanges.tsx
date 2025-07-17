import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ExternalComponents/DropdownMenu/dropdown-menu"
import { ScenarioChangesProps } from "./type"
import { useFetcher, useNavigate, useNavigation } from "@remix-run/react"
import React, { useEffect, useMemo, useState } from "react"
import { faSliders } from "@fortawesome/free-solid-svg-icons"
import SingleSelection from "../../Shared/SingleSelection/SingleSelection"
import { Button } from "@/components/ui/Button/Button"
import { MarketData, Measure } from "@/components/OMM/types"
import { AnimatePresence, motion } from "framer-motion"
import { Skeleton } from "@/components/ui/Skeleton/Skeleton"
import { action } from "@/routes/omm.scenarioChanges"
import { useScenarioTableStore } from "@/store/omm"
import { CountryFlag } from "@/components/OMM/CountryFlag/CountryFlag"

const ScenarioChanges: React.FC<ScenarioChangesProps> = ({ markets }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const navigate = useNavigate()
  const navigation = useNavigation()
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null)
  const [selectedMeasure, setSelectedMeasure] = useState<string | null>(null)
  const [selectedMarket, setSelectedMarket] = useState<string | null>(null)
  const fetcher = useFetcher<typeof action>()
  const measureData = useScenarioTableStore((state) => state.scenarioData)

  const handleMarketChange = (marketId: string | null) => {
    setSelectedMarket(marketId)
    setSelectedGroup(null)
    setSelectedMeasure(null)

    if (marketId) {
      fetcher.submit(
        { marketId },
        { method: "post", action: "/omm/scenarioChanges" }
      )
    }
  }

  useEffect(() => {
    setSelectedMeasure(null)
    setSelectedGroup(null)
    setSelectedMarket(null)
  }, [navigation.location?.pathname])

  const measureGroups = useMemo(() => {
    return fetcher.data?.measures
      ? Array.from(new Set(fetcher.data.measures.map((m: Measure) => m.group)))
      : []
  }, [fetcher.data?.measures])

  const filteredMeasures = useMemo(() => {
    if (!selectedGroup || !fetcher.data?.measures.length) return []
    return fetcher.data.measures
      .filter((measure) => measure.group === selectedGroup)
      .map((measure) => ({
        value: measure.measure_name,
        label: measure.display_name,
      }))
  }, [selectedGroup, fetcher.data?.measures])

  const marketOptions = useMemo(() => {
    return markets?.map((market: MarketData) => ({
      value: String(market.market_id),
      label: (
        <section className={"flex gap-2 items-center"}>
          <CountryFlag countryCode={market.code} className="mb-1" />
          {String(market.market)}
        </section>
      ),
    }))
  }, [markets])

  const loading = fetcher.state === "submitting" || fetcher.state === "loading"
  const scenarioChangePaths = [
    "assistant",
    "monthly",
    "ban",
    "npd",
    "brandLaunch",
  ]

  const buildUrl = (group: string, measure: string) => {
    const fetcherData = fetcher.data?.measures
    if (!fetcherData) return ""
    const chosenMeasure = fetcherData.find(
      (m: Measure) => m.group === group && m.measure_name === measure
    )
    const granularity = chosenMeasure?.granularity.endsWith("_level")
      ? chosenMeasure.granularity.split("_").slice(-2).join("_")
      : chosenMeasure?.granularity

    if (group === "Product Development") {
      return (
        `/omm/scenarios/${chosenMeasure?.measure_name.replace(/_./g, (match) => match[1].toUpperCase())}?market-id=${selectedMarket}` +
        (measureData?.scenario_id
          ? `&scenario-id=${measureData?.scenario_id}`
          : "&scenario-id=0")
      )
    } else
      return (
        `/omm/scenarios/${granularity}/monthly/${chosenMeasure?.measure_name}?market-id=${selectedMarket}` +
        (measureData?.scenario_id
          ? `&scenario-id=${measureData?.scenario_id}`
          : "&scenario-id=0")
      )
  }

  return (
    <DropdownMenu
      modal={false}
      onOpenChange={(open) => {
        setIsDropdownOpen(open)
        if (!open) {
          setTimeout(() => {
            setSelectedMarket(null)
            setSelectedGroup(null)
            setSelectedMeasure(null)
          }, 150)
        }
      }}
    >
      <DropdownMenuTrigger asChild>
        <Button
          variant={"outline"}
          isLoading={
            navigation.state === "loading" &&
            scenarioChangePaths.some((path) =>
              navigation.location.pathname?.includes(path)
            )
          }
          icon={faSliders}
          disabled={navigation.state === "loading"}
          className={`z-10 flex input-focus gap-1 justify-content items-center !font-normal self-end px-10 py-2 mt-1.5
            text-secondary border !border-secondary rounded-xs hover:!border-primary
            dark:!border-white dark:text-white  dark:hover:text-primary dark:hover:!border-primary
            focus-visible:outline-none hover:text-primary duration-150 transition-all
            ${isDropdownOpen && "bg-secondary !border-secondary hover:!text-white text-white dark:bg-primary dark:!border-primary"}`}
        >
          Scenario changes
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className={`rounded-xs !p-0`} align="end">
        <main
          className={
            "p-8 bg-third dark:bg-primary-dark w-full flex flex-col items-center justify-center gap-5 min-w-[400px]"
          }
        >
          <SingleSelection
            handleValueChange={handleMarketChange}
            triggerClasses={"bg-white"}
            contentClasses={"bg-white"}
            placeholder="Select the market"
            options={marketOptions}
          />
          <div className="w-full">
            <AnimatePresence mode={"wait"}>
              {loading ? (
                <Skeleton className="h-[45px] !rounded-xs w-full" />
              ) : (
                selectedMarket &&
                measureGroups.length > 0 && (
                  <motion.div
                    key={selectedMarket}
                    layout
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <SingleSelection
                      handleValueChange={setSelectedGroup}
                      placeholder="Select the measure"
                      triggerClasses={"bg-white"}
                      contentClasses={"bg-white"}
                      options={measureGroups?.map((group: string) => ({
                        value: group,
                        label: group,
                      }))}
                    />
                  </motion.div>
                )
              )}
            </AnimatePresence>
          </div>
          <div className="w-full">
            <AnimatePresence mode={"wait"}>
              {selectedGroup && filteredMeasures.length > 0 && (
                <motion.div
                  key={selectedMarket + selectedGroup}
                  layout
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <SingleSelection
                    handleValueChange={setSelectedMeasure}
                    placeholder="Types / Groups"
                    triggerClasses={"bg-white"}
                    contentClasses={"bg-white"}
                    options={filteredMeasures}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <div className="flex justify-between gap-3 w-full">
            <DropdownMenuItem className={"flex-1 !px-0"}>
              <Button
                variant={"outline"}
                onClick={() => {
                  navigate(
                    `/omm/scenarios/assistant?market-id=${selectedMarket}` +
                      (measureData?.scenario_id
                        ? `&scenario-id=${measureData?.scenario_id}`
                        : "&scenario-id=0")
                  )
                }}
                disabled={!selectedMarket}
                className="!font-normal px-2 w-full text-secondary  border-secondary dark:text-white dark:border-white hover:text-primary hover:border-primary dark:hover:text-primary dark:hover:border-primary"
              >
                Scenario assistant
              </Button>
            </DropdownMenuItem>
            <DropdownMenuItem className={"flex-1 !px-0"}>
              <Button
                variant={"default"}
                onClick={() => {
                  selectedGroup &&
                    selectedMeasure &&
                    navigate(buildUrl(selectedGroup, selectedMeasure))
                }}
                className={"font-normal px-2 w-full"}
                disabled={!selectedGroup || !selectedMeasure}
              >
                Customize Indicator
              </Button>
            </DropdownMenuItem>
          </div>
        </main>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default ScenarioChanges
