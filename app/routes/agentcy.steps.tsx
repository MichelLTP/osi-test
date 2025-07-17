import React from "react"
import { ErrorBoundaryComponent } from "@/components/ui/ErrorBoundaryComponent/ErrorBoundaryComponent"
import { Outlet, useLocation, useNavigate } from "@remix-run/react"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
} from "@/components/ExternalComponents/Pagination/pagination"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons"
import { IconProp } from "@fortawesome/fontawesome-svg-core"
import { useAgentcy } from "@/store/agentcy"

const AgentcySteps_index = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const getCurrentStep = () =>
    parseInt(location.pathname.split("/").pop() || "1")
  const { activeOptions } = useAgentcy()

  const handleNextStep = () => {
    const nextStep = getCurrentStep() + 1
    navigate(`/agentcy/steps/${nextStep}`)
  }

  const handlePreviousStep = () => {
    const previousStep = getCurrentStep() - 1
    navigate(previousStep < 1 ? `/agentcy` : `/agentcy/steps/${previousStep}`)
  }

  const paginationItems = [
    {
      icon: faChevronLeft,
      label: "Previous Step",
      iconFirst: true,
      navigate: handlePreviousStep,
      disabled: false,
    },
    {
      icon: faChevronRight,
      label: "Next Step",
      iconFirst: false,
      navigate: handleNextStep,
      disabled:
        (getCurrentStep() === 1 && activeOptions.managementTeam === "") ||
        (getCurrentStep() === 2 && activeOptions.hiringMethod === "") ||
        (getCurrentStep() === 3 && activeOptions.team.length === 0),
    },
  ]

  return (
    <>
      <Outlet />
      <Pagination>
        <PaginationContent className="flex w-full justify-between mb-6">
          {paginationItems
            .filter(
              (item) => !(item.label === "Next Step" && getCurrentStep() === 4)
            )
            .map((item, index) => (
              <PaginationItem
                key={index}
                className="flex items-center gap-2"
                onClick={() => !item.disabled && item.navigate()}
              >
                <PaginationLink
                  className={`text-sm !text-primary flex items-center justify-center cursor-pointer gap-2 hover:opacity-80 ${item.disabled ? "pointer-events-none opacity-50" : ""}`}
                >
                  {item.iconFirst && (
                    <FontAwesomeIcon
                      icon={item.icon as IconProp}
                      className="text-primary"
                      size={"sm"}
                    />
                  )}
                  <span>{item.label}</span>
                  {!item.iconFirst && (
                    <FontAwesomeIcon
                      icon={item.icon as IconProp}
                      className="text-primary"
                      size={"sm"}
                    />
                  )}
                </PaginationLink>
              </PaginationItem>
            ))}
        </PaginationContent>
      </Pagination>
    </>
  )
}

export default AgentcySteps_index

export function ErrorBoundary() {
  return <ErrorBoundaryComponent isMainRoute={false} />
}
