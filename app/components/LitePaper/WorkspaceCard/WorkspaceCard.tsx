import DropdownContent from "@/components/ui/DropdownContent/DropdownContent"
import { faEye, faTrashCan } from "@fortawesome/free-regular-svg-icons"
import {
  faEllipsis,
  faFile,
  faPeopleGroup,
} from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { useNavigate } from "@remix-run/react"
import { WorkspaceCardProps } from "../types"
import { useLitePaper } from "@/store/litepaper"
import { IconProp } from "@fortawesome/fontawesome-svg-core"

export default function WorkspaceCard({
  cardICon,
  workspace,
  handleDelete,
}: WorkspaceCardProps) {
  const navigate = useNavigate()
  const litePaper = useLitePaper()

  const menuTrigger = (
    <FontAwesomeIcon
      icon={faEllipsis}
      onClick={(e) => {
        e.preventDefault()
      }}
    />
  )

  const menuItems = [
    {
      text: "View",
      action: () => {
        litePaper.resetLitePaper()
        navigate(`response?workspaceId=${workspace.id}`)
      },
      icon: faEye,
      disabled: false,
    },
    {
      text: "Delete",
      action: () => {
        handleDelete(workspace.id as string)
      },
      icon: faTrashCan,
      danger: true,
      disabled: false,
    },
  ]
  return (
    <div
      key={workspace.id}
      className="space-y-4 min-h-[175px] transition-colors group bg-third dark:bg-secondary-dark text-secondary dark:text-third rounded-xs p-6 relative cursor-pointer border duration-300 border-transparent hover:border-primary"
    >
      <div className="flex justify-between items-start dark:text-white">
        <div className="flex items-center gap-4 min-h-[40px]">
          <FontAwesomeIcon
            icon={faFile}
            size="xl"
            className="text-secondary dark:text-white transition-colors group-hover:text-primary"
          />
          <span className="text-xlbold leading-tight line-clamp-2 group-hover:text-primary transition-colors">
            {workspace.name}
          </span>
        </div>

        <div
          onClick={(e) => e.stopPropagation()}
          className="ml-4 group-hover:text-primary transition-colors"
        >
          <DropdownContent
            items={menuItems}
            align="end"
            direction="bottom"
            variant="grey"
            customTrigger={menuTrigger}
          />
        </div>
      </div>

      <div className="flex dark:text-white">
        <p className="line-clamp-3 text-xs leading-snug min-h-[46px]">
          {workspace.description}
        </p>
      </div>

      <div className="flex justify-between items-center mt-2">
        <div className="text-xs font-medium flex gap-2 items-center dark:text-white">
          {workspace.authors === "The Agentcy" && (
            <>
              <FontAwesomeIcon icon={faPeopleGroup as IconProp} size="sm" />
              {workspace.authors}
            </>
          )}
        </div>
        <span className="text-xs dark:text-white">{workspace.date}</span>
      </div>
    </div>
  )
}
