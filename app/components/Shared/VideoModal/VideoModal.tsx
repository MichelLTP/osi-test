import React from "react"
import Modal from "../Modal/Modal"
import { VideoModalProps } from "./types"

const VideoModal: React.FC<VideoModalProps> = ({
  title,
  setShowVideoModal,
  link,
}) => {
  return (
    <>
      <Modal
        title={title as string}
        handleClose={() => setShowVideoModal(false)}
        size="big"
      >
        <div className="h-[600px]">
          <iframe
            src={link}
            title="YouTube video player"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 w-full h-full"
          ></iframe>
        </div>
      </Modal>
    </>
  )
}

export default VideoModal
