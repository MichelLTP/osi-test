import React from "react"
import { Link, useNavigate } from "@remix-run/react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons"
import { IconDefinition } from "@fortawesome/fontawesome-svg-core"

const BackButton = ({
  customClick,
  customURL,
}: {
  customClick?: () => void
  customURL?: string
}) => {
  const navigate = useNavigate()

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()

    if (customClick) {
      customClick()
    } else if (customURL) {
      navigate(customURL)
    } else {
      navigate(-1) // Browser back
    }
  }

  return (
    <Link
      to="#"
      className={
        "flex w-full text-[23px] my-5 opacity-40 transition-opacity duration-300 hover:opacity-100"
      }
      onClick={handleClick}
    >
      <FontAwesomeIcon
        icon={faArrowLeft as IconDefinition}
        className="cursor-pointer"
      />
    </Link>
  )
}
export default BackButton
