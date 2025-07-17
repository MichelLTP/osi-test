import { requiredUserSession } from "@/data/auth/session.server"
import { getMenuVariables } from "@/data/menuvariables/menuvariables.server"
import type { LoaderFunctionArgs } from "@remix-run/node"
import { json, useLoaderData, useNavigate } from "@remix-run/react"
import { ErrorBoundaryComponent } from "@/components/ui/ErrorBoundaryComponent/ErrorBoundaryComponent"
import { faList } from "@fortawesome/free-solid-svg-icons"
import React from "react"
import DynamicDataTable from "@/components/ui/DynamicDataTable/DynamicDataTable"
import Modal from "@/components/Shared/Modal/Modal"
import { fetchScenarios } from "@/data/omm/omm.server"
import { format } from "date-fns"
import { BaseScenario } from "@/components/OMM/types"
import { useScenarioTableStore } from "@/store/omm"

export default function OmmScenarioList() {
  const { scenarios } = useLoaderData<typeof loader>()
  const { handleScenarioSelection } = useScenarioTableStore()
  const navigate = useNavigate()
  const [rowsPerPage, setRowsPerPage] = React.useState(8)

  React.useEffect(() => {
    const calculateRowsPerPage = () => {
      const viewportHeight = window.innerHeight
      const rowHeight = 48
      const offset = 300

      const usableHeight = viewportHeight - offset
      const estimatedRows = Math.floor(usableHeight / rowHeight)

      if (estimatedRows > 0) {
        setRowsPerPage(estimatedRows)
      }
    }

    calculateRowsPerPage()
    window.addEventListener("resize", calculateRowsPerPage)
    return () => window.removeEventListener("resize", calculateRowsPerPage)
  }, [])

  if (!scenarios || scenarios.length === 0) {
    return (
      <Modal title={"Scenario List"} icon={faList}>
        <ErrorBoundaryComponent isMainRoute={false} />
      </Modal>
    )
  }

  const sortedScenarios = [...scenarios]
    .filter((scenario) => !scenario.is_deleted)
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )

  const tableData = {
    header: ["Name", "Created Date", "Created By", "Status", "Markets"],
    values: [
      sortedScenarios.map((scenario) => scenario.scenario_id || 0),
      sortedScenarios.map((scenario) => scenario.scenario_name || "N/A"),
      sortedScenarios.map(
        (scenario) =>
          format(new Date(scenario.created_at), "yyyy-MM-dd") || "N/A"
      ),
      sortedScenarios.map((scenario) => scenario.created_by || "N/A"),
      sortedScenarios.map((scenario) => scenario.status || "N/A"),
      sortedScenarios.map((scenario) => scenario.markets || "N/A"),
    ],
  }
  const onScenarioSelect = (
    scenarioID: string | number | null,
    scenarioName: string | number | null
  ) => {
    if (scenarioID && scenarioName !== null) {
      const id =
        typeof scenarioID === "string" ? parseInt(scenarioID) : scenarioID
      const name = scenarioName.toString()

      if (isNaN(id)) {
        console.error("Invalid Scenario ID")
        return
      }

      handleScenarioSelection(id, name)
      navigate("/omm/scenarios?scenario-id=" + id.toString())
    } else {
      console.error("Scenario Name or Scenario ID is null")
    }
  }

  return (
    <Modal title={"Scenario List"} icon={faList} size={"big"}>
      <section className="min-h-[60vh]  overflow-auto custom-scrollbar dark-scrollbar pr-2 -mr-2 my-4">
        <DynamicDataTable
          variant={"omm-custom"}
          tableData={{
            body: JSON.stringify(tableData),
          }}
          onRowClick={onScenarioSelect}
          isClickable={true}
          hasPagination={true}
          rowsPerPage={rowsPerPage}
        />
      </section>
    </Modal>
  )
}

export async function loader({ request }: LoaderFunctionArgs) {
  const token = await requiredUserSession(request)
  const envVar = await getMenuVariables()

  let scenarios: BaseScenario[]
  try {
    scenarios = await fetchScenarios(token)
  } catch (error: unknown) {
    scenarios = []
  }
  return json({ scenarios, envVar })
}

export function ErrorBoundary() {
  return <ErrorBoundaryComponent isMainRoute={false} />
}
