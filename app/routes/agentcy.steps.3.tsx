import React, { useEffect } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  faCheck,
  faHammer,
  faSliders,
  faTrashCan,
} from "@fortawesome/free-solid-svg-icons"
import { IconProp } from "@fortawesome/fontawesome-svg-core"
import { Button } from "@/components/ui/Button/Button"
import Textarea from "@/components/ui/TextArea/TextArea"
import TeamSelector from "@/components/Agentcy/TeamSelector"
import TeamMemberAvatar from "@/components/Agentcy/TeamMemberAvatar"
import DropdownContent from "@/components/ui/DropdownContent/DropdownContent"
import { ErrorBoundaryComponent } from "@/components/ui/ErrorBoundaryComponent/ErrorBoundaryComponent"
import {
  specialists,
  researchers,
  contentWriters,
  specialistImages,
  researcherImages,
  contentWriterImages,
  specialistAnalysisStyles,
  contentWriterAnalysisStyles,
  specialistDetails,
  researcherDetails,
  contentWriterDetails,
  researcherAnalysisStyles,
  TEAM_TYPES,
} from "@/components/Agentcy/teamData"
import { useAgentcy } from "@/store/agentcy"
import { useCloseSidebar, useLoadingState } from "@/store/layout"
import type { ActiveMember, TeamMember } from "@/components/Agentcy/types"
import { AnimatePresence, motion } from "framer-motion"
import { clsx } from "clsx"
import { useFiltersStore } from "@/store/filters"
import { Filters } from "@/components/Shared/Filters/Filters"
import { useFetcher } from "@remix-run/react"
import { FetcherData } from "@/components/Shared/Filters/types"
import { ActionFunctionArgs, json } from "@remix-run/node"
import { requiredUserSession } from "@/data/auth/session.server"
import { createMetadataSearchFilters } from "@/data/searchsi/searchSi.server"
import { createMetadataSearchFilters_BEStructure } from "@/utils/metadataFilters"

const getListAndImages = (type: TeamMember["type"]) => {
  switch (type) {
    case "specialist":
      return { list: specialists, images: specialistImages }
    case "researcher":
      return { list: researchers, images: researcherImages }
    case "content writer":
      return { list: contentWriters, images: contentWriterImages }
  }
}

const getImageForMember = (
  type: TeamMember["type"],
  specialization: string
) => {
  const { list, images } = getListAndImages(type)
  const index = list.findIndex((item) => item === specialization)
  return images[index]
}

const getDetailsForMember = (
  type: TeamMember["type"],
  specialization: string
) => {
  if (type === "specialist") {
    return specialistDetails[specialization as keyof typeof specialistDetails]
  }
  if (type === "researcher") {
    return researcherDetails[specialization as keyof typeof researcherDetails]
  }
  if (type === "content writer") {
    return contentWriterDetails[
      specialization as keyof typeof contentWriterDetails
    ]
  }
  return { description: "", keyTools: [] }
}

const renderAnalysisStyleButtons = (
  styles:
    | typeof specialistAnalysisStyles
    | typeof contentWriterAnalysisStyles
    | typeof researcherAnalysisStyles,
  analysisStyle: TeamMember["analysisStyle"],
  setAnalysisStyle: (style: TeamMember["analysisStyle"]) => void,
  isAlreadyInTeam: boolean
) =>
  styles.map(({ title, icon, description }) => (
    <Button
      key={title}
      disabled={isAlreadyInTeam}
      variant={analysisStyle === title ? "default" : "outline"}
      className={clsx(
        "lg:min-w-[165px] text-left whitespace-normal flex flex-col justify-start h-full p-3 text-secondary font-normal dark:text-white text-sm border rounded-xs",
        analysisStyle === title && "text-white"
      )}
      onClick={() => setAnalysisStyle(title as TeamMember["analysisStyle"])}
    >
      <div className="flex flex-col xs:flex-row justify-center items-center gap-2 mb-2 mr-auto">
        <FontAwesomeIcon icon={icon as IconProp} size="lg" />
        <span className="text-basebold lg:text-xlbold">{title}</span>
      </div>
      <p>{description}</p>
    </Button>
  ))

