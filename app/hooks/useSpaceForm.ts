import { useState, useEffect, useMemo } from "react"
import { useNavigate } from "@remix-run/react"
import useLocalDBFilesStore from "@/store/localDB"
import { useFiltersStore } from "@/store/filters"
import { DBLoadState } from "@/components/Shared/LoadFromDB/type"
import { FilterData } from "@/components/Shared/Filters/types"
import { Document } from "@/components/LitePaper/types"
import { useLoadingState } from "@/store/layout"
import {
  SpaceFormData,
  SpaceFormProps,
} from "@/components/SearchSpaces/SpaceFormModal/types"
import { DocumentOption } from "@/components/ui/MultipleSelectorV2/types"

export function useSpaceForm({
  loaderDBFiles,
  filters,
  spaceData,
  cancelNavigation,
}: SpaceFormProps): SpaceFormData {
  const [title, setTitle] = useState<string>(spaceData?.title)
  const [description, setDescription] = useState<string>(spaceData?.description)
  const [writingStyle, setWritingStyle] = useState<string>(
    spaceData?.instructions
  )
  const [filteredDBFiles, setFilteredDBFiles] = useState<Document[]>([])
  const { setLoadingState } = useLoadingState()
  const navigate = useNavigate()
  const {
    localDBFiles,
    setLocalDBFiles,
    handleFileUpload,
    handleCancelUpload,
    setIsLoadingDocs,
    allDocs,
    resetAllDocs,
  } = useLocalDBFilesStore()

  const selectedDBFiles: Document[] = useMemo(
    () => (allDocs.opensi_documents || []) as Document[],
    [allDocs.opensi_documents]
  )
  const {
    setUpdatedFilterData,
    updatedFilterData,
    setInitialFiltersData,
    setFilters,
    setIsFiltersSelected,
  } = useFiltersStore()

  useEffect(() => {
    if (spaceData?.doc_ids) {
      const initialOptions: DocumentOption[] = spaceData?.doc_ids.map(
        (doc: string, index: number) => ({
          label: spaceData?.doc_names[index],
          value: doc,
        })
      )
      handleFileUpload(initialOptions)
    }
  }, [spaceData])

  useEffect(() => {
    setIsLoadingDocs(DBLoadState.LOADING)
    setLoadingState(true)
    if (loaderDBFiles) {
      const dbFilesAsOptions: DocumentOption[] = loaderDBFiles.map((doc) => ({
        value: doc.id,
        label: doc.filename,
        id: doc.id,
      }))
      setLocalDBFiles(dbFilesAsOptions)
    }
    setIsLoadingDocs(DBLoadState.DONE)
    if (filters) {
      setInitialFiltersData(filters)
      setFilters(filters)
      setUpdatedFilterData(filters)
      setIsFiltersSelected(false)
      setLoadingState(false)
    }
  }, [loaderDBFiles, filters])

  useEffect(() => {
    const localDocs: Document[] = (localDBFiles || []).map(
      (file: DocumentOption) => ({
        id: file.id ?? file.value,
        filename: file.label,
      })
    )
    if (selectedDBFiles.length > 0) {
      setFilteredDBFiles(
        localDocs.filter((localFile: Document) =>
          selectedDBFiles.every(
            (dbFile: Document) => dbFile.id !== localFile.id
          )
        )
      )
    } else {
      setFilteredDBFiles(localDocs)
    }
  }, [selectedDBFiles, localDBFiles])

  const resetForm = () => {
    setTitle("")
    setDescription("")
    resetAllDocs()
    setFilters({} as FilterData)
    setIsFiltersSelected(false)
    setUpdatedFilterData({} as FilterData)
    setLocalDBFiles([])
    setInitialFiltersData({} as FilterData)
  }

  const closeModal = () => {
    resetForm()
    navigate(cancelNavigation)
  }

  return {
    title,
    setTitle,
    writingStyle,
    setWritingStyle,
    description,
    setDescription,
    filteredDBFiles,
    selectedDBFiles,
    handleFileUpload,
    handleCancelUpload,
    updatedFilterData,
    closeModal,
    resetForm,
  }
}
