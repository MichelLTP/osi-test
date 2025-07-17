import React, { useEffect, useState } from "react"
import Checkbox from "@/components/ui/Checkbox/Checkbox"
import { Button } from "@/components/ui/Button/Button"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faCheck, faSliders, faUpload } from "@fortawesome/free-solid-svg-icons"
import { DocumentSelectionProps } from "./type"
import { Item } from "@/components/ui/Checkbox/types"
import LoadFromDB from "../LoadFromDB/LoadFromDB"
import FileUploadProgress from "../FileUploadProgress/FileUploadProgress"
import { Filters } from "../Filters/Filters"
import LoadingStatus from "@/components/Shared/LoadingStatus/LoadingStatus"
import { DBLoadState } from "../LoadFromDB/type"
import { Document } from "@/components/LitePaper/types"
import useLocalDBFilesStore from "@/store/localDB"
import PrivateLibraryUploader from "../PrivateLibraryUploader/PrivateLibraryUploader"
import { usePrivateLibrary } from "@/store/privateLibrary"
import { useFiltersStore } from "@/store/filters"

const DocumentSelectionV2: React.FC<DocumentSelectionProps> = ({
  openSiDocs,
  privateDocs,
  selectedOpenSiDocs,
  selectedPrivateDocs,
  fileTypes,
  onFileUpload,
  onCancelUpload,
  filters,
  handleShowFilters,
  shouldLoadDocs,
  checkboxSize = "md",
  isDocUploadEnabled = true,
  hasCheckboxes = true,
  isSelectedDocsScrollable = false,
  scrollableCount = 5,
  singleSelection = false,
  filterSelectedDocs = true,
}) => {
  const [showFilters, setShowFilters] = useState<boolean>(false)
  const [optionsList, setOptionsList] = useState<Document[]>([])
  const [selectedList, setSelectedList] = useState<Document[]>([])

  const { isLoadingDocs } = useLocalDBFilesStore()
  const { setIsModalOpen } = usePrivateLibrary()
  const { isFiltersSelected } = useFiltersStore()

  const [docTypes, setDocTypes] = useState([
    {
      value: "Open SI Documents",
      key: "1",
      disabled: false,
      checked: fileTypes === "openSi" || fileTypes === "both" || false,
    },
    {
      value: "Private Documents",
      key: "2",
      disabled: false,
      checked: fileTypes === "private" || fileTypes === "both" || false,
    },
    {
      value: "Private Collections",
      key: "3",
      disabled: true,
      checked: false,
    },
  ])

  useEffect(() => {
    const newOptionsList: Document[] = []
    let newSelectedList: Document[] = []
    const allowedDocs = filters.groups
      ?.flatMap((group) => group.fields || [])
      .find((field) => field.key === "document_title")?.options as
      | string[]
      | undefined
    const shouldFilter = Array.isArray(allowedDocs) && allowedDocs.length > 0
    if (shouldFilter && filterSelectedDocs) {
      selectedOpenSiDocs.forEach((doc) => {
        if (!allowedDocs!.includes(doc.filename)) {
          onCancelUpload(doc)
        }
      })
    }

    docTypes.forEach((type) => {
      if (type.value === "Private Documents" && type.checked) {
        newOptionsList.push(
          ...privateDocs.map((doc) => ({
            ...doc,
            custom: "Private |",
            isPrivate: true,
            group: "Private Documents",
            label: doc.filename,
            value: doc.id,
          }))
        )
        newSelectedList.push(
          ...selectedPrivateDocs.map((doc) => ({
            ...doc,
            custom: "Private |",
            isPrivate: true,
            group: "Private Documents",
            label: doc.filename,
            value: doc.id,
          }))
        )
      }
      if (type.value === "Open SI Documents" && type.checked) {
        newOptionsList.push(
          ...openSiDocs
            .filter(
              (doc) => !shouldFilter || allowedDocs.includes(doc.filename)
            )
            .map((doc) => ({
              ...doc,
              custom: "Open SI |",
              isPrivate: false,
              group: "Open SI Documents",
              label: doc.filename,
              value: doc.id,
            }))
        )
        newSelectedList.push(
          ...selectedOpenSiDocs.map((doc) => ({
            ...doc,
            custom: "Open SI |",
            isPrivate: false,
            group: "Open SI Documents",
            label: doc.filename,
            value: doc.id,
          }))
        )
        if (filterSelectedDocs) {
          newSelectedList = newSelectedList.filter(
            (doc) => !shouldFilter || allowedDocs.includes(doc.filename)
          )
        }
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
    onCancelUpload,
  ])

  useEffect(() => {
    const useDB =
      docTypes.find((doc) => doc.value === "Open SI Documents")?.checked ||
      false
    const usePrivate =
      docTypes.find((doc) => doc.value === "Private Documents")?.checked ||
      false
    if (useDB || usePrivate) {
      shouldLoadDocs?.(useDB, usePrivate)
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
      {showFilters && (
        <Filters filterData={filters} setShowFilters={setShowFilters} />
      )}
      <div className="grid grid-cols-1 lg:grid-cols-2 lg:gap-x-10 gap-y-8">
        <div>
          {isLoadingDocs === DBLoadState.LOADING ? (
            <div className="py-1">
              <LoadingStatus statusMessage={{ body: "Loading Documents..." }} />
            </div>
          ) : (
            <fieldset
              disabled={!docTypes.some((docType) => docType.checked)}
              className="flex items-center bg-third dark:bg-secondary-dark rounded-xs pl-3 sm:pl-6"
            >
              <Button
                variant="ghost"
                size={"sm"}
                onClick={handleTriggerFilters}
                disabled={
                  !docTypes.find((doc) => doc.value === "Open SI Documents")
                    ?.checked
                }
                className="max-w-[200px]"
              >
                <div className="relative flex sm:mt-0.5 mr-2">
                  <FontAwesomeIcon icon={faSliders} />
                  {isFiltersSelected && (
                    <FontAwesomeIcon
                      icon={faCheck}
                      className="bg-success rounded-full text-white scale-[0.5] !w-5 !h-5 p-1 absolute -top-[10px] -right-3"
                    />
                  )}
                </div>
                <span className={"font-normal"}>Filters</span>
              </Button>
              <LoadFromDB
                selectedFiles={selectedList}
                files={optionsList}
                uploadFile={onFileUpload}
                onRemoveBadge={onCancelUpload}
                singleSelection={singleSelection}
              />
            </fieldset>
          )}
          {hasCheckboxes && (
            <Checkbox
              size={checkboxSize}
              row
              items={docTypes}
              onClick={handleToggle}
              className={"mt-5"}
            />
          )}
          {isDocUploadEnabled && (
            <PrivateLibraryUploader>
              <Button
                variant="borderGhost"
                icon={faUpload}
                className="text-base font-normal w-full sm:w-fit px-8 mt-12"
                onClick={() => setIsModalOpen(true)}
              >
                Private Library
              </Button>
            </PrivateLibraryUploader>
          )}
        </div>

        <FileUploadProgress
          acceptedFiles={selectedList}
          onCancelUpload={onCancelUpload}
          isScrollable={isSelectedDocsScrollable}
          scrollableCount={scrollableCount}
          variant={"documents"}
          className="space-y-3 py-0"
        />
      </div>
    </>
  )
}
export default DocumentSelectionV2
