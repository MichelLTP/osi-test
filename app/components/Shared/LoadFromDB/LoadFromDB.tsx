import { LoadFromDBProps } from "./type"
import React from "react"
import MultipleSelectorV2 from "@/components/ui/MultipleSelectorV2/MultipleSelectorV2"
import {
  DocumentOption,
  Option,
} from "@/components/ui/MultipleSelectorV2/types"

const transformToOption = (
  files: File[] | Option[] | Document[]
): DocumentOption[] => {
  if (!Array.isArray(files) || files.length === 0) return []
  const firstItem = files[0] as any

  if ("value" in firstItem && "label" in firstItem) {
    return files as Option[]
  }

  if ("doc_id" in firstItem && "doc_name" in firstItem) {
    return (files as File[]).map((file) => ({
      value: file.doc_id,
      label: file.doc_name,
    }))
  }

  if ("id" in firstItem && "filename" in firstItem) {
    return (files as Document[]).map((doc) => ({
      value: doc.id,
      label: doc.filename,
      custom: doc.custom,
      isPrivate: doc.isPrivate,
      group:
        doc.group ||
        (doc.isPrivate ? "Private Documents" : "Open SI Documents"),
    }))
  }
  return files as Option[]
}

const LoadFromDB: React.FC<LoadFromDBProps> = ({
  files,
  uploadFile,
  onRemoveBadge,
  singleSelection = false,
  selectedFiles,
}) => {
  const onUpload = (value: string) => {
    uploadFile([value])
  }

  const transformedFiles = transformToOption(files)

  return (
    <>
      <MultipleSelectorV2
        selectFirstItem={false}
        value={selectedFiles}
        handleSelection={onUpload}
        hideClearAllButton
        options={transformedFiles}
        onRemoveBadge={onRemoveBadge}
        maxSelected={singleSelection ? 1 : undefined}
        groupBy="group"
        showBadges={false}
        placeholder="Choose documents"
        shouldFilter
        className="px-1 sm:px-3"
      />
    </>
  )
}

export default LoadFromDB
