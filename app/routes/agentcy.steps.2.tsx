import React from "react"
import { ErrorBoundaryComponent } from "@/components/ui/ErrorBoundaryComponent/ErrorBoundaryComponent"
import { Button } from "@/components/ui/Button/Button"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { useAgentcy } from "@/store/agentcy"
import { faCogs } from "@fortawesome/free-solid-svg-icons/faCogs"
import { faWrench } from "@fortawesome/free-solid-svg-icons/faWrench"
import { AnimatePresence, motion } from "framer-motion"
import { IconProp } from "@fortawesome/fontawesome-svg-core"
import { faUsers } from "@fortawesome/free-solid-svg-icons"

const AgentcySteps2 = () => {
  const { activeOptions, updateOption } = useAgentcy()
  const [showInfo, setShowInfo] = React.useState(
    Array.from({ length: 3 }, () => false)
  )

  const handleShowInfo = (index: number) => {
    setShowInfo((prev) =>
      prev.map((value, i) => (i === index ? !value : value))
    )
  }

  const newAgentcies = [
    {
      title: "Custom Build",
      description:
        "Directly hire specialists, researchers, and content writers for tailored project needs and quality control.",
      icon: faWrench,
      onClick: () => updateOption("hiringMethod", "Custom"),
    },
    {
      title: "Auto Hire",
      description:
        "Turn the hiring process of specialists, researchers and content writers to your management team.",
      icon: faCogs,
      onClick: () => updateOption("hiringMethod", "Auto"),
    },
  ]

  const defaultAgentcies = [
    {
      title: "Consumer Centriq",
      description:
        "This agency focuses on consumer centricity, particularly talented in consumer surveys and web research.",
      icon: faUsers,
      onClick: () => updateOption("hiringMethod", "Consumer Centriq"),
      specialists: "Web Researcher, Survey Specialist",
      researchers: "Public Documents",
    },
    {
      title: "PeakPerform",
      description:
        "This agency focuses on performance analysis leverage data that looks at retail trends and future outlooks.",
      icon: faUsers,
      onClick: () => updateOption("hiringMethod", "PeakPerform"),
      specialists: "Retail Audit, One Market Model",
      researchers: "Public Documents",
    },
    {
      title: "OpenSearch",
      description:
        "This agency focuses on open-source desk research, such as web search and API search.",
      icon: faUsers,
      onClick: () => updateOption("hiringMethod", "OpenSearch"),
      specialists: "Web search APIs and Research APIs",
      researchers: "Public Documents",
    },
  ]

  return (
    <main className="text-left flex gap-6 flex-col">
      <h1 className="text-3xlbold">Time to hire your Agentcy</h1>

      <section className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {newAgentcies.map((item, index) => (
          <article
            key={item.title + index + "step2"}
            className={`h-full rounded-xs p-7 flex flex-col gap-6 border transition-[border] ${
              activeOptions.hiringMethod !== "" &&
              item.title.includes(activeOptions.hiringMethod)
                ? "border-primary bg-transparent"
                : "bg-third dark:bg-secondary-dark border-transparent"
            }`}
          >
            <header className="flex items-center gap-2">
              <FontAwesomeIcon icon={item.icon as IconProp} size="lg" />
              <h2 className="text-2xlbold">{item.title}</h2>
            </header>
            <p>{item.description}</p>
            <Button
              variant={
                activeOptions.hiringMethod !== "" &&
                item.title.includes(activeOptions.hiringMethod)
                  ? "default"
                  : "outline"
              }
              onClick={item.onClick}
              className="mt-auto px-0"
            >
              Hire {item.title} Agentcy
            </Button>
          </article>
        ))}
      </section>

      <h3 className="border-b-2 dark:border-third-dark pb-3">
        Existing Agentcies
      </h3>

      <motion.section className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12 items-start">
        {defaultAgentcies.map((item, index) => (
          <article
            key={item.title + index + "step2"}
            className={`rounded-xs p-7 min-h-80 flex flex-col gap-6 border transition-[border] ${
              activeOptions.hiringMethod === item.title
                ? "border-primary bg-transparent"
                : "bg-third dark:bg-secondary-dark border-transparent"
            }`}
          >
            <header className="flex items-center gap-2">
              <FontAwesomeIcon icon={item.icon as IconProp} size="lg" />
              <h2 className="text-2xlbold">{item.title}™</h2>
            </header>
            <p>{item.description}</p>

            <AnimatePresence>
              {showInfo[index] && (
                <motion.div
                  key="info"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="overflow-hidden flex flex-col gap-3"
                >
                  <h3 className="font-bold">Specialists:</h3>
                  <p>{item.specialists}</p>
                  <h3 className="font-bold">Researchers:</h3>
                  <p>{item.researchers}</p>
                </motion.div>
              )}
            </AnimatePresence>

            <Button
              variant={
                activeOptions.hiringMethod === item.title
                  ? "default"
                  : "outline"
              }
              onClick={item.onClick}
              className="mt-auto px-0"
            >
              Hire {item.title}™ Agentcy
            </Button>
            <Button
              variant="underline"
              className="ml-auto text-xs text-secondary dark:text-white"
              onClick={() => handleShowInfo(index)}
            >
              {showInfo[index] ? "Show less" : "Show more"}
            </Button>
          </article>
        ))}
      </motion.section>
    </main>
  )
}

export default AgentcySteps2

export function ErrorBoundary() {
  return <ErrorBoundaryComponent isMainRoute={false} />
}
