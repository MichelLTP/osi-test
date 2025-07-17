import TextArea from "@/components/ui/TextArea/TextArea"
import { Document, DocumentsSection } from "@/components/LitePaper/types"
import DocumentSelection from "@/components/Shared/DocumentSelection/DocumentSelection"
import { useEffect, useMemo, useState } from "react"
import { FileUploadState } from "@/components/Shared/UploadFile/types"
import { useCloseSidebar, useLoadingState } from "@/store/layout"
import { useFetcher } from "@remix-run/react"
import { action } from "@/routes/litePaper.slides"
import clsx from "clsx"
import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/RadioGroup/RadioGroup"
import { Label } from "@/components/ui/Label/Label"
import { Columns2, Rows2 } from "lucide-react"
import { useLitePaper } from "@/store/litepaper"
import useLocalDBFilesStore from "@/store/localDB"
import { DocumentOption } from "@/components/ui/MultipleSelectorV2/types"

const ChatSiSubtype = ({
  section,
  inputsUuid = "",
}: {
  section: DocumentsSection
  inputsUuid: string
}) => {
  const litePaper = useLitePaper()
  const receivedFiles = useLocalDBFilesStore()
  const selectedDBFiles = useMemo(
    () => section.opensi_documents || [],
    [section.opensi_documents]
  )
  const selectedPrivateFiles = useMemo(
    () => section.private_documents || [],
    [section.private_documents]
  )
  const [filteredDBFiles, setFilteredDBFiles] = useState<Document[]>([])
  const [filteredPrivateFiles, setFilteredPrivateFiles] = useState<Document[]>(
    []
  )
  const [uploadState, setUploadState] = useState<FileUploadState>(
    FileUploadState.INITIAL
  )
  const { setNeedLoadState, isLoadingDocs } = useLocalDBFilesStore()
  const fetcher = useFetcher<typeof action>()
  const { setLoadingState } = useLoadingState()
  const isSidebarClosed = useCloseSidebar((state) => state.close)
  const defaultOptions = [
    { label: "Columns", DisplayIcon: Columns2 },
    { label: "Single block", DisplayIcon: Rows2 },
  ]

  const handleDisplayChange = (value: string) => {
    litePaper.updateSectionOrSubsectionField(
      section.uuid,
      { layout_metadata: { ...section.layout_metadata, displayMode: value } },
      inputsUuid
    )
  }

  const onFileUpload = (acceptedFiles: DocumentOption[]) => {
    const opensi_docs = acceptedFiles
      .filter((file) => !file.isPrivate)
      .map((file) => ({
        id: file.value as number,
        filename: file.label as string,
      }))

    const private_docs = acceptedFiles
      .filter((file) => file.isPrivate)
      .map((file) => ({
        id: file.value as number,
        filename: file.label as string,
      }))

    litePaper.updateSectionOrSubsectionField(
      section.uuid,
      {
        opensi_documents: opensi_docs,
        private_documents: private_docs,
      },
      inputsUuid !== "" ? inputsUuid : undefined,
      true
    )
  }

  const onCancelUpload = (fileToRemove: Document) => {
    let currentObj
    if (inputsUuid !== "") {
      currentObj = useLitePaper
        .getState()
        .sections.find((s) => s.uuid === inputsUuid && s.type === "Subsections")
        ?.subsections?.find(
          (s) => s.uuid === section.uuid && s.type === "Documents"
        )
    } else {
      currentObj = useLitePaper
        .getState()
        .sections.find((s) => s.uuid === section.uuid && s.type === "Documents")
    }

    if (currentObj) {
      const newOpensiDocs = (currentObj.opensi_documents || []).filter(
        (doc: Document) => doc.id !== fileToRemove.id
      )
      const newPrivateDocs = (currentObj.private_documents || []).filter(
        (doc: Document) => doc.id !== fileToRemove.id
      )

      litePaper.updateSectionOrSubsectionField(
        section.uuid,
        { opensi_documents: newOpensiDocs, private_documents: newPrivateDocs },
        inputsUuid !== "" ? inputsUuid : undefined,
        false
      )
      setUploadState(FileUploadState.INITIAL)
    }
  }

  const shouldImport = (loadDB: boolean, loadPrivate: boolean) => {
    setNeedLoadState(loadDB, loadPrivate)
  }

  const handleShowFilters = () => {
    if (
      section.layout_metadata.metadata_options === null ||
      section.layout_metadata.metadata_options === undefined ||
      Object.keys(section.layout_metadata.metadata_options).length === 0
    ) {
      setLoadingState(true)
      fetcher.submit(
        {},
        {
          method: "post",
          action: `/litePaper/slides?intent=getFilters`,
        }
      )
    }
  }

  useEffect(() => {
    if (
      fetcher.data?.filters &&
      (section.layout_metadata.metadata_options === null ||
        section.layout_metadata.metadata_options === undefined ||
        Object.keys(section.layout_metadata.metadata_options).length === 0)
    ) {
      litePaper.updateSectionOrSubsectionField(
        section.uuid,
        {
          layout_metadata: {
            ...section.layout_metadata,
            metadata_options: fetcher.data.filters,
            metadata_firstOptions: fetcher.data.filters,
          },
        },
        inputsUuid !== "" ? inputsUuid : undefined
      )
      setLoadingState(false)
    }
  }, [fetcher.state, fetcher.data?.filters])

  useEffect(() => {
    if (selectedDBFiles.length > 0) {
      const updatedLocalDBFiles = receivedFiles.localDBFiles.filter(
        (localFile) =>
          selectedDBFiles.every((dbFile) => dbFile.id !== localFile.id)
      )
      setFilteredDBFiles(updatedLocalDBFiles)
    } else {
      setFilteredDBFiles(receivedFiles.localDBFiles)
    }

    if (selectedPrivateFiles.length > 0) {
      const updatedLocalPrivateFiles = receivedFiles.localPrivateFiles.filter(
        (localFile) =>
          selectedPrivateFiles.every(
            (privateFile) => privateFile.id !== localFile.id
          )
      )
      setFilteredPrivateFiles(updatedLocalPrivateFiles)
    } else {
      setFilteredPrivateFiles(receivedFiles.localPrivateFiles)
    }
  }, [
    selectedPrivateFiles,
    selectedDBFiles,
    receivedFiles.localDBFiles,
    receivedFiles.localPrivateFiles,
  ])

  const selectionHandlers = {
    onFileUpload,
    onCancelUpload,
    uploadState,
    dbLoadState: isLoadingDocs,
    shouldImport,
    filters: section.layout_metadata.metadata_options || [],
    handleShowFilters,
    litePaperInfo: {
      childUuid: section.uuid,
      parentUuid: inputsUuid || "",
      isPrivateChecked: section.is_private_selected,
      isDBChecked: section.is_opensi_selected,
    },
  }

  return (
    <div
      className={clsx(
        "col-span-full",
        inputsUuid !== "" && "grid grid-cols-1 md:grid-cols-2 gap-4 w-full"
      )}
    >
      <fieldset
        className={clsx(
          "col-span-2",
          !isSidebarClosed && "col-span-3 2xl:col-span-2"
        )}
      >
        <DocumentSelection
          openSiDocs={filteredDBFiles}
          privateDocs={filteredPrivateFiles}
          selectedOpenSiDocs={selectedDBFiles}
          selectedPrivateDocs={selectedPrivateFiles}
          filesTypes="none"
          {...selectionHandlers}
        />
      </fieldset>
      <fieldset
        className={clsx(
          "col-span-2 lg:col-span-1",
          !isSidebarClosed && "col-span-3 lg:col-span-3 2xl:col-span-1"
        )}
      >
        <label
          className={"text-base"}
          htmlFor={`section-${section?.uuid}-document-prompt`}
        >
          Prompt
        </label>
        <TextArea
          id={`section-${section?.uuid}-document-prompt`}
          name={`section-${section?.uuid}-document-prompt`}
          rows="5"
          placeholder="What would you like to know?"
          className="mt-3 rounded-xs bg-third dark:bg-[#484954] dark:text-white border-0"
          value={"prompt" in (section || {}) ? section.prompt : ""}
          onChange={(e) => {
            inputsUuid !== ""
              ? litePaper.updateSectionOrSubsectionField(
                  section.uuid,
                  { prompt: e.target.value },
                  inputsUuid
                )
              : litePaper.updateSectionOrSubsectionField(section.uuid, {
                  prompt: e.target.value,
                })
          }}
        />
      </fieldset>
      {inputsUuid !== "" && (
        <fieldset className={"col-span-1 ml-2"}>
          <label
            className={"text-basebold mt-3"}
            htmlFor={`section-${section?.layout_metadata.displayId}-structured-radio`}
          >
            Display mode
          </label>
          <RadioGroup
            className="flex gap-4 md:gap-3 lg:gap-4 mt-3"
            defaultValue={section.layout_metadata.displayMode}
            onValueChange={handleDisplayChange}
          >
            {defaultOptions.map(({ label, DisplayIcon }, index) => (
              <div className="flex items-center gap-3" key={index}>
                <RadioGroupItem
                  className="border-gray-200 bg-third dark:border-gray-500"
                  value={label}
                  id={label}
                />
                <Label className="text-[12px]" htmlFor={label}>
                  {label}
                </Label>
                <DisplayIcon size={14} strokeWidth={1} />
              </div>
            ))}
          </RadioGroup>
        </fieldset>
      )}
    </div>
  )
}
export default ChatSiSubtype
