import React from "react"
import { UseCaseTitleProps } from "./types"
import { faCirclePlay } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"

const UseCaseTitle: React.FC<UseCaseTitleProps> = ({
  title,
  subtitle,
  videoLink,
  description,
}) => {
  return (
    <div className="text-secondary dark:text-white">
      <div className="flex flex-row mb-[10px] mt-16">
        <h1 className="text-4xlbold leading-10">{title}</h1>
        {videoLink && (
          <FontAwesomeIcon
            icon={faCirclePlay}
            //onClick={() => setShowVideoModal(true)}
          />
        )}
      </div>

      <h2 className="text-2xl leading-6 mb-[30px]">{subtitle}</h2>
      <p className="dark:text-white">{description}</p>
    </div>
  )
}

export default UseCaseTitle
