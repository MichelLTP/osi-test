import { AnimatePresence, motion } from "framer-motion"
import { useCallback, useEffect, useState } from "react"
import { Button } from "@/components/ui/Button/Button"
import Main from "@/components/Layout/Main/Main"
import {
  faPlus,
  faClose,
  faPaperPlane,
  faPenToSquare,
  faMinus,
  faEye,
  faExclamationCircle,
  faPeopleGroup,
} from "@fortawesome/free-solid-svg-icons"
import NewSection from "@/components/LitePaper/NewSection/NewSection"
import { litePaperDescription } from "@/textData"
import {
  ShouldRevalidateFunction,
  useFetcher,
  useLoaderData,
  useNavigate,
} from "@remix-run/react"
import {
  ExpandTrigger,
  FinalResult,
  OutputSectionResponse,
} from "@/components/LitePaper/Output/types"
import {
  ActionFunctionArgs,
  json,
  LoaderFunction,
  LoaderFunctionArgs,
} from "@remix-run/node"
import { requiredUserSession } from "@/data/auth/session.server"
import {
  fetchSessionDocs,
  getWorkspaceInput,
  saveWorkspaceInput,
} from "@/data/litepaper/litepaper.server"
import { ErrorBoundaryComponent } from "@/components/ui/ErrorBoundaryComponent/ErrorBoundaryComponent"
import { createMetadataSearchFilters_BEStructure } from "@/utils/metadataFilters"
import {
  createMetadataSearchFilters,
  fetchMetadataFilters,
} from "@/data/searchsi/searchSi.server"
import { FilterData } from "@/components/Shared/Filters/types"
import { DBLoadState } from "@/components/Shared/LoadFromDB/type"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  ConfirmationModalProps,
  Document,
  SectionObj,
  SubsectionsSection,
  Workspace,
} from "@/components/LitePaper/types"
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd"
import {
  previewLitePaperSection,
  processLitePaperResponse,
} from "@/utils/sse/sseRender"
import { toast } from "@/hooks/useToast"
import Output from "@/components/LitePaper/Output/Output"
import LoadingStatus from "@/components/Shared/LoadingStatus/LoadingStatus"
import Modal from "@/components/Shared/Modal/Modal"
import clsx from "clsx"
import { useCloseSidebar } from "@/store/layout"
import { faFloppyDisk } from "@fortawesome/free-regular-svg-icons"
import { Toaster } from "@/components/ui/Toast/Toaster"
import { useLitePaper } from "@/store/litepaper"
import { buildErrorDescription, validateSections } from "@/utils/litepaper"
import useLocalDBFilesStore from "@/store/localDB"
import { MarkdownRenderer } from "@/components/Shared/MarkdownRender/MarkdownRender"
import { IconProp } from "@fortawesome/fontawesome-svg-core"
import BackButton from "@/components/ui/BackButton/BackButton"

