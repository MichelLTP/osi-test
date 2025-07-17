import { requiredUserSession } from "@/data/auth/session.server"
import { getMenuVariables } from "@/data/menuvariables/menuvariables.server"
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node"
import { AnimatePresence, motion } from "framer-motion"
import {
  Outlet,
  Form,
  json,
  useNavigation,
  useNavigate,
  useLoaderData,
  useSearchParams,
  useLocation,
} from "@remix-run/react"
import { ErrorBoundaryComponent } from "@/components/ui/ErrorBoundaryComponent/ErrorBoundaryComponent"
import {
  faFloppyDisk,
  faList,
  faPlay,
  faTrashCan,
  faUndo,
  faPlus,
} from "@fortawesome/free-solid-svg-icons"
import { Button } from "@/components/ui/Button/Button"
import { Input } from "@/components/ui/Input/Input"
import { Label } from "@/components/ui/Label/Label"
import ScenarioChangeBubble from "@/components/OMM/ScenarioChangeBubble/ScenarioChangeBubble"
import React, { useCallback, useEffect } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { useScenarioTableStore } from "@/store/omm"
import {
  deleteScenario,
  deleteScenarioChangesBubble,
  duplicateScenario,
  fetchScenarioBubbles,
  generateScenario,
  resetScenario,
  saveScenario,
} from "@/data/omm/omm.server"
import DropdownContent from "@/components/ui/DropdownContent/DropdownContent"
import { faCopy } from "@fortawesome/free-regular-svg-icons"
import Modal from "@/components/Shared/Modal/Modal"
import { faExclamationCircle } from "@fortawesome/free-solid-svg-icons/faExclamationCircle"
import { Toaster } from "@/components/ui/Toast/Toaster"
import { LoadingComponent } from "@/components/Layout/LoadingComponent/LoadingComponent"
import useOmmScenarioManager from "@/hooks/useOmmScenarioManager"
import { Loader2 } from "lucide-react"

