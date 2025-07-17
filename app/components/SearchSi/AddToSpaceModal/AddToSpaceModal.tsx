import React, { useEffect, useState } from "react"
import Modal from "@/components/Shared/Modal/Modal"
import SingleSelection from "@/components/Shared/SingleSelection/SingleSelection"
import { Button } from "@/components/ui/Button/Button"
import { useFetcher } from "@remix-run/react"
import { Skeleton } from "@/components/ui/Skeleton/Skeleton"
import { faBookmark } from "@fortawesome/free-solid-svg-icons"
import { loader } from "@/routes/searchSpaces._index"
import { AddToSpaceModalProps } from "@/components/SearchSi/AddToSpaceModal/types"
import { toast } from "@/hooks/useToast"

const AddToSpaceModal: React.FC<AddToSpaceModalProps> = ({
  open,
  onClose,
  documentTitle,
  documentId,
}) => {
  const fetcher = useFetcher<typeof loader>()
  const [options, setOptions] = useState<{ value: string; label: string }[]>([])
  const [selectedSpace, setSelectedSpace] = useState<string>("")
  const [isLoading, setIsLoading] = useState<boolean>(true)

  useEffect(() => {
    if (open) {
      fetcher.load("/searchSpaces?index")
    }
  }, [open])

  useEffect(() => {
    if (fetcher.data && Array.isArray(fetcher.data.initialSpaces)) {
      setOptions(
        fetcher.data.initialSpaces.map((space) => ({
          value: space.workspace_id,
          label: space.title,
          docIds: space.doc_ids || [],
          description: space.description,
          writingStyle: space?.instructions,
        }))
      )
      setIsLoading(false)
    }
  }, [fetcher.data])
  useEffect(() => {
    if (
      fetcher.state === "loading" &&
      fetcher.data?.workspace_id &&
      fetcher.data?.status?.toString() === "200"
    ) {
      toast({
        title: "Space Edited",
        description: fetcher.data?.message,
        variant: "success",
      })
    }
    if (
      (fetcher.state === "idle" &&
        fetcher.data?.status?.toString() === "500") ||
      fetcher.data?.status?.toString() === "400"
    ) {
      toast({
        title: "Error",
        description: fetcher.data?.message || "An error has occurred",
        variant: "error",
      })
    }
  }, [fetcher, onClose])

  if (!open) return null

  const addToSpace = () => {
    if (selectedSpace) {
      const selectedOption = options.find(
        (option) => option.value === selectedSpace
      )

      let docIds = selectedOption?.docIds ?? []
      if (docIds.includes(documentId)) {
        toast({
          title: "Document already in space",
          variant: "success",
        })
        onClose()
      } else {
        docIds = [...docIds, documentId]
        const title = selectedOption?.label || ""
        const description = selectedOption?.description || ""
        const writingStyle = selectedOption?.writingStyle || ""
        fetcher.submit(
          {
            files: docIds.join(","),
            title,
            description,
            writingStyle,
            intent: "edit",
          },
          {
            method: "patch",
            action: `/searchSpaces/spaces/${selectedSpace}/edit`,
          }
        )
        onClose()
      }
    }
  }
  return (
    <Modal
      title="Add to Space"
      size="x-small"
      handleClose={onClose}
      icon={faBookmark}
      variant={"confirmation"}
      confirmationProps={{
        actionText: "Add to Space",
        handleAction: addToSpace,
      }}
    >
      <div className="mb-8">
        Add the document "<span className="font-semibold">{documentTitle}</span>
        " to a Space?
      </div>
      {isLoading ? (
        <Skeleton className="h-12 rounded-xs mb-8" />
      ) : options?.length > 0 ? (
        <SingleSelection
          options={options}
          value={selectedSpace}
          handleValueChange={(option: string) => setSelectedSpace(option)}
          placeholder="Select a space"
          triggerClasses={"mb-8"}
        />
      ) : (
        <p>No Spaces available. Please create a Space first.</p>
      )}
    </Modal>
  )
}

export default AddToSpaceModal
