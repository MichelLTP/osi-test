import React, { useState } from "react"
import { ErrorBoundaryComponent } from "@/components/ui/ErrorBoundaryComponent/ErrorBoundaryComponent"
import { faHexagonNodes, faList } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Button } from "@/components/ui/Button/Button"
import { useAgentcy } from "@/store/agentcy"
import { faSitemap } from "@fortawesome/free-solid-svg-icons/faSitemap"
import { faCubes } from "@fortawesome/free-solid-svg-icons/faCubes"
import { IconProp } from "@fortawesome/fontawesome-svg-core"
import Modal from "@/components/Shared/Modal/Modal"
import UploadFile from "@/components/Shared/UploadFile/UploadFile"
import FileUploadProgress from "@/components/Shared/FileUploadProgress/FileUploadProgress"
import TextArea from "@/components/ui/TextArea/TextArea"
import { FileUploadState } from "@/components/Shared/UploadFile/types"

const AgentcySteps1 = () => {
  const { activeOptions, updateOption } = useAgentcy()
  const [showInstructions, setShowInstructions] = useState(false)
  const [uploadState, setUploadState] = useState<FileUploadState>(
    FileUploadState.INITIAL
  )

  const content = [
    {
      icon: faCubes,
      title: "Hierarchical",
      description:
        "A traditional structure with multiple management layers and a clear chain of command.",
      strengths: [
        "Clear authority and roles",
        "Structured career paths",
        "Strong departmental focus",
      ],
      weaknesses: [
        "Slow decision-making",
        "Poor communication and team silos",
        "High costs due to multiple layers",
      ],
      onClick: () => updateOption("managementTeam", "Hierarchical"),
    },
    {
      icon: faHexagonNodes,
      title: "Matrix",
      description:
        "Employees report to more than one manager, combining functional and project lines.",
      strengths: [
        "Cross-functional collaboration",
        "Flexible resource allocation",
        "Broader employee skill development",
      ],
      weaknesses: [
        "Confusion over roles and authority",
        "Team conflicts and power struggles",
        "Slower decision-making",
      ],
      onClick: () => updateOption("managementTeam", "Matrix"),
    },
    {
      icon: faSitemap,
      title: "Flat",
      description:
        "Few or no management layers, promoting direct communication and employee autonomy.",
      strengths: [
        "Faster decision-making",
        "Greater employee autonomy",
        "Lower management costs",
      ],
      weaknesses: [
        "Loss of control over processes",
        "Lack of specialization",
        "No oversight",
      ],
      onClick: () => updateOption("managementTeam", "Flat"),
    },
  ]

  const handleFileUpload = (acceptedFiles: File[]) => {
    updateOption("writingSample", acceptedFiles)
    setUploadState(FileUploadState.DONE)
  }

  const handleFileCancel = () => {
    updateOption("writingSample", [])
    setUploadState(FileUploadState.INITIAL)
  }

  const handleWritingStyleChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    updateOption("writingStyle", e.target.value)
  }

  return (
    <>
      {showInstructions && (
        <Modal
          title={"Instructions"}
          size={"default"}
          variant={"confirmation"}
          handleClose={() => setShowInstructions(false)}
          icon={faList}
          confirmationProps={{
            handleAction: () => setShowInstructions(false),
            actionText: "Add Instructions",
          }}
        >
          <p>Upload a sample .txt file to provide a writing example.</p>
          <p>
            Alternatively, enter your instructions directly in the text box
            below.
          </p>
          <main className="grid grid-cols-2 gap-6 mt-6">
            <section className="space-y-1">
              <p>Writing Sample</p>
              <UploadFile
                onUpload={handleFileUpload}
                acceptedFileTypes="documents"
                state={uploadState}
              />
              <FileUploadProgress
                acceptedFiles={activeOptions.writingSample}
                onCancelUpload={handleFileCancel}
                loading={uploadState === FileUploadState.UPLOADING}
              />
            </section>

            <section className="space-y-1">
              <p>Writing style</p>
              <TextArea
                id="description"
                name="description"
                rows={3}
                className={"dark:bg-secondary-dark dark:text-white"}
                placeholder="Extract information in a concise and comprehensive manner"
                value={activeOptions.writingStyle}
                onChange={handleWritingStyleChange}
              />
            </section>
          </main>
        </Modal>
      )}

      <h1 className={"text-3xlbold"}>Hire your management team</h1>
      <Button
        variant={"underline"}
        className="ml-auto"
        icon={faList}
        onClick={() => setShowInstructions(true)}
      >
        Instructions
      </Button>
      <section className="flex gap-6 flex-col lg:flex-row w-full">
        {content.map((item, index) => (
          <article
            className={`rounded-xs p-7 flex flex-col gap-6 border transition-[border] ${
              activeOptions.managementTeam === item.title
                ? "border-primary bg-transparent"
                : "bg-third dark:bg-secondary-dark border-transparent"
            }`}
            key={index + "step1"}
          >
            <header className="flex items-center gap-2">
              <FontAwesomeIcon icon={item.icon as IconProp} size={"lg"} />
              <h2 className="text-2xlbold">{item.title}</h2>
            </header>
            <p>{item.description}</p>
            <h3 className="font-bold">Strengths:</h3>
            <ul className="list-disc pl-5">
              {item.strengths.map((strength, index) => (
                <li key={index + "strength"}>{strength}</li>
              ))}
            </ul>
            <h3 className="font-bold">Weaknesses:</h3>
            <ul className="list-disc pl-5">
              {item.weaknesses.map((weakness, index) => (
                <li key={index + "weakness"}>{weakness}</li>
              ))}
            </ul>
            <Button
              variant={
                activeOptions.managementTeam === item.title
                  ? "default"
                  : "outline"
              }
              onClick={() => {
                item.onClick()
                updateOption("writingSample", null)
                updateOption("writingStyle", "")
              }}
              className={"mt-auto px-0"}
            >
              Hire {item.title.toLowerCase()} team
            </Button>
          </article>
        ))}
      </section>
    </>
  )
}
export default AgentcySteps1

export function ErrorBoundary() {
  return <ErrorBoundaryComponent isMainRoute={false} />
}
