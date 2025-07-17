import { requiredUserSession } from "@/data/auth/session.server"
import { getMenuVariables } from "@/data/menuvariables/menuvariables.server"
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node"
import {
  json,
  Outlet,
  ShouldRevalidateFunction,
  useFetcher,
  useLoaderData,
  useNavigate,
  useNavigation,
} from "@remix-run/react"
import { ErrorBoundaryComponent } from "@/components/ui/ErrorBoundaryComponent/ErrorBoundaryComponent"
import { Button } from "@/components/ui/Button/Button"
import { faCheck, faList, faTrashCan } from "@fortawesome/free-solid-svg-icons"
import Modal from "@/components/Shared/Modal/Modal"
import { useScenarioTableStore } from "@/store/omm"
import {
  fetchMarket,
  getMeasureDisplayName,
  saveMonthlyScenarioData,
  updateScenarioName,
} from "@/data/omm/omm.server"
import React, { useEffect } from "react"
import { CountryFlag } from "@/components/OMM/CountryFlag/CountryFlag"
import ConfirmationPopover from "@/components/Shared/ConfirmationPopover/ConfirmationPopover"

export default function OmmMarketDrivers() {
  const navigate = useNavigate()
  const navigation = useNavigation()
  const { driverLabel, marketName, marketCode } = useLoaderData<typeof loader>()
  const {
    scenarioData,
    handleScenarioSelection,
    handleScenarioId,
    discardMonthlyData,
    monthlyData,
  } = useScenarioTableStore()
  const fetcher = useFetcher<typeof action>()

  const handleDiscard = () => {
    discardMonthlyData()
  }

  const saveScenarioChanges = () => {
    const scenario_name = scenarioData.scenario_name
    fetcher.submit(
      {
        intent: "save",
        data: JSON.stringify({ ...monthlyData, scenario_name }),
      },
      { method: "POST" }
    )
  }

  useEffect(() => {
    if (fetcher.data) {
      if (scenarioData.scenario_name)
        handleScenarioSelection(
          fetcher.data.scenarioId,
          scenarioData.scenario_name
        )
      else handleScenarioId(fetcher.data.scenarioId)
      navigate("/omm/scenarios?scenario-id=" + fetcher.data.scenarioId)
    }
  }, [fetcher.data, handleScenarioSelection])

  const isDisabled =
    Object.keys(monthlyData).length <= 0 ||
    navigation.state === "loading" ||
    fetcher.state === "submitting"

  return (
    <Modal title={driverLabel + " Changes"} icon={faList} size={"big"}>
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
          <Outlet />

          <footer className="flex flex-wrap gap-4 mt-8 justify-end">
            <ConfirmationPopover
              onConfirm={() => handleDiscard()}
              confirmationHeader={"Do you want to discard all your changes?"}
              direction={"top"}
              align={"center"}
              buttonAction={"Discard"}
            >
              <Button
                variant={"outline"}
                type={"button"}
                className={
                  "!inline !text-error !border-error hover:!border-secondary hover:!text-secondary hover:dark:!border-white hover:dark:!text-white"
                }
                icon={faTrashCan}
                disabled={isDisabled}
                name="intent"
                value="reset"
              >
                Discard
              </Button>
            </ConfirmationPopover>
            <Button
              type={"button"}
              icon={faCheck}
              isLoading={fetcher.state === "submitting"}
              disabled={isDisabled}
              onClick={() => {
                saveScenarioChanges()
              }}
              name="intent"
              value="save"
            >
              Confirm
            </Button>
          </footer>
        </div>
      </main>
    </Modal>
  )
}

export async function loader({ request, params }: LoaderFunctionArgs) {
  await requiredUserSession(request)
  const envVar = await getMenuVariables()

  const { driver } = params
  if (!driver) throw new Response("Missing Market Driver!", { status: 400 })

  const url = new URL(request.url)
  const urlParams = new URLSearchParams(url.search)
  const marketId = urlParams.get("market-id")
  if (!marketId) throw new Response("Missing Market ID!", { status: 400 })
  const { market, code } = await fetchMarket("", marketId)
  let driverLabel

  if (driver === "change") {
    driverLabel = "Scenario"
  } else {
    driverLabel = await getMeasureDisplayName(driver, marketId)
  }

  return { envVar, driverLabel, marketName: market, marketCode: code }
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData()
  const { intent, ...values } = Object.fromEntries(formData)
  const url = new URL(request.url)
  const urlParams = new URLSearchParams(url.search)
  const scenario_id = urlParams.get("scenario-id") ?? 0

  switch (intent) {
    case "save": {
      const data: FormDataEntryValue = values["data"]
      const parsed = JSON.parse(data as string)
      const scenarioId = await saveMonthlyScenarioData(
        parsed,
        Number(scenario_id)
      )
      await updateScenarioName(scenarioId.scenario_id, parsed.scenario_name)
      return json({ status: 200, scenarioId: scenarioId.scenario_id })
    }
    default: {
      throw new Response("Unknown intent", { status: 400 })
    }
  }
}

export function ErrorBoundary() {
  return (
    <Modal title={"Market Drivers Error"} icon={faList}>
      <ErrorBoundaryComponent isMainRoute={false} />
    </Modal>
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
