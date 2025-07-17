import React, { useEffect, useState } from "react"
import Checkbox from "@/components/ui/Checkbox/Checkbox"
import { Button } from "@/components/ui/Button/Button"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faCheck, faSliders } from "@fortawesome/free-solid-svg-icons"
import { DocumentSelectionProps } from "./type"
import { Item } from "@/components/ui/Checkbox/types"
import LoadFromDB from "../LoadFromDB/LoadFromDB"
import FileUploadProgress from "../FileUploadProgress/FileUploadProgress"
import { FileUploadState } from "../UploadFile/types"
import { Filters } from "../Filters/Filters"
import LoadingStatus from "@/components/Shared/LoadingStatus/LoadingStatus"
import { DBLoadState } from "../LoadFromDB/type"
import clsx from "clsx"
import { useCloseSidebar } from "@/store/layout"
import { useLitePaper } from "@/store/litepaper"
import { Document } from "@/components/LitePaper/types"
import useLocalDBFilesStore from "@/store/localDB"

const DocumentSelection: React.FC<DocumentSelectionProps> = ({
  openSiDocs,
  filesTypes,
  required,
  privateDocs,
  selectedOpenSiDocs,
  selectedPrivateDocs,
  onFileUpload,
  onCancelUpload,
  uploadState,
  dbLoadState,
  shouldImport,
  filters,
  handleShowFilters,
  litePaperInfo,
  checkboxSize,
}) => {
  const [showFilters, setShowFilters] = useState(false)
  const litePaper = useLitePaper() //TODO: This should be moved out of the litePaper Ecosystem
  const isSidebarClosed = useCloseSidebar((state) => state.close)
  const { isLoadingDocs } = useLocalDBFilesStore()

  const [docTypes, setDocTypes] = useState([
    {
      value: "Open SI Documents",
      key: "1",
      disabled: false,
      checked:
        filesTypes === "openSi" ||
        filesTypes === "both" ||
        litePaperInfo?.isDBChecked ||
        false,
    },
    {
      value: "Private Documents",
      key: "2",
      disabled: false,
      checked:
        filesTypes === "private" ||
        filesTypes === "both" ||
        litePaperInfo?.isPrivateChecked ||
        false,
    },
    {
      value: "Private Collections",
      key: "3",
      disabled: true,
      checked: false,
    },
  ])

  const [optionsList, setOptionsList] = useState<Document[]>([])
  const [selectedList, setSelectedList] = useState<Document[]>([])

  useEffect(() => {
    const newOptionsList: Document[] = []
    const newSelectedList: Document[] = []
    const allowedDocs = filters.groups
      ?.flatMap((group) => group.fields || [])
      .find((field) => field.key === "document_title")?.options as
      | string[]
      | undefined
    const shouldFilter = Array.isArray(allowedDocs) && allowedDocs.length > 0
    if (shouldFilter) {
      selectedOpenSiDocs.forEach((doc) => {
        if (!allowedDocs!.includes(doc.filename)) {
          onCancelUpload(doc)
        }
      })
    }

    docTypes.forEach((type) => {
      if (type.value === "Private Documents" && type.checked === true) {
        newOptionsList.push(
          ...privateDocs.map((doc) => ({
            ...doc,
            custom: "Private |",
            isPrivate: true,
          }))
        )
        newSelectedList.push(
          ...selectedPrivateDocs.map((doc) => ({
            ...doc,
            custom: "Private |",
            isPrivate: true,
          }))
        )
      }
      if (type.value === "Open SI Documents" && type.checked === true) {
        newOptionsList.push(
          ...openSiDocs
            .filter(
              (doc) => !shouldFilter || allowedDocs.includes(doc.filename)
            )
            .map((doc) => ({
              ...doc,
              custom: "Open SI |",
              isPrivate: false,
            }))
        )
        newSelectedList.push(
          ...selectedOpenSiDocs
            .filter(
              (doc) => !shouldFilter || allowedDocs.includes(doc.filename)
            )
            .map((doc) => ({
              ...doc,
              custom: "Open SI |",
              isPrivate: false,
            }))
        )
      }
    })

    setOptionsList(newOptionsList)
    setSelectedList(newSelectedList)
  }, [
    docTypes,
    openSiDocs,
    privateDocs,
    selectedOpenSiDocs,
    selectedPrivateDocs,
    filters,
  ])

  useEffect(() => {
    const useDB =
      docTypes.find((doc) => doc.value === "Open SI Documents")?.checked ||
      false
    const usePrivate =
      docTypes.find((doc) => doc.value === "Private Documents")?.checked ||
      false
    if (useDB || usePrivate) {
      shouldImport?.(useDB, usePrivate)
    }

    if (litePaperInfo && litePaper) {
      litePaper.updateSectionOrSubsectionField(
        litePaperInfo.childUuid,
        { is_opensi_selected: useDB, is_private_selected: usePrivate },
        litePaperInfo.parentUuid !== "" ? litePaperInfo.parentUuid : undefined
      )
    }
  }, [docTypes])

  const handleToggle = (updatedItem: Item) => {
    setDocTypes((prev) =>
      prev.map((item) =>
        item.key === updatedItem.key
          ? { ...item, checked: !item.checked }
          : item
      )
    )
  }

  const handleTriggerFilters = () => {
    setShowFilters(true)
    if (Object?.keys(filters)?.length === 0) {
      handleShowFilters()
    }
  }
  return (
    <>
      <fieldset>
        <div className={"mb-4 text-basebold"}>
          Choose Documents {required && " (máx. 5 files)*"}
        </div>
      </fieldset>

      <fieldset
        className={clsx(
          "grid grid-cols-2 md:grid-cols-1 lg:grid-cols-[170px_1fr_1fr] gap-4 items-start",
          !isSidebarClosed && "lg:!grid-cols-1 xl:grid-cols-3"
        )}
      >
        <Button
          variant="outline"
          size={"sm"}
          onClick={handleTriggerFilters}
          disabled={
            !(isLoadingDocs !== DBLoadState.LOADING) ||
            !docTypes.find((doc) => doc.value === "Open SI Documents")?.checked
          }
          className="max-w-[200px]"
        >
          <div className="relative flex mt-0.5 mr-2">
            <FontAwesomeIcon icon={faSliders} />
            {filters && Object.keys(filters).length !== 0 && (
              <FontAwesomeIcon
                icon={faCheck}
                className="bg-success rounded-full text-white scale-[0.5] !w-5 !h-5 p-1 absolute -top-[10px] -right-3"
              />
            )}
          </div>
          <span className={"font-normal"}>Open SI Filters</span>
        </Button>
        {showFilters && (
          <Filters
            filterData={filters}
            setShowFilters={setShowFilters}
            litePaperUuids={
              litePaperInfo
                ? {
                    childUuid: litePaperInfo.childUuid,
                    parentUuid: litePaperInfo.parentUuid,
                  }
                : undefined
            }
          />
        )}
        <div className={"col-span-2"}>
          <Checkbox
            size={checkboxSize}
            row
            items={docTypes}
            onClick={handleToggle}
          />
        </div>
      </fieldset>

      <fieldset>
        <div className="col-span-2 mt-4 w-full min-h-[90px]">
          <fieldset disabled={!docTypes.some((docType) => docType.checked)}>
            {dbLoadState === DBLoadState.LOADING ? (
              <div className="py-1">
                <LoadingStatus
                  statusMessage={{ body: "Loading Documents..." }}
                />
              </div>
            ) : (
              <LoadFromDB
                files={optionsList}
                uploadFile={onFileUpload}
                variant={"documents"}
              />
            )}
            <div className="flex justify-between gap-4">
              <FileUploadProgress
                acceptedFiles={selectedList}
                onCancelUpload={onCancelUpload}
                loading={uploadState === FileUploadState.UPLOADING}
                variant={"documents"}
              />
            </div>
          </fieldset>
        </div>
      </fieldset>
    </>
  )
}
export default DocumentSelection
