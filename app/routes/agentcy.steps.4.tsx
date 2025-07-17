import React, { useState } from "react"
import { ErrorBoundaryComponent } from "@/components/ui/ErrorBoundaryComponent/ErrorBoundaryComponent"
import { Button } from "@/components/ui/Button/Button"
import { faPlus } from "@fortawesome/free-solid-svg-icons"
import { ProposalSection, useAgentcy } from "@/store/agentcy"
import { Form, useNavigation } from "@remix-run/react"
import { ActionFunctionArgs, redirect } from "@remix-run/node"
import { requiredUserSession } from "@/data/auth/session.server"
import { v4 as uuidv4 } from "uuid"
import {
  createUserWorkspace,
  saveWorkspaceInput,
} from "@/data/litepaper/litepaper.server"
import ProposalSectionItem from "@/components/Agentcy/ProposalSectionItem"
import { motion, AnimatePresence } from "framer-motion"
import { Skeleton } from "@/components/ui/Skeleton/Skeleton"
import ProposalLoadingAnimation from "@/components/Agentcy/ProposalLoadingAnimation"
import { defaultSections } from "@/components/Agentcy/dummyContent"

const AgentcySteps_4 = () => {
  const {
    activeOptions,
    addProposalSection,
    deleteProposalSection,
    editProposalSection,
    updateOption,
  } = useAgentcy()
  const [editIndex, setEditIndex] = useState<number | null>(null)
  const [editTitle, setEditTitle] = useState("")
  const [editSubsections, setEditSubsections] = useState<string[]>([])
  const navigation = useNavigation()
  const isGeneratingWorkspace = navigation.state === "submitting"
  const [visibleSections, setVisibleSections] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isAnimating, setIsAnimating] = useState(false)

  const handleSave = (index: number, item: ProposalSection) => {
    editProposalSection(index, {
      ...item,
      title: editTitle,
      subsection: editSubsections,
    })
    setEditIndex(null)
    setEditSubsections([])
  }

  const handleCancel = () => {
    setEditIndex(null)
    setEditSubsections([])
  }

  const handleEdit = (index: number, item: ProposalSection) => {
    setEditIndex(index)
    setEditTitle(item.title)
    setEditSubsections(item.subsection || [])
  }

  return (
    <>
      <h1 className={"text-3xlbold mr-auto"}>
        <ProposalLoadingAnimation
          isAnimating={isAnimating}
          setIsLoading={setIsLoading}
          isLoading={isLoading}
          setIsAnimating={setIsAnimating}
          lengthCondition={activeOptions.proposal.length}
          updateOption={updateOption}
          setVisibleSections={setVisibleSections}
          defaultSections={defaultSections}
        />
      </h1>

      <article
        className={`rounded-xs p-7 flex flex-col gap-6 w-full border ${isLoading ? "border-transparent" : "border-primary"} bg-transparent`}
      >
        {isLoading ? (
          <div className="flex flex-col gap-4 -m-7">
            <Skeleton className={"h-8 w-full"} />
            <Skeleton className={"h-8 w-full"} />
            <Skeleton className={"h-8 w-full"} />
          </div>
        ) : (
          <ol className="list-decimal flex flex-col gap-7 pl-7">
            {activeOptions.proposal
              .slice(0, visibleSections || activeOptions.proposal.length)
              .map((item, index) => {
                const isEditing = editIndex === index
                return (
                  <AnimatePresence key={index}>
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className={isAnimating ? "pointer-events-none" : ""}
                    >
                      <ProposalSectionItem
                        item={item}
                        index={index}
                        isEditing={isEditing}
                        editTitle={editTitle}
                        editSubsections={editSubsections}
                        setEditTitle={setEditTitle}
                        setEditSubsections={setEditSubsections}
                        onSave={() => handleSave(index, item)}
                        onCancel={handleCancel}
                        onEdit={() => handleEdit(index, item)}
                        onDelete={() => deleteProposalSection(index)}
                      />
                      <hr
                        className={`-ml-7 mt-7 border-b-secondary/20 ${index === activeOptions.proposal.length - 1 ? "hidden" : ""}`}
                      />
                    </motion.div>
                  </AnimatePresence>
                )
              })}
          </ol>
        )}
      </article>
      <Button variant={"underline"} className={"ml-auto hidden"} icon={faPlus}>
        Add Section
      </Button>
      <Form method="post" className={"ml-auto"}>
        <input
          type="hidden"
          name="data"
          value={JSON.stringify(activeOptions.proposal)}
          className={"hidden"}
        />
        <input
          type="hidden"
          name="writingStyle"
          value={activeOptions.writingStyle}
          className={"hidden"}
        />
        <input
          type="hidden"
          name="prompt"
          value={activeOptions.prompt}
          className={"hidden"}
        />
        <Button
          type="submit"
          className="!font-normal ml-auto w-52"
          isLoading={isGeneratingWorkspace}
          disabled={
            isAnimating ||
            isLoading ||
            activeOptions.proposal.length === 0 ||
            isGeneratingWorkspace ||
            navigation.state === "loading"
          }
        >
          Approve
        </Button>
      </Form>
    </>
  )
}
export default AgentcySteps_4

