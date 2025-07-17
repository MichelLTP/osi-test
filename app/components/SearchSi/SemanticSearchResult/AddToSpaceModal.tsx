import React, { useEffect, useState } from "react"
import Modal from "@/components/Shared/Modal/Modal"
import SingleSelection from "@/components/Shared/SingleSelection/SingleSelection"
import { Button } from "@/components/ui/Button/Button"
import { useFetcher } from "@remix-run/react"
import { Skeleton } from "@/components/ui/Skeleton/Skeleton"
import { faBookmark } from "@fortawesome/free-solid-svg-icons"
import { loader } from "@/routes/searchSpaces._index"

interface AddToSpaceModalProps {
  open: boolean
  onClose: () => void
  documentTitle: string
  documentId: string
}

const AddToSpaceModal: React.FC<AddToSpaceModalProps> = ({
  open,
  onClose,
  documentTitle,
  documentId,
}) => {
  const fetcher = useFetcher<typeof loader>()
  const [options, setOptions] = useState<{ value: string; label: string }[]>([])
  const [selectedSpace, setSelectedSpace] = useState<string>("")
  const isLoading = open && (!fetcher.data || fetcher.state === "loading")

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
        }))
      )
    }
  }, [fetcher.data])

  if (!open) return null

  const addToSpace = () => {
    console.log("Adding to space:", selectedSpace)
    if (selectedSpace) {
      const selectedOption = options.find(
        (option) => option.value === selectedSpace
      )

      const docIds = [selectedOption?.docIds, documentId]
      const title = selectedOption?.label || ""
      const description = selectedOption?.description || ""

      fetcher.submit(
        { files: docIds, title, description },
        {
          method: "patch",
          action: `/searchSpaces/spaces/${selectedSpace}/edit`,
        }
      )
      onClose()
    }
  }

  return (
    <Modal
      title="Add to Space"
      size="small"
      handleClose={onClose}
      icon={faBookmark}
    >
      <div className="mb-4">
        Add the document "<span className="font-semibold">{documentTitle}</span>
        " to a Space?
      </div>
      {isLoading ? (
        <Skeleton className="h-12" />
      ) : (
        <SingleSelection
          options={options}
          value={selectedSpace}
          handleValueChange={(option) => setSelectedSpace(option)}
          placeholder="Select a space"
        />
      )}
      <div className="flex justify-end gap-2 mt-6">
        <Button variant={"borderGhost"} onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={addToSpace}>Add</Button>
      </div>
    </Modal>
  )
}

export default AddToSpaceModal
