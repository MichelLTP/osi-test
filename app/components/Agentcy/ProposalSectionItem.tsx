import { Input } from "../ui/Input/Input"
import { Button } from "@/components/ui/Button/Button"
import { faCheck, faMinus, faX } from "@fortawesome/free-solid-svg-icons"
import { faEdit } from "@fortawesome/free-regular-svg-icons"
import { ProposalSectionItemProps } from "@/components/Agentcy/types"
import Modal from "@/components/Shared/Modal/Modal"
import { useState } from "react"

const ProposalSectionItem = ({
  item,
  index,
  isEditing,
  editTitle,
  editSubsections,
  setEditTitle,
  setEditSubsections,
  onSave,
  onCancel,
  onEdit,
  onDelete,
}: ProposalSectionItemProps) => {
  const sectionNumber = index + 1
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  return (
    <>
      {showDeleteModal && (
        <Modal
          title={"Delete Section"}
          hasCancel
          handleClose={() => setShowDeleteModal(false)}
          size={"x-small"}
          variant={"confirmation"}
          confirmationProps={{
            actionText: "Delete",
            handleAction: () => {
              onDelete()
              setShowDeleteModal(false)
            },
          }}
        >
          <p className={"mb-6"}>Do you want to delete this Section?</p>
        </Modal>
      )}
      <li className="text-basebold">
        <span className="flex justify-between items-center gap-2">
          {isEditing ? (
            <div className="flex gap-2 w-full items-center">
              <Input
                className="w-full focus:outline-none dark:bg-secondary-dark"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
              />
              <div className="flex">
                <Button
                  variant="icon"
                  icon={faCheck}
                  className="bg-transparent border-none !p-0 text-success"
                  onClick={onSave}
                />
                <Button
                  variant="icon"
                  icon={faX}
                  className="bg-transparent border-none !p-0 text-error"
                  onClick={onCancel}
                />
              </div>
            </div>
          ) : (
            <>
              {item.title}
              <div className="flex flex-wrap place-content-end">
                <Button variant="underline" icon={faEdit} onClick={onEdit}>
                  Edit
                </Button>
                <Button
                  variant="underline"
                  icon={faMinus}
                  className="text-error dark:text-error"
                  onClick={() => setShowDeleteModal(true)}
                >
                  Delete
                </Button>
              </div>
            </>
          )}
        </span>

        {isEditing ? (
          <div className="mt-1 flex flex-col gap-1 pl-5 font-normal">
            {editSubsections.map((sub, subIdx) => (
              <Input
                key={subIdx}
                className="dark:bg-secondary-dark focus:outline-none w-[calc(100%-76px)]"
                value={typeof sub === "string" ? sub : sub.title}
                onChange={(e) => {
                  const newSubsections = [...editSubsections]
                  if (typeof sub === "string") {
                    newSubsections[subIdx] = e.target.value
                  } else {
                    newSubsections[subIdx] = { ...sub, title: e.target.value }
                  }
                  setEditSubsections(newSubsections)
                }}
              />
            ))}
          </div>
        ) : (
          item.subsection?.length > 0 && (
            <div className="mt-1 flex flex-col gap-1 pl-5 font-normal">
              {item.subsection.map((sub, subIdx) => (
                <span key={`${sectionNumber}-${subIdx}`}>
                  {sectionNumber}.{subIdx + 1}{" "}
                  {typeof sub === "string" ? sub : sub.title || ""}
                </span>
              ))}
            </div>
          )
        )}
      </li>
    </>
  )
}

export default ProposalSectionItem