export default function OmmScenarios() {
  const navigation = useNavigation()
  const location = useLocation()
  const navigate = useNavigate()
  const {
    handleScenarioName,
    scenarioData,
    resetData,
    handleScenarioSelection,
  } = useScenarioTableStore()
  const { bubbles } = useLoaderData<typeof loader>() || {}
  const [searchParams, setSearchParams] = useSearchParams()
  const {
    scenarioName,
    setScenarioName,
    removeSpecificChanges,
    confirmationModal,
    setConfirmationModal,
    handleScenarioGeneration,
    duplicateScenarioChanges,
    saveScenarioChanges,
    removeScenarioChanges,
  } = useOmmScenarioManager({ bubbles, setSearchParams })
  const [isGenerating, setIsGenerating] = React.useState(false)
  useEffect(() => {
    const scenarioId = searchParams.get("scenario-id")
    if (scenarioId) handleScenarioSelection(Number(scenarioId), scenarioName)
  }, [searchParams])

  const generateChanges = useCallback(() => {
    if (!bubbles?.bubbles_data?.length) return "No changes found"
    if (navigation && navigation.location?.pathname === "/omm/scenarios/list")
      return null

    return bubbles?.bubbles_data?.map((bubble) => {
      const level =
        bubble.product_hier_id !== "Null"
          ? bubble.company_hier_id !== "Null"
            ? "company_level"
            : "product_level"
          : "market_level"

      const url = (() => {
        switch (bubble.change_type) {
          case "Default":
            return `/omm/scenarios/${level}/monthly/change?scenario-change-id=${bubble.scenario_change_id}&market-id=${bubble.market_id}&scenario-id=${scenarioData?.scenario_id}`
          case "Brand Launch":
            return `/omm/scenarios/brandLaunch?scenario-id=${bubbles?.scenario_id}&scenario-change-id=${bubble.scenario_change_id}&market-id=${bubble.market_id}`
          case "NPD":
            return `/omm/scenarios/npd?scenario-id=${bubbles?.scenario_id}&scenario-change-id=${bubble.scenario_change_id}&market-id=${bubble.market_id}`
          case "Ban":
            return `/omm/scenarios/ban?scenario-id=${bubbles?.scenario_id}&scenario-change-id=${bubble.scenario_change_id}&market-id=${bubble.market_id}`
          default:
            return ""
        }
      })()

      return (
        <motion.div
          key={level + bubble.scenario_change_id + bubble.code}
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 5 }}
          transition={{
            duration: 0.4,
            ease: "easeOut",
          }}
        >
          <ScenarioChangeBubble
            countryCode={bubble.code.toLowerCase()}
            text={bubble.change_description || "Scenario changed"}
            navigateTo={url}
            removeChange={() =>
              setConfirmationModal({
                open: true,
                action: "delete-bubble",
                extraInfo: {
                  id: bubble.scenario_change_id,
                  description: bubble.change_description,
                },
              })
            }
          />
        </motion.div>
      )
    })
  }, [bubbles, scenarioData.scenario_id])

  useEffect(() => {
    if (
      isGenerating &&
      navigation.state === "idle" &&
      bubbles?.status === "Generated"
    ) {
      setTimeout(() => setIsGenerating(false), 300)
    }
  }, [navigation.state, bubbles?.status])

  return (
    <>
      <Toaster />
      {confirmationModal.open && (
        <Modal
          title={
            confirmationModal.action === "reset"
              ? "Reset Scenario"
              : confirmationModal.action === "delete"
                ? "Delete Scenario"
                : "Delete Scenario Change"
          }
          size={"small"}
          icon={faExclamationCircle}
          handleClose={() =>
            setConfirmationModal({ open: false, action: null })
          }
          variant={"confirmation"}
          confirmationProps={{
            actionText:
              confirmationModal.action === "reset"
                ? "Reset Scenario"
                : confirmationModal.action === "delete"
                  ? "Delete Scenario"
                  : "Delete Change",
            handleAction: () =>
              confirmationModal.action &&
              (confirmationModal.action === "delete-bubble"
                ? removeSpecificChanges(confirmationModal.extraInfo.id ?? null)
                : removeScenarioChanges(confirmationModal.action)),
          }}
          hasCancel
        >
          <p className={"mb-12 mt-4"}>
            {confirmationModal.extraInfo ? (
              <>
                Are you sure you want to delete the scenario change{" "}
                <strong>{confirmationModal.extraInfo.description}</strong>?
              </>
            ) : (
              <>
                Are you sure you want to{" "}
                {confirmationModal.action === "reset" ? "reset" : "delete"} the
                scenario <strong>{scenarioName}</strong>?
              </>
            )}
          </p>
        </Modal>
      )}
      <AnimatePresence mode="wait">
        <Outlet />
      </AnimatePresence>
      <aside
        className={
          "bg-secondary/5 dark:bg-secondary-dark w-[21rem] px-6 py-4 flex h-screen flex-col gap-4 sticky top-0"
        }
      >
        <h3 className={"text-basebold text-secondary dark:text-white"}>
          Scenario Summary
        </h3>

        <Button
          className={
            "!w-full !font-normal !px-0 my-1 !min-h-[38.5px] border-secondary text-secondary " +
            "dark:border-white dark:text-white hover:text-primary hover:border-primary dark:hover:text-primary " +
            "dark:hover:border-primary"
          }
          variant={"outline"}
          icon={faList}
          isLoading={
            navigation.state === "loading" &&
            navigation.location.pathname === "/omm/scenarios/list"
          }
          disabled={
            navigation.state === "loading" &&
            navigation.location.pathname === "/omm/scenarios/list"
          }
          onClick={() =>
            navigate("/omm/scenarios/list" + (location.search || ""))
          }
        >
          Select existing scenario
        </Button>
        <Button
          className={"!w-full !font-normal"}
          variant={"outline"}
          name="intent"
          onClick={() => {
            resetData()
            setScenarioName("")
            setSearchParams((prev) => {
              prev.set("scenario-id", "0")
              return prev
            })
          }}
        >
          <FontAwesomeIcon
            icon={faPlus}
            className={"mr-2 mt-0.5 w-[12px] h-[12px]"}
          />
          New scenario
        </Button>
        <AnimatePresence>
          {searchParams.get("scenario-id") && (
            <Form
              className="max-w-full overflow-y-auto mt-2 p-6 bg-white dark:bg-primary-dark rounded-sm flex flex-col flex-1 gap-6 text-secondary dark:text-white"
              method={"POST"}
              navigate={false}
            >
              <DropdownContent
                yOffset={-4}
                direction={"bottom"}
                items={[
                  {
                    text: "Duplicate Scenario",
                    action: () => duplicateScenarioChanges(),
                    icon: faCopy,
                    disabled:
                      scenarioData?.scenario_id === 0 ||
                      !scenarioData?.scenario_id ||
                      navigation.state === "loading" ||
                      !bubbles?.bubbles_data?.length,
                  },
                  {
                    text: "Reset Scenario",
                    action: () =>
                      setConfirmationModal({ open: true, action: "reset" }),
                    icon: faUndo,
                    disabled:
                      scenarioData?.scenario_id === 0 ||
                      navigation.state === "loading" ||
                      !bubbles?.bubbles_data?.length,
                  },
                  {
                    text: "Save Scenario",
                    action: () => saveScenarioChanges(),
                    icon: faFloppyDisk,
                    disabled:
                      navigation.state === "loading" ||
                      !bubbles?.bubbles_data?.length,
                  },
                  {
                    text: "Delete Scenario",
                    action: () =>
                      setConfirmationModal({ open: true, action: "delete" }),
                    icon: faTrashCan,
                    danger: true,
                    disabled:
                      scenarioData?.scenario_id === 0 ||
                      navigation.state === "loading",
                  },
                ]}
              />
              <section className={"-mt-10"}>
                <Label
                  htmlFor={"scenario-name"}
                  className={"!text-smbold mb-4"}
                >
                  Scenario name
                </Label>
                <Input
                  className="mt-2 rounded-xs dark:bg-secondary-dark dark:text-white outline-none border border-transparent input-focus bg-secondary/5"
                  type="text"
                  name="scenario-name"
                  id="scenario-name"
                  placeholder="Insert scenario name..."
                  value={scenarioName}
                  onChange={(e) => setScenarioName(e.target.value)}
                  onBlur={() => handleScenarioName(scenarioName)}
                />
              </section>

              <section>
                <h4 className={"text-smbold"}>Scenario status</h4>
                {isGenerating ? (
                  <p
                    className={
                      "text-sm text-primary flex gap-2 items-center mt-4"
                    }
                  >
                    <Loader2 className={"animate-spin"} />
                    Generating scenario...
                  </p>
                ) : (
                  <p
                    className={`${bubbles?.status === "Saved" || bubbles?.status === "Generated" ? "text-success" : "text-[#FF9500]"} text-sm`}
                  >
                    {bubbles?.status ?? "Empty"}
                  </p>
                )}
              </section>

              <section
                className={
                  "-mr-2 overflow-y-auto custom-scrollbar dark-scrollbar"
                }
              >
                <h4 className={"text-smbold mb-2"}>Scenario changes</h4>
                <motion.div
                  layout={"position"}
                  className={"grid gap-4 pr-2 overflow-hidden"}
                  animate={{ opacity: 1 }}
                  initial={{ opacity: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <AnimatePresence mode={"wait"}>
                    {searchParams.get("scenario-id") === "0" ? (
                      <p
                        key={searchParams.get("scenario-id")}
                        className={"text-sm"}
                      >
                        No changes have been made to this scenario yet. Click on{" "}
                        <strong>Scenario Changes</strong> to begin customizing
                        it.
                      </p>
                    ) : (
                      generateChanges()
                    )}
                    {navigation.state === "loading" &&
                      searchParams.get("scenario-id") !== "0" &&
                      searchParams.get("scenario-id") !== null &&
                      !bubbles?.bubbles_data?.length && (
                        <LoadingComponent variant={"scenario-bubbles"} />
                      )}
                  </AnimatePresence>
                </motion.div>
              </section>

              <section className="flex flex-col gap-4 mt-auto">
                <Button
                  className={"!w-full !font-normal"}
                  name="intent"
                  onClick={() => {
                    handleScenarioGeneration()
                    setIsGenerating(true)
                  }}
                  value="generate"
                  isLoading={isGenerating}
                  disabled={
                    navigation.state === "loading" ||
                    isGenerating ||
                    !bubbles?.bubbles_data?.length ||
                    bubbles?.status === "Generated"
                  }
                  icon={faPlay}
                >
                  Generate scenario
                </Button>
              </section>
            </Form>
          )}
        </AnimatePresence>
      </aside>
    </>
  )
}

export async function loader({ request }: LoaderFunctionArgs) {
  const token = await requiredUserSession(request)
  const envVar = await getMenuVariables()

  const url = new URL(request.url)
  const scenarioId = url.searchParams.get("scenario-id")
  let bubbles

  if (scenarioId) {
    bubbles = await fetchScenarioBubbles(scenarioId)
  }
  return { envVar, bubbles: bubbles || null }
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData()
  const { intent, ...values } = Object.fromEntries(formData)

  switch (intent) {
    case "generate": {
      const scenarioId: FormDataEntryValue = values["scenarioId"]
      if (scenarioId) {
        console.log("Generating scenario with ID:", scenarioId)
        const res = await generateScenario(scenarioId as string)
        if (res) {
          console.log("Scenario generated successfully")
          return json({ status: 200, intent: "generate" })
        } else {
          console.error("Error generating scenario")
          return json({ status: 400 })
        }
      }
      return json({ status: 400 })
    }
    case "reset": {
      const scenarioId: FormDataEntryValue = values["scenario-id"]
      console.log("Resetting scenario with ID:", scenarioId)
      const res = await resetScenario(scenarioId as string)
      if (!res) {
        throw new Response("Failed to reset scenario", { status: 500 })
      }
      return json({ status: 200, intent: "reset" })
    }
    case "duplicate": {
      const scenarioId: FormDataEntryValue = values["scenario-id"]
      const newScenario: number = await duplicateScenario(scenarioId as string)
      return json({
        status: 200,
        newScenario: newScenario,
        intent: "duplicate",
      })
    }
    case "save": {
      const data: FormDataEntryValue = values["data"]
      const { scenario_name, scenario_id } = JSON.parse(data as string)
      await saveScenario(scenario_id, scenario_name)
      return json({ status: 200, intent: "save" })
    }
    case "delete": {
      const scenarioId: FormDataEntryValue = values["scenario-id"]
      console.log("Deleting scenario with ID:", scenarioId)
      await deleteScenario(scenarioId as string)
      return json({ status: 200, intent: "delete" })
    }
    case "removeBubble": {
      const scenarioChangeId: number = Number(values["scenario-change-id"])
      await deleteScenarioChangesBubble(scenarioChangeId)
      return json({ status: 200, intent: "removeBubble" })
    }
    default: {
      return json({ status: 400 })
    }
  }
}

export function ErrorBoundary() {
  return (
    <Modal title={"Error"} icon={faExclamationCircle}>
      <ErrorBoundaryComponent isMainRoute={false} />
    </Modal>
  )
}
