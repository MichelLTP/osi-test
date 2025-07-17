import { faChevronRight } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { useLocation } from "@remix-run/react"

{
  /* FIXME: Solução temporária para o Header não ter um uuid como titulo no Discovery Stories. I opted for props to not change any logic if possible */
}
const BreadCrumb = ({
  discoveryStoryTitle,
}: {
  discoveryStoryTitle?: string
  discoveryUuid?: string
}) => {
  const location = useLocation()
  const { pathname } = location
  let segments = pathname.split("/").filter((segment) => segment.trim() !== "")

  if (pathname.includes("searchSpaces/spaces")) {
    segments = segments.slice(0, segments.indexOf("spaces") + 1)
    segments[segments.indexOf("spaces")] = "My Space"
  }

  if (pathname.includes("searchSpaces/insights")) {
    segments = segments.slice(0, segments.indexOf("insights") + 1)
  }

  return (
    <nav className="flex flex-wrap">
      {segments.map((segment, index) => {
        let formattedSegment = segment.replace(/([a-z])([A-Z])/g, "$1 $2")
        formattedSegment = formattedSegment.replace(/_/g, " ") //remove underscore from OMM routing
        formattedSegment = formattedSegment.replace(/Si/g, "SI")
        if (formattedSegment.includes("QA")) formattedSegment = "Q&A"
        if (formattedSegment.includes("omm")) formattedSegment = "Simulator SI"
        if (formattedSegment.includes("scenarios"))
          formattedSegment = "Scenarios"
        if (discoveryStoryTitle && formattedSegment !== "discovery") {
          formattedSegment = discoveryStoryTitle ?? ""
        }
        if (formattedSegment.includes("response")) return
        return (
          <div
            key={segment}
            className="flex items-center align-middle justify-center text-sm pointer-events-none"
          >
            {index > 0 && formattedSegment !== "" && (
              <FontAwesomeIcon
                icon={faChevronRight}
                className="mx-3"
                size="2xs"
              />
            )}
            <span className="capitalize">{formattedSegment}</span>
          </div>
        )
      })}
    </nav>
  )
}

export default BreadCrumb