const SlidesComponent = () => {
  const fetcher = useFetcher<{
    receivedPersonalFiles: Document[]
    receivedDBFiles: Document[]
    status: string
    filters: FilterData
    workspaceInput: Workspace
  }>()
  const loaderData = useLoaderData<typeof loader>()
  const {
    localDBFiles,
    localPrivateFiles,
    setLocalDBFiles,
    setLocalPrivateFiles,
    dbLoad,
    privateLoad,
    setNeedLoadState,
    setIsLoadingDocs,
  } = useLocalDBFilesStore()
  const litePaper = useLitePaper()
  const isSidebarClosed = useCloseSidebar((state) => state.close)
  const [expandAll, setExpandAll] = useState<ExpandTrigger>({
    open: true,
    reset: false,
  })
  const [expandedSections, setExpandedSections] = useState<string[]>([])
  const [loadedWorkspace, setLoadedWorkspace] = useState<boolean>(false)
  const [openSubsections, setOpenSubsections] = useState<
    Record<number, boolean>
  >({}) // Track open state per section
  const [selectedId, setSelectedId] = useState<number>(
    litePaper.sections?.[0]?.layout_metadata.displayId || 0
  )
  const [previewExpanded, setPreviewExpanded] = useState<ExpandTrigger>({
    open: true,
    reset: false,
  })
  const selectedSection = litePaper.sections?.find(
    (section) => section.layout_metadata.displayId === selectedId
  )
  const [confirmationModal, setConfirmationModal] =
    useState<ConfirmationModalProps>({
      open: false,
      action: null,
      title: undefined,
      type: null,
      parentUuid: "",
      uuid: "",
      description: "",
    })
  const [savingInputModal, setSavingInputModal] =
    useState<ConfirmationModalProps>({
      open: false,
      action: null,
      title: undefined,
      type: null,
      parentUuid: "",
      uuid: "",
      description: "",
    })
  const navigate = useNavigate()

  const hasPreview =
    selectedSection?.layout_metadata.previewMode &&
    Array.isArray(selectedSection.layout_metadata.preview) &&
    selectedSection.layout_metadata.preview.length > 0

  const handleAddSection = () => {
    litePaper.addSectionOrSubsection()
  }

  const handleRemoveSection = (uuid: string) => {
    const section = litePaper.sections.find((s) => s.uuid === uuid)
    setConfirmationModal((prev) => ({
      ...prev,
      open: true,
      action: "delete",
      title: section?.title
        ? section.title
        : `Section ${section?.layout_metadata.displayId}`,
      type: "section",
      uuid: section?.uuid,
    }))
  }

  const handleDuplicateSection = (uuid: string) => {
    litePaper.duplicateSectionOrSubsection(uuid)
  }

  const handleRemoveSubsection = (
    parentUuid: string,
    subsectionUuid: string
  ) => {
    const subsection = litePaper.sections
      .find((s) => s.uuid === parentUuid)
      ?.subsections.find((ss) => ss.uuid === subsectionUuid)
    setConfirmationModal({
      open: true,
      action: "delete",
      title: subsection?.title
        ? subsection.title
        : `Subsection ${subsection?.layout_metadata.displayId}`,
      type: "subsection",
      parentUuid: parentUuid,
      uuid: subsection?.uuid,
    })
  }

  const handleModalConfirm = () => {
    if (confirmationModal.type === "section" && confirmationModal.uuid) {
      litePaper.removeSectionOrSubsection(confirmationModal.uuid)
      if (litePaper.sections?.length === 1) {
        litePaper.addSectionOrSubsection()
      }
    } else if (
      confirmationModal.type === "subsection" &&
      confirmationModal.uuid &&
      confirmationModal.parentUuid
    ) {
      litePaper.removeSectionOrSubsection(confirmationModal.uuid)
    }
    setConfirmationModal((prev) => ({ ...prev, open: false, action: null }))
  }

  const handleSectionClick = (displayId: number) => {
    setSelectedId(displayId)
  }

  const toggleSubsection = (displayId: number) => {
    setOpenSubsections((prev) => ({
      ...prev,
      [displayId]: !prev[displayId],
    }))
  }

  const handleDragStart = (result: any) => {
    const { type } = result
    if (type === "sections-list") {
      setOpenSubsections({})
    }
  }

  const handleDragEnd = (result: any) => {
    const { source, destination, type } = result

    if (!destination) return

    // Handle section drag
    if (type === "sections-list") {
      const items = Array.from(litePaper.sections)
      const [reorderedItem] = items.splice(source.index, 1)
      items.splice(destination.index, 0, reorderedItem)
      litePaper.reorderSectionOrSubsection(items)
    }

    // Handle subsection drag
    if (type === "subsections-list") {
      const sourceSectionId = source.droppableId.split("-")[1]
      const destSectionId = destination.droppableId.split("-")[1]

      // Prevent cross-section dragging
      if (sourceSectionId !== destSectionId) return

      const section = litePaper.sections.find(
        (s) => s.layout_metadata.displayId.toString() === sourceSectionId
      )
      if (!section) return

      const subsections = [...section.subsections]
      const [movedSubsection] = subsections.splice(source.index, 1)
      subsections.splice(destination.index, 0, movedSubsection)

      // Update subsections in the store
      litePaper.reorderSectionOrSubsection(subsections, section.uuid)
    }
  }

  const handleRunAll = () => {
    const errors = validateSections(litePaper.sections)
    if (errors.length > 0) {
      const userFriendlyDescription = buildErrorDescription(errors)
      setSavingInputModal((prev) => ({
        ...prev,
        open: true,
        action: "save",
        title: `Unable to run due to missing inputs`,
        type: "savePaper",
        description: userFriendlyDescription,
        uuid: selectedSection?.uuid,
      }))
    } else {
      litePaper.resetLitePaperResult()
      litePaper.setHasInputs(true)
      const urlParams = new URLSearchParams(window.location.search)
      const workspaceId = urlParams.get("workspaceId")
      navigate(`/litePaper/response?workspaceId=${workspaceId}`)
    }
  }

  const newPaperClick = () => {
    setLocalDBFiles([])
    setLocalPrivateFiles([])
    setNeedLoadState(false, false)
    litePaper.resetLitePaper()
    navigate("/litePaper/settings")
  }

  const savePaper = () => {
    const errors = validateSections(litePaper.sections)
    if (errors.length > 0) {
      const userFriendlyDescription = buildErrorDescription(errors)
      setSavingInputModal((prev) => ({
        ...prev,
        open: true,
        action: "save",
        title: `Unable to save due to missing inputs`,
        type: "savePaper",
        description: userFriendlyDescription,
        uuid: selectedSection?.uuid,
      }))
    } else {
      const formData = new FormData()
      const data = { sections: litePaper.sections }

      formData.append("data", JSON.stringify(data))
      formData.append("intent", "save")
      fetcher.submit(formData, {
        method: "put",
        encType: "multipart/form-data",
        action: "",
      })
    }
  }

  const handlePreviewSection = () => {
    const selectedSection = litePaper.sections?.find(
      (section) => section.layout_metadata.displayId === selectedId
    )
    if (selectedSection) {
      const errors = validateSections([selectedSection])
      if (errors.length > 0) {
        const userFriendlyDescription = buildErrorDescription(errors)
        setSavingInputModal((prev) => ({
          ...prev,
          open: true,
          action: "save",
          title: `Unable to preview due to missing inputs`,
          type: "savePaper",
          description: userFriendlyDescription,
          uuid: selectedSection?.uuid,
        }))
      } else {
        const selectedLayoutMeta = litePaper.sections?.find(
          (section) => section.layout_metadata.displayId === selectedId
        )?.layout_metadata
        litePaper.updateSectionOrSubsectionField(
          selectedSection?.uuid as string,
          {
            layout_metadata: {
              ...selectedLayoutMeta,
              preview: [],
              previewMode: true,
            },
          }
        )
        triggerSectionPreview()
      }
    }
  }

  const handleEditSection = () => {
    const selectedLayoutMeta = litePaper.sections?.find(
      (section) => section.layout_metadata.displayId === selectedId
    )?.layout_metadata
    litePaper.updateSectionOrSubsectionField(selectedSection?.uuid as string, {
      layout_metadata: { ...selectedLayoutMeta, previewMode: false },
    })
  }

  const handleEditPaper = () => {
    const urlParams = new URLSearchParams(window.location.search)
    const workspaceId = urlParams.get("workspaceId")
    navigate(`/litePaper/settings?workspaceId=${workspaceId}`)
  }

  const handlePreviewStream = useCallback(
    (messageChunk: string) => {
      try {
        const parsedMessage = JSON.parse(messageChunk)
        if (parsedMessage.type === "Form" && parsedMessage.content) {
          const content = parsedMessage.content
          const sections = Array.isArray(content.section)
            ? content.section
            : [content.section]

          const resultStructure = sections.flatMap((section: SectionObj) => {
            if (
              section.type === "Subsections" &&
              Array.isArray(section.subsections)
            ) {
              return section.subsections.map((sub: SectionObj) => ({
                uuid: sub.uuid,
                content: [
                  {
                    type: "Status",
                    result: "Waiting for the result",
                    completed: false,
                  },
                ],
              }))
            }
            return [
              {
                uuid: section.uuid,
                content: [
                  {
                    type: "Status",
                    result: "Waiting for the result",
                    completed: false,
                  },
                ],
              },
            ]
          })

          litePaper.setResults(resultStructure)
        } else if (parsedMessage.type === "Status" && parsedMessage.content) {
          litePaper.addOutputSectionResponse(parsedMessage.uuid, {
            type: parsedMessage.type,
            result: parsedMessage.content,
            completed: false,
          })
        } else if (parsedMessage.type === "Error" && parsedMessage.content) {
          litePaper.addOutputSectionResponse(parsedMessage.uuid, {
            type: parsedMessage.type,
            result: parsedMessage.content,
          })
        } else if (
          parsedMessage.type === "Result" &&
          parsedMessage.content &&
          parsedMessage.uuid
        ) {
          if (Array.isArray(parsedMessage.content)) {
            parsedMessage.content.forEach((item: OutputSectionResponse) => {
              litePaper.addOutputSectionResponse(parsedMessage.uuid, item)
            })
          } else {
            litePaper.addOutputSectionResponse(
              parsedMessage.uuid,
              parsedMessage.content
            )
          }
        } else if (parsedMessage.type === "Completed") {
          // maybe we might need this
        } else {
          console.warn(`Unhandled progress type: ${parsedMessage.type}`)
        }
        const selectedUuid = litePaper.sections?.find(
          (section) => section.layout_metadata.displayId === selectedId
        )?.uuid
        litePaper.addResultToSectionPreview(selectedUuid as string)
      } catch (error) {
        console.error("Error processing message chunk:", error)
      }
    },
    [selectedId, litePaper.sections]
  )

  const triggerSectionPreview = async () => {
    const section = litePaper.sections.filter(
      (section) => section.layout_metadata.displayId === selectedId
    )
    const formData = new FormData()

    // Convert the forms structure to JSON and append it to the FormData object
    formData.append("section", JSON.stringify(section))

    const urlParams = new URLSearchParams(window.location.search)
    const workspaceId = urlParams.get("workspaceId")
    if (workspaceId) {
      formData.append("workspaceId", workspaceId)
    }
    try {
      const response = await previewLitePaperSection(formData)
      if (!response) return

      processLitePaperResponse({
        response,
        onChunk: handlePreviewStream,
      })
    } catch (err) {
      toast({
        title: "Something went wrong",
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "error",
      })
    }
  }

  useEffect(() => {
    if (loadedWorkspace === false && loaderData && loaderData.workspaceInput) {
      setLoadedWorkspace(true)
      litePaper.resetLitePaper()
      litePaper.resetLitePaperResult()
      litePaper.setPaperName(loaderData.workspaceInput.name)
      litePaper.setDescription(loaderData.workspaceInput.description)
      litePaper.setAuthors(loaderData.workspaceInput.authors)
      litePaper.setSubtitle(loaderData.workspaceInput.subtitle)
      litePaper.setWritingStyle(loaderData.workspaceInput.writing_style)
      if (loaderData.workspaceInput.form) {
        litePaper.setSections(loaderData.workspaceInput.form.sections)
        setSelectedId(1)
      }
    }
  }, [loaderData.workspaceInput])

  useEffect(() => {
    if (fetcher.data) {
      const { receivedPersonalFiles, receivedDBFiles, status } = fetcher.data

      if (receivedDBFiles.length > 0 && receivedDBFiles) {
        setLocalDBFiles(receivedDBFiles)
        setIsLoadingDocs(DBLoadState.DONE)
      }
      if (receivedPersonalFiles.length > 0 && receivedPersonalFiles) {
        setLocalPrivateFiles(receivedPersonalFiles)
        setIsLoadingDocs(DBLoadState.DONE)
      }
      if (status && status === "noFiles") {
        setIsLoadingDocs(DBLoadState.DONE)
      } else if (status && status === "saved") {
        toast({
          title: `Workspace Updated`,
          description: `Inputs saved successfully`,
          variant: "success",
        })
      } else if (status && status === "error saving") {
        toast({
          title: `Workspace Saving Error`,
          description: `Inputs failed to save`,
          variant: "error",
        })
      }
    }
  }, [fetcher.data])

  useEffect(() => {
    if (expandAll.open) {
      setExpandedSections(litePaper.sections.map((response) => response.uuid))
    } else {
      setExpandedSections([])
    }
  }, [expandAll, litePaper.sections])

  useEffect(() => {
    if (
      (dbLoad && localDBFiles?.length === 0) ||
      (privateLoad && localPrivateFiles?.length === 0)
    ) {
      const queryParams = new URLSearchParams()
      queryParams.append("intent", "loadDB")

      if (dbLoad && localDBFiles?.length === 0) {
        queryParams.append("OpenSI", "yes")
      }

      if (privateLoad && localPrivateFiles?.length === 0) {
        queryParams.append("Private", "yes")
      }

      const currentParams = new URLSearchParams(window.location.search)
      const workspaceId = currentParams.get("workspaceId")

      if (workspaceId) {
        queryParams.append("workspaceId", workspaceId as string)
      }

      setIsLoadingDocs(DBLoadState.LOADING)
      fetcher.load(`/litePaper/slides?${queryParams.toString()}`)
      setNeedLoadState(false, false)
    }
  }, [dbLoad, privateLoad])

  return (
    <Main>
      {confirmationModal.open && (
        <Modal
          title={`Delete ${confirmationModal.type}`}
          size={"x-small"}
          icon={faExclamationCircle}
          handleClose={() =>
            setConfirmationModal((prev) => ({
              ...prev,
              open: false,
              action: null,
            }))
          }
          variant={"confirmation"}
          confirmationProps={{
            actionText: "Confirm",
            handleAction: () => handleModalConfirm(),
          }}
        >
          <p className={"mb-12 mt-4"}>
            Are you sure you want to delete{" "}
            <strong>{confirmationModal.title}</strong>?
          </p>
        </Modal>
      )}
      {savingInputModal.open && (
        <Modal
          title={savingInputModal.title as string}
          size={"x-small"}
          icon={faExclamationCircle}
          handleClose={() =>
            setSavingInputModal((prev) => ({
              ...prev,
              open: false,
              action: null,
            }))
          }
          variant={"default"}
        >
          <MarkdownRenderer value={savingInputModal.description as string} />
        </Modal>
      )}
      <p className="pt-3 justify-left border-opacity-60">
        {litePaperDescription}
      </p>
      <Toaster />
      <BackButton customURL={`/litePaper`} />
      <header className="flex flex-wrap justify-between gap-4 mb-4">
        <div className="flex flex-col">
          <h1 className={"text-3xlbold"}>
            {litePaper.paperName !== "" ? litePaper.paperName : "Your Paper"}
          </h1>
          {litePaper.authors === "The Agentcy" && (
            <span className="text-base mb-4 flex gap-2 items-center">
              {litePaper.authors === "The Agentcy" && (
                <FontAwesomeIcon icon={faPeopleGroup as IconProp} />
              )}
              {litePaper.authors}
            </span>
          )}
          <p
            className={`text-base ${
              litePaper.description !== "" ? "pt-3 pb-10" : ""
            }`}
          >
            {litePaper.description !== "" ? litePaper.description : ""}
          </p>
        </div>
        <section className={"flex justify-end"}>
          <div className="px-2">
            <Button
              icon={faPlus}
              className={"font-normal !inline"}
              variant={"borderGhost"}
              onClick={newPaperClick}
            >
              New Paper
            </Button>
          </div>
          <div>
            <Button
              icon={faFloppyDisk}
              className={"font-normal !inline"}
              variant={"borderGhost"}
              onClick={savePaper}
            >
              Save Paper
            </Button>
          </div>
        </section>
      </header>
      <p className="w-full pt-6 pb-4 text-xlbold">
        Sections ({litePaper.sections.length})
      </p>
      <div
        className={clsx(
          "grid grid-cols-1 lg:grid-cols-[277px_1fr] gap-x-2 gap-y-7 md:gap-y-10 text-secondary dark:text-white",
          isSidebarClosed ? "md:grid-cols-[277px_1fr]" : "md:grid-cols-1"
        )}
      >
        <section className="dark:text-white">
          <div className="p-4 flex flex-col sticky top-5 h-[707px] bg-third dark:bg-secondary-dark rounded-[15px] opacity-[95]">
            <Button
              className="text-primary dark:text-primary dark:hover:text-primary hover:underline ml-auto"
              variant="ghost"
              icon={faPlus}
              onClick={() => handleAddSection()}
            >
              Add Section
            </Button>

            <DragDropContext
              onDragEnd={handleDragEnd}
              onDragStart={handleDragStart}
            >
              <Droppable
                droppableId="sections"
                type="sections-list"
                direction="vertical"
              >
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="mt-2 overflow-y-auto custom-scrollbar dark-scrollbar h-[530px] space-y-4"
                  >
                    {litePaper.sections.map((section, sectionIndex) => (
                      <Draggable
                        key={section.layout_metadata.displayId}
                        draggableId={(
                          section.layout_metadata.displayId as number
                        ).toString()}
                        index={sectionIndex}
                      >
                        {(provided) => (
                          <div
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            ref={provided.innerRef}
                            role="button"
                            tabIndex={0}
                            onClick={() => {
                              if (section.layout_metadata.displayId) {
                                handleSectionClick(
                                  section.layout_metadata.displayId
                                )
                              }
                            }}
                            onKeyDown={(e) => {
                              if (
                                (e.key === "Enter" || e.key === " ") &&
                                section.layout_metadata.displayId
                              ) {
                                handleSectionClick(
                                  section.layout_metadata.displayId
                                )
                              }
                            }}
                          >
                            <div className="rounded-[10px] bg-white dark:bg-[#474854] cursor-grab group relative">
                              <div
                                className={`flex flex-col py-3 px-5 mr-5
                                  ${
                                    section.layout_metadata.displayId ===
                                    selectedId
                                      ? "text-primary"
                                      : ""
                                  }
                                `}
                              >
                                <span className="text-basebold">
                                  {section.title ||
                                    `Section ${section.layout_metadata.displayId}`}
                                </span>
                                <span className="text-base">
                                  {section.type || "Section Type"}
                                </span>
                                {(section as SubsectionsSection).type ==
                                  "Subsections" &&
                                  (section as SubsectionsSection).subsections!
                                    .length > 0 && (
                                    <>
                                      <span className="text-black text-xs opacity-50 mt-1 dark:text-white">
                                        {`${
                                          (section as SubsectionsSection)
                                            .subsections!.length
                                        } Subsections`}
                                      </span>
                                      <button
                                        onClick={() => {
                                          toggleSubsection(
                                            section.layout_metadata
                                              .displayId as number
                                          )
                                        }}
                                        className="absolute right-2 bottom-2 flex items-center rounded-full w-4 h-4 bg-primary/10"
                                      >
                                        <FontAwesomeIcon
                                          icon={
                                            openSubsections[
                                              section.layout_metadata
                                                .displayId as number
                                            ]
                                              ? faMinus
                                              : faPlus
                                          }
                                          className="m-auto text-primary dark:hover:text-white cursor-pointer text-[7px]"
                                        />
                                      </button>
                                    </>
                                  )}
                              </div>
                              <FontAwesomeIcon
                                icon={faClose}
                                className={`absolute right-2 top-2 text-primary dark:hover:text-white cursor-pointer p-1`}
                                size="xs"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleRemoveSection(section.uuid)
                                }}
                              />
                            </div>
                            <AnimatePresence mode="wait">
                              {openSubsections[
                                section.layout_metadata.displayId as number
                              ] && (
                                <Droppable
                                  droppableId={`subsections-${section.layout_metadata.displayId}`}
                                  type="subsections-list"
                                >
                                  {(provided) => (
                                    <div
                                      ref={provided.innerRef}
                                      {...provided.droppableProps}
                                    >
                                      <motion.div
                                        initial={{ height: 0 }}
                                        animate={{ height: "auto" }}
                                        exit={{ height: 0 }}
                                        transition={{
                                          duration: 0.2,
                                          ease: "easeInOut",
                                        }}
                                        className="overflow-hidden space-y-2 pt-4 pl-6 relative before:absolute before:left-3 before:top-1 before:bottom-[20px] before:w-px before:bg-secondary/30 dark:before:bg-third/30"
                                      >
                                        {(section as SubsectionsSection).type ==
                                          "Subsections" &&
                                          (
                                            section as SubsectionsSection
                                          ).subsections?.map(
                                            (subsection, subsectionIndex) => (
                                              <Draggable
                                                key={subsection.uuid}
                                                draggableId={subsection.uuid}
                                                index={subsectionIndex}
                                              >
                                                {(provided) => (
                                                  <div
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    {...provided.dragHandleProps}
                                                    role="button"
                                                    tabIndex={0}
                                                    className="relative before:absolute before:-left-3 before:top-5 before:w-2 before:h-px before:bg-secondary/30 dark:before:bg-third/30 flex justify-between items-center bg-white dark:bg-[#474854] rounded-xs p-3"
                                                  >
                                                    <span className="text-xs pl-1">
                                                      {subsection.title ||
                                                        `Subsection ${
                                                          subsectionIndex + 1
                                                        }`}
                                                    </span>
                                                    <FontAwesomeIcon
                                                      onClick={() =>
                                                        handleRemoveSubsection(
                                                          section.uuid,
                                                          subsection.uuid
                                                        )
                                                      }
                                                      icon={faClose}
                                                      className="text-primary dark:hover:text-white cursor-pointer"
                                                      size="xs"
                                                    />
                                                  </div>
                                                )}
                                              </Draggable>
                                            )
                                          )}
                                        {provided.placeholder}
                                      </motion.div>
                                    </div>
                                  )}
                                </Droppable>
                              )}
                            </AnimatePresence>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
            <Button
              icon={faPenToSquare}
              className="mt-4"
              onClick={handleEditPaper}
              variant={"borderGhost"}
            >
              Edit Paper
            </Button>
            <Button icon={faPaperPlane} className="mt-2" onClick={handleRunAll}>
              Run
            </Button>
          </div>
        </section>
        {selectedSection ? (
          selectedSection.layout_metadata.previewMode ? (
            hasPreview ? (
              <section className="w-full ml-2 px-4 max-w-[839px]">
                <Output
                  sectionResponses={
                    selectedSection.layout_metadata.preview as FinalResult[]
                  }
                  expandedSections={previewExpanded}
                  inputSections={[selectedSection]}
                />
                <section className="flex mt-auto py-4 px-4">
                  <div className="ml-auto">
                    <Button
                      icon={faEye}
                      className="font-normal"
                      variant="outline"
                      onClick={handleEditSection}
                    >
                      Edit Section
                    </Button>
                  </div>
                </section>
              </section>
            ) : (
              <LoadingStatus
                statusMessage={{ body: "Preparing your preview..." }}
              />
            )
          ) : (
            <section className="flex flex-col">
              <fetcher.Form className="w-full px-4">
                <NewSection
                  key={selectedId}
                  section={
                    litePaper.sections?.find(
                      (section) =>
                        section.layout_metadata.displayId === selectedId
                    ) as SectionObj
                  }
                  setExpandedSections={setExpandedSections}
                  expandedSections={expandedSections}
                />
              </fetcher.Form>
              <section className="flex flex-wrap justify-between mt-auto gap-4 py-4 px-4">
                <div>
                  <Button
                    className="text-primary dark:text-primary dark:hover:text-primary hover:underline px-2"
                    variant="ghost"
                    icon={faPlus}
                    onClick={() => handleDuplicateSection(selectedSection.uuid)}
                  >
                    Duplicate Section
                  </Button>
                  <Button
                    className="text-error hover:text-error dark:text-error dark:hover:text-error hover:underline"
                    variant="ghost"
                    icon={faMinus}
                    onClick={() => handleRemoveSection(selectedSection.uuid)}
                  >
                    Delete section
                  </Button>
                </div>
                <Button
                  icon={faEye}
                  className="font-normal"
                  variant="outline"
                  onClick={handlePreviewSection}
                >
                  Preview Section
                </Button>
              </section>
            </section>
          )
        ) : null}
      </div>
    </Main>
  )
}

export default SlidesComponent

export const loader: LoaderFunction = async ({
  request,
}: LoaderFunctionArgs) => {
  const token = await requiredUserSession(request)

  const url = new URL(request.url)
  const params = new URLSearchParams(url.search)
  const intent = params.get("intent")
  const workspaceId = params.get("workspaceId")

  if (workspaceId) {
    const workspaceInput = await getWorkspaceInput(token, workspaceId)

    if (intent === "loadDB") {
      const formData = new FormData()
      formData.append("session_id", "")

      const hasOpenSI = params.get("OpenSI") === "yes"
      const hasPrivate = params.get("Private") === "yes"

      const requestData = {
        has_db_files: hasOpenSI,
        has_personal_files: hasPrivate,
      }

      formData.append("data", JSON.stringify(requestData))
      const first_response = await fetchSessionDocs(token, formData)

      const transformedResponse = {
        personal_files: first_response.personal_files.map((doc) => ({
          id: doc.doc_id,
          filename: doc.doc_name,
        })),
        db_files: first_response.db_files.map((doc) => ({
          id: doc.doc_id,
          filename: doc.doc_name,
        })),
      }

      let status
      if (
        first_response.personal_files.length === 0 &&
        first_response.db_files.length === 0
      ) {
        status = "noFiles"
      } else {
        status = null
      }
      return json({
        receivedPersonalFiles: transformedResponse.personal_files,
        receivedDBFiles: transformedResponse.db_files,
        status: status,
        filters: null,
        workspaceInput: workspaceInput,
      })
    }

    return json({
      receivedPersonalFiles: [],
      receivedDBFiles: [],
      status: null,
      filters: null,
      workspaceInput: workspaceInput,
    })
  } else {
    return json({
      receivedPersonalFiles: [],
      receivedDBFiles: [],
      status: null,
      filters: null,
      workspaceInput: null,
    })
  }
}

export async function action({ request }: ActionFunctionArgs) {
  const token = await requiredUserSession(request)
  const originalFormData = await request.formData()
  const url = new URL(request.url)
  const params = new URLSearchParams(url.search)

  const formIntent = originalFormData.get("intent")
  const urlIntent = params.get("intent")
  const intent = formIntent || urlIntent

  const formData = new FormData()
  for (const [key, value] of originalFormData.entries()) {
    if (key !== "intent") {
      formData.append(key, value)
    }
  }

  const workspaceId = params.get("workspaceId")

  if (intent === "getFilters") {
    const filters = await fetchMetadataFilters(token)
    return json({
      filters: filters,
      receivedPersonalFiles: [],
      receivedDBFiles: [],
      status: null,
    })
  } else if (intent === "filter") {
    const submitFilters = await createMetadataSearchFilters(
      token,
      createMetadataSearchFilters_BEStructure(formData)
    )
    return json({
      newFilters: submitFilters,
      receivedPersonalFiles: [],
      receivedDBFiles: [],
      status: null,
    })
  } else if (intent === "save" && workspaceId) {
    const jsonBody = Object.fromEntries(formData.entries())
    if (jsonBody.data) {
      const parsedData = JSON.parse(jsonBody.data)
      Object.assign(jsonBody, parsedData)
      delete jsonBody.data
    }
    const saveStatus = await saveWorkspaceInput(token, workspaceId, jsonBody)
    return json({
      filters: null,
      receivedPersonalFiles: [],
      receivedDBFiles: [],
      status: saveStatus === 200 ? "saved" : "error saving",
    })
  } else {
    return null
  }
}

export const shouldRevalidate: ShouldRevalidateFunction = ({
  currentParams,
  defaultShouldRevalidate,
  nextParams,
}) => {
  if (currentParams === nextParams) {
    return false
  }
  return defaultShouldRevalidate
}

export function ErrorBoundary() {
  return <ErrorBoundaryComponent isMainRoute={false} />
}
