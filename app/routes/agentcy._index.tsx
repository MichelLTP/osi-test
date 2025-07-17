import React from "react"
import ChatbarArea from "@/components/Layout/ChatbarArea/ChatbarArea"
import { Button } from "@/components/ui/Button/Button"
import { faPlus } from "@fortawesome/free-solid-svg-icons"
import { useNavigate } from "@remix-run/react"
import { ErrorBoundaryComponent } from "@/components/ui/ErrorBoundaryComponent/ErrorBoundaryComponent"
import { useAgentcy } from "@/store/agentcy"

const AgentcyIndex = () => {
  const navigate = useNavigate()
  const { activeOptions, updateOption } = useAgentcy()

  const agents = ["Factual Search", "Hypothesis Testing", "Ideation"] as const
  const agentOptions = agents.map((label) => ({
    label,
    onClick: () => updateOption("agentcyParameter", label),
    icon: faPlus,
  }))

  return (
    <>
      <header>
        <h1
          className={
            "text-5xl text-secondary dark:text-white font-bold tracking-tight text-center"
          }
        >
          The Agent
          <span className="text-primary font-bold tracking-tight">cy</span>
        </h1>
        <p className="text-2xl leading-6">
          What can the Agentcy help you with?
        </p>
      </header>
      <main className={"w-full sm:w-[80%] flex flex-col gap-6"}>
        <ChatbarArea
          variant="agentcy"
          handlePromptSubmit={(prompt) => {
            updateOption("prompt", prompt)
            navigate("steps/1")
          }}
          disabled={false}
          placeholder="I want to find out if..."
        />
        <section className={"flex gap-4 flex-wrap"}>
          {agentOptions.map(({ icon, label, onClick }) => (
            <Button
              variant={
                activeOptions.agentcyParameter === label ? "default" : "outline"
              }
              icon={icon}
              className={"w-[200px] "}
              onClick={onClick}
              key={label + Math.random()}
            >
              {label}
            </Button>
          ))}
        </section>
      </main>
    </>
  )
}
export default AgentcyIndex

export function ErrorBoundary() {
  return <ErrorBoundaryComponent isMainRoute={false} />
}
