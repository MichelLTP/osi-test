import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faEye } from "@fortawesome/free-solid-svg-icons"
import clsx from "clsx"
import { Link } from "@remix-run/react"
import { DiscoverMoreProps } from "@/components/Discovery/types"

const DiscoverMoreCard = ({
  image_url,
  description,
  uuid,
  title,
  views,
  index,
}: DiscoverMoreProps) => {
  return (
    <Link
      to={"/discovery/" + uuid}
      prefetch={"render"}
      className={clsx(
        "flex text-left justify-between items-start flex-col w-48 border border-third-dark dark:border-white rounded-[12px] " +
          "sm:items-start gap-y-3 gap-x-5 dark:bg-secondary-dark overflow-hidden transition-all hover:shadow-lg hover:opacity-85"
      )}
    >
      <div className={"w-full object-cover"}>
        <img
          src={"/img/res/" + image_url}
          alt={title + " image"}
          className="w-full max-h-[100px] object-cover dark:bg-third"
        />
      </div>
      <div className="flex flex-col gap-y-2 px-4 sm:px-5">
        <p className="text-xs font-bold ">{title}</p>
        <p className="text-xs leading-tight text-left line-clamp-2">
          {description}
        </p>
      </div>
      <div className="flex text-xxs items-center px-4 sm:px-5 pb-4 sm:pb-5">
        <FontAwesomeIcon
          icon={faEye}
          className={"text-secondary dark:text-white mr-1"}
        />
        {views}
      </div>
    </Link>
  )
}
export default DiscoverMoreCard
