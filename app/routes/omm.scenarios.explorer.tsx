import { requiredUserSession } from "@/data/auth/session.server"
import { getMenuVariables } from "@/data/menuvariables/menuvariables.server"
import type { LoaderFunctionArgs } from "@remix-run/node"
import { ErrorBoundaryComponent } from "@/components/ui/ErrorBoundaryComponent/ErrorBoundaryComponent"
import React from "react"
import { faCommentDots } from "@fortawesome/free-regular-svg-icons"
import ChatbarArea from "@/components/Layout/ChatbarArea/ChatbarArea"
import ChatBubble from "@/components/OMM/Chat/ChatBubble/ChatBubble"
import Modal from "@/components/Shared/Modal/Modal"
import { fetchAndExportFile, fetchMarket } from "@/data/omm/omm.server"
import { useLoaderData } from "@remix-run/react"
import { CountryFlag } from "@/components/OMM/CountryFlag/CountryFlag"

export default function OmmScenarioExplorer() {
  const { marketName, marketCode } = useLoaderData<typeof loader>()
  return (
    <Modal
      title={"Scenario Results Explorer"}
      icon={faCommentDots}
      size={"big"}
    >
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
        <section className="flex flex-col gap-2.5 mt-4 mb-8">
          <ChatBubble
            message={
              "Hello! I’m an assistant to help you to explore the detailed results of the scenario against the baseline. What would like to know?"
            }
            timestamp={new Date("2024-12-09T13:58:17.202Z")}
            variant={"assistant"}
          />
          <ChatBubble
            message={"What is the incidence of RMC in 2030?"}
            timestamp={new Date("2024-12-09T13:58:17.202Z")}
            variant={"user"}
          />
          <ChatBubble
            message={`
The JTI market share goes to zero from 2025 onward, as shown in the tables below:
            
| Company         | Share Increase (%) | Date       |
|-----------------|--------------------|------------|
| Apple           | 5.2%              | 2024-12-01 |
| Microsoft       | 4.8%              | 2024-12-01 |
| Google          | 6.3%              | 2024-12-01 |
| Amazon          | 3.9%              | 2024-12-01 |
| Tesla           | 7.5%              | 2024-12-01 |
            `}
            timestamp={new Date("2024-12-09T13:58:17.202Z")}
            variant={"assistant"}
          />
        </section>
      </main>

      <ChatbarArea
        variant="omm"
        handlePromptSubmit={() => {}}
        // disabled={isLoading}
        placeholder="Message assistant..."
      />
    </Modal>
  )
}

export async function loader({ request }: LoaderFunctionArgs) {
  await requiredUserSession(request)
  const envVar = await getMenuVariables()
  const url = new URL(request.url)
  const marketId = url.searchParams.get("market-id")
  if (!marketId) throw new Error("Market ID is required")

  const { market, code } = await fetchMarket("", marketId)

  return { marketName: market, marketCode: code, envVar }
}

export async function action({ request }: LoaderFunctionArgs) {
  const formData = await request.formData()
  const marketIds = formData.get("marketId") as string
  const companies = formData.get("companies") as string
  const products = formData.get("products") as string
  const period = formData.get("period") as string
  const intent = formData.get("intent") as string
  const year = formData.get("year") as string

  if (!marketIds) throw new Error("Market ID is required")

  if (intent === "export") {
    const { file, fileType, fileName } = await fetchAndExportFile(
      marketIds,
      companies,
      products,
      period,
      year ?? ""
    )
    return { file, fileType, fileName }
  }
}

export function ErrorBoundary() {
  return (
    <Modal title={"Explorer Error"} icon={faCommentDots}>
      <ErrorBoundaryComponent isMainRoute={false} />
    </Modal>
  )
}
