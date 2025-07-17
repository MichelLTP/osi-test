import { motion } from "framer-motion"
import TextAnimation from "../TextAnimation/TextAnimation"
import VersionIcon from "../VersionIcon/VersionIcon"
import { OppeningTitleProps } from "./types"
import { faCirclePlay } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import VideoModal from "../VideoModal/VideoModal"
import { useState } from "react"

export default function OpenningTitle({
  primaryText,
  secondaryText,
  version,
  videoLink,
}: OppeningTitleProps) {
  const [showVideoModal, setShowVideoModal] = useState(false)
  return (
    <div>
      {version && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 1, ease: "easeOut" }}
          className="flex justify-end mb-2"
        >
          <VersionIcon version={version} />
        </motion.div>
      )}
      <div className="flex flex-col items-center justify-center">
        {videoLink && (
          <div className="flex cursor-pointer items-center justify-center md:justify-end h-10 w-full">
            <FontAwesomeIcon
              icon={faCirclePlay}
              onClick={() => setShowVideoModal(true)}
              className="text-2xl text-secondary hover:text-primary transition-colors duration-200 dark:text-white"
            />
          </div>
        )}
        <h2 className="relative flex flex-wrap justify-center gap-3 text-5xl mb-8 text-center leading-none">
          {primaryText && (
            <span className="text-primary font-bold tracking-tight">
              {primaryText}
            </span>
          )}
          {secondaryText && <TextAnimation text={secondaryText} />}
        </h2>
      </div>
      {showVideoModal && (
        <VideoModal
          title={primaryText || "Welcome to Open-SI"}
          setShowVideoModal={setShowVideoModal}
          link={videoLink || ""}
        />
      )}
    </div>
  )
}