const AgentcySteps3 = () => {
  const close = useCloseSidebar((state) => state.close)
  const { activeOptions, addTeamMember, removeTeamMember } = useAgentcy()
  const [showFilters, setShowFilters] = React.useState(false)
  const {
    isFiltersSelected,
    updatedFilterData,
    initialFiltersData,
    setInitialFiltersData,
    setUpdatedFilterData,
  } = useFiltersStore()
  const { setLoadingState } = useLoadingState()

  const fetcher = useFetcher<FetcherData>()
  const [activeMember, setActiveMember] = React.useState<ActiveMember>([
    "specialist",
    "RADRS",
  ])
  const [analysisStyle, setAnalysisStyle] =
    React.useState<TeamMember["analysisStyle"]>("Concise")
  const [instructions, setInstructions] = React.useState("")

  const isAlreadyInTeam = activeOptions.team.some(
    (t) => t.type === activeMember[0] && t.specialization === activeMember[1]
  )

  const layoutGridClass = !close
    ? "grid-cols-1 lg:grid-cols-[1fr_3fr] xl:!grid-cols-[1fr_2.8fr_1fr]"
    : "grid-cols-1 sm:grid-cols-[1fr_3fr] lg:grid-cols-[1fr_2.8fr_1fr]"

  const handleShowFilters = (value: boolean) => {
    setShowFilters(value)
    if (
      updatedFilterData === null ||
      Object.keys(updatedFilterData).length === 0
    )
      fetcher.load("/searchSi/metadataSearch?intent=filter")
  }

  useEffect(() => {
    if (fetcher.data?.filters && Object.keys(initialFiltersData).length === 0) {
      setUpdatedFilterData(fetcher.data?.filters)
      setInitialFiltersData(fetcher.data?.filters)
      setLoadingState(false)
    }
  }, [fetcher.data])

  return (
    <main className="w-full flex flex-col gap-6 mb-6">
      {showFilters && (
        <Filters
          filterData={updatedFilterData}
          setShowFilters={setShowFilters}
        />
      )}
      <header>
        <h1 className="text-3xlbold">
          Hire your specialists, researchers and content writers
        </h1>
      </header>

      <div className={`grid ${layoutGridClass} gap-8 w-full h-full`}>
        <section
          className={`flex gap-6 ${!close ? "flex-row lg:flex-col" : "flex-col xs:flex-row sm:!flex-col"}`}
        >
          {TEAM_TYPES.map((team) => (
            <TeamSelector
              key={team.type}
              title={team.title}
              members={team.members}
              images={team.images}
              type={team.type}
              activeMember={activeMember}
              setActiveMember={(member) => {
                setActiveMember(member)
                setAnalysisStyle(
                  team.type === "content writer"
                    ? contentWriterAnalysisStyles[0].title
                    : team.type === "specialist"
                      ? specialistAnalysisStyles[0].title
                      : researcherAnalysisStyles[0].title
                )
              }}
              team={activeOptions.team}
            />
          ))}
        </section>

        <section className="flex flex-col gap-6">
          <article className="grid grid-cols-2 gap-6 sm:mt-8">
            <div className="rounded-xs aspect-square flex items-center justify-center overflow-hidden xs:mt-auto">
              {activeMember && (
                <img
                  src={getImageForMember(activeMember[0], activeMember[1])}
                  alt={activeMember[1]}
                  className="object-cover w-full h-full"
                />
              )}
            </div>
            <div className="flex flex-col gap-6">
              <div>
                <p className="text-primary">Specialization</p>
                <h3 className="font-bold">{activeMember[1]}</h3>
              </div>
              <p>
                {
                  getDetailsForMember(activeMember[0], activeMember[1])
                    ?.description
                }
              </p>
              <div>
                <p className="text-primary">Key Tools</p>
                <ul className="mt-3 space-y-2 pl-4">
                  {getDetailsForMember(
                    activeMember[0],
                    activeMember[1]
                  )?.keyTools.map((skill: string, i: number) => (
                    <li key={i} className="flex items-center gap-2">
                      <FontAwesomeIcon icon={faHammer as IconProp} />
                      <span>{skill}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <Textarea
                placeholder="Add some instructions..."
                value={instructions}
                disabled={isAlreadyInTeam}
                id="instructions"
                name="instructions"
                rows={2}
                className="dark:bg-secondary-dark dark:text-white"
                onChange={(e) => setInstructions(e.target.value)}
              />
            </div>
          </article>

          <div className="flex flex-col gap-4">
            <h2 className="text-xlbold">Select analysis style</h2>
            <div className="grid grid-cols-3 gap-2">
              {activeMember[0] === "content writer"
                ? renderAnalysisStyleButtons(
                    contentWriterAnalysisStyles,
                    analysisStyle,
                    setAnalysisStyle,
                    isAlreadyInTeam
                  )
                : activeMember[0] === "specialist"
                  ? renderAnalysisStyleButtons(
                      specialistAnalysisStyles,
                      analysisStyle,
                      setAnalysisStyle,
                      isAlreadyInTeam
                    )
                  : renderAnalysisStyleButtons(
                      researcherAnalysisStyles,
                      analysisStyle,
                      setAnalysisStyle,
                      isAlreadyInTeam
                    )}
            </div>
            <div className="flex justify-end gap-2 mt-6">
              {activeMember[0] === "researcher" && (
                <Button
                  className="gap-2"
                  variant="outline"
                  onClick={() => {
                    handleShowFilters(true)
                    Object.keys(initialFiltersData).length === 0 &&
                      setLoadingState(true)
                  }}
                >
                  <div className="relative flex">
                    <FontAwesomeIcon icon={faSliders} />
                    {isFiltersSelected && (
                      <FontAwesomeIcon
                        icon={faCheck}
                        className="bg-success rounded-full text-white scale-[0.5] !w-5 !h-5 p-1 absolute -top-[10px] -right-3"
                      />
                    )}
                  </div>
                  <span>Filters</span>
                </Button>
              )}
              <Button
                variant="default"
                disabled={isAlreadyInTeam || !analysisStyle}
                onClick={() =>
                  addTeamMember({
                    type: activeMember[0],
                    specialization: activeMember[1],
                    instructions,
                    analysisStyle,
                  })
                }
              >
                Hire {activeMember[0]}
              </Button>
            </div>
          </div>
        </section>

        <section
          className={`mb-10 ${
            !close
              ? "col-span-1 lg:col-span-2 xl:col-span-1"
              : "col-span-1 sm:col-span-2 lg:col-span-1"
          }`}
        >
          <h2 className="text-xlbold mb-2">Your Team</h2>
          <aside className="rounded-xs p-4 h-full flex flex-col gap-4 bg-third dark:bg-secondary-dark">
            <ul
              className={`gap-4 ${!close ? "flex flex-wrap xl:grid xl:grid-cols-2" : "flex flex-wrap lg:grid lg:grid-cols-2"}`}
            >
              <AnimatePresence>
                {activeOptions.team.map((member, i) => (
                  <motion.li
                    key={i}
                    className="relative"
                    layout={"size"}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    <div className="absolute top-1 text-primary right-3">
                      <DropdownContent
                        align="center"
                        direction="top"
                        yOffset={-8}
                        items={[
                          {
                            text: "Remove",
                            action: () =>
                              removeTeamMember({
                                type: member.type,
                                specialization: member.specialization,
                              }),
                            icon: faTrashCan,
                            danger: true,
                          },
                        ]}
                      />
                    </div>
                    <TeamMemberAvatar
                      src={getImageForMember(
                        member.type,
                        member.specialization
                      )}
                      alt={member.specialization}
                      variant="chosen"
                    />
                    <div className="mt-2 text-left">
                      <p className="font-bold capitalize">{member.type}</p>
                      <span className="ml-1">{member.specialization}</span>
                    </div>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          </aside>
        </section>
      </div>
    </main>
  )
}

export default AgentcySteps3

export async function action({ request }: ActionFunctionArgs) {
  const token = await requiredUserSession(request)

  const url = new URL(request.url)
  const intent = url.searchParams.get("intent")
  const formData = await request.formData()

  if (intent === "filter") {
    const submitFilters = await createMetadataSearchFilters(
      token,
      createMetadataSearchFilters_BEStructure(formData)
    )
    return json({ newFilters: submitFilters })
  }
}

export function ErrorBoundary() {
  return <ErrorBoundaryComponent isMainRoute={false} />
}