export async function action({ request }: ActionFunctionArgs) {
  const token = await requiredUserSession(request)
  const formData = await request.formData()
  let data

  if (formData.has("data")) {
    const rawProposal = JSON.parse(formData.get("data") as string)
    data = {
      sections: rawProposal.map((section: ProposalSection, index: number) => ({
        uuid: uuidv4(),
        title: section.title,
        type:
          section.subsection && section.subsection.length > 0
            ? "Subsections"
            : section.type,
        subtype: section?.subtype ?? null,
        layout_metadata: {
          displayId: index + 1,
          previewMode: false,
          preview: [],
        },
        prompt: section?.prompt ?? section.title,
        subsections: section.subsection
          ? section.subsection.map((sub, subIndex) => ({
              uuid: uuidv4(),
              title: sub.title,
              type: sub?.type,
              subtype: sub?.subtype ?? null,
              prompt: sub?.prompt ?? sub.title,
              is_opensi_selected: sub?.is_opensi_selected ?? false,
              layout_metadata: {
                displayId: subIndex + 1,
                displayMode:
                  sub?.layout_metadata?.displayMode ?? "Single block",
              },
            }))
          : [],
      })),
    }
  }

  const workspaceData = new FormData()
  const keys = ["name", "description", "subtitle", "writing_style"]
  keys.forEach((key) => {
    if (!workspaceData.has(key)) {
      workspaceData.set(key, "")
    }
  })

  workspaceData.set("name", "Sweden Nicotine Pouch Deep Dive")
  workspaceData.set("authors", "The Agentcy")

  if (formData.has("writingStyle")) {
    const writingStyle = formData.get("writingStyle") as string
    workspaceData.set("writing_style", writingStyle)
  }
  if (formData.has("prompt")) {
    const prompt = formData.get("prompt") as string
    workspaceData.set(
      "description",
      "Sweden’s nicotine pouch market is booming, driven by innovative brands, shifting consumer preferences, and cutting-edge product breakthroughs. This revolution is redefining nicotine use, making smokeless, tobacco-free options the new norm."
    )
    workspaceData.set("subtitle", "The Brands, Behaviors and Regulations")
  }

  const workspaceId = await createUserWorkspace(token, workspaceData)
  if (data && data?.sections.length > 0) {
    const saveStatus = await saveWorkspaceInput(token, workspaceId, data)
    if (saveStatus === 200) {
      return redirect(`/litePaper`)
    }
  }

  return redirect(`/litePaper`)
}

export function ErrorBoundary() {
  return <ErrorBoundaryComponent isMainRoute={false} />
}
