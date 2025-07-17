import React from "react"
import { Loader2 } from "lucide-react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faPlus } from "@fortawesome/free-solid-svg-icons"
import { Link } from "@remix-run/react"
import { AddNewProps } from "@/components/SearchSpaces/AddNew/types"
import { IconProp } from "@fortawesome/fontawesome-svg-core"

const AddNew = ({
  isLoading,
  url = "",
  type = "space",
  action = "create",
  onClick = () => {},
}: AddNewProps) => {
  return (
    <Link
      to={url}
      onClick={onClick}
      className="flex gap-x-5 text-secondary dark:text-white text-sm w-[257px] p-5 mb-10 mt-12 border border-primary rounded-sm hover:border-secondary dark:border-white dark:hover:border-primary transition-colors overflow-hidden group"
    >
      {isLoading ? (
        <Loader2 className={"animate-spin text-primary -mr-3"} />
      ) : (
        <FontAwesomeIcon
          icon={faPlus as IconProp}
          size="lg"
          className="text-primary pt-1 flex-shrink-0 group-hover:text-secondary dark:text-white dark:group-hover:text-primary transition-colors"
        />
      )}
      <div className="overflow-hidden">
        <strong className="line-clamp-3">Add {type}</strong>
        <p>
          <span className="capitalize">{action}</span> a new {type}
        </p>
      </div>
    </Link>
  )
}
export default AddNew
