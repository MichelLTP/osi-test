import React from "react"
import {
  faMagnifyingGlass,
  faTrashCan,
} from "@fortawesome/free-solid-svg-icons"
import { CountryFlag } from "@/components/OMM/CountryFlag/CountryFlag"
import { ScenarioChangesBubbleProps } from "@/components/OMM/ScenarioChangeBubble/types"
import { useNavigate } from "@remix-run/react"
import DropdownContent from "@/components/ui/DropdownContent/DropdownContent"

const ScenarioChangeBubble = ({
  countryCode,
  text,
  navigateTo,
  navigationState,
  removeChange,
}: ScenarioChangesBubbleProps): React.ReactNode => {
  const navigate = useNavigate()

  if (countryCode === undefined) return <></>
  if (countryCode.length !== 2) return <></>

  return (
    <article className="rounded-sm bg-primary/10 dark:bg-secondary-dark flex flex-col p-4 gap-2 text-xs">
      <DropdownContent
        yOffset={-8}
        items={[
          {
            text: "View More",
            action: () =>
              navigate(
                navigateTo,
                navigationState ? { state: navigationState } : undefined
              ),
            icon: faMagnifyingGlass,
            showSpinner: true,
          },
          {
            text: "Remove",
            action: () => removeChange(),
            icon: faTrashCan,
            danger: true,
          },
        ]}
      />
      <div className={"flex items-start gap-2 text-pretty -mt-2 pb-2 px-2"}>
        <CountryFlag countryCode={countryCode} />
        <p>{text}</p>
      </div>
    </article>
  )
}
export default ScenarioChangeBubble
