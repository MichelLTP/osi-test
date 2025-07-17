import React from "react"
import { Button } from "@/components/ui/Button/Button"
import { faCheck } from "@fortawesome/free-solid-svg-icons"
import { faCopy, faEdit } from "@fortawesome/free-regular-svg-icons"
import { OutputActionsProps } from "@/components/LitePaper/OutputActions/types"

const OutputActions = ({
  isEditing,
  handleEdit,
  handleCopy,
  handleSave,
}: OutputActionsProps) => {
  return (
    <footer className="flex items-center justify-end gap-4">
      {isEditing ? (
        <Button
          variant="ghost"
          icon={faCheck}
          className="hover:text-success dark:hover:text-success"
          onClick={handleSave}
        >
          Save
        </Button>
      ) : (
        <Button
          variant="ghost"
          icon={faEdit}
          className="dark:text-white"
          onClick={() => handleEdit(true)}
        >
          Edit
        </Button>
      )}
      <Button
        variant="ghost"
        icon={faCopy}
        className="dark:text-white"
        onClick={handleCopy}
      >
        Copy
      </Button>
    </footer>
  )
}
export default OutputActions
