import {
  faFile,
  faFileAudio,
  faFileImage,
} from "@fortawesome/free-regular-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import React, { useEffect, useState } from "react"
import Dropzone, { Accept } from "react-dropzone"
import { useLocation } from "@remix-run/react"
import { FileType, UploadFileProps } from "./types"
import { Loader2 } from "lucide-react"
import clsx from "clsx"

export enum FileUploadState {
  INITIAL = "INITIAL",
  UPLOADING = "UPLOADING",
  ERROR = "ERROR",
  DONE = "DONE",
}

const MAX_FILE_SIZE = 200 * 1024 * 1024 // 200MB

const ACCEPTED_FILE_TYPES: Record<FileType, Accept> = {
  documents: {
    "application/pdf": [".pdf"],
    "text/plain": [".txt"],
    "application/msword": [".doc"],
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [
      ".docx",
    ],
  },
  images: {
    "image/jpeg": [".jpg", ".jpeg"],
    "image/png": [".png"],
    "image/gif": [".gif"],
    "image/webp": [".webp"],
  },
  audio: {
    "audio/mpeg": [".mp3"],
    "audio/wav": [".wav"],
    "audio/ogg": [".ogg"],
    "audio/aac": [".aac"],
  },
  all: {
    "application/pdf": [".pdf"],
    "text/plain": [".txt"],
    "application/msword": [".doc"],
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [
      ".docx",
    ],
    "image/jpeg": [".jpg", ".jpeg"],
    "image/png": [".png"],
    "image/gif": [".gif"],
    "image/webp": [".webp"],
    "audio/mpeg": [".mp3"],
    "audio/wav": [".wav"],
    "audio/ogg": [".ogg"],
    "audio/aac": [".aac"],
  },
}

const getFileTypeIcon = (fileType: FileType) => {
  switch (fileType) {
    case "images":
      return faFileImage
    case "audio":
      return faFileAudio
    default:
      return faFile
  }
}

const getFileTypeText = (fileType: FileType) => {
  switch (fileType) {
    case "documents":
      return "PDF, TXT, DOC, or DOCX"
    case "images":
      return "JPG, PNG, GIF, or WEBP"
    case "audio":
      return "MP3, WAV, OGG, or AAC"
    default:
      return "documents, images, or audio files"
  }
}

const UploadFile: React.FC<UploadFileProps> = ({
  onUpload,
  state = FileUploadState.INITIAL,
  acceptedFileTypes = "all",
  maxFiles,
}) => {
  const [isClient, setIsClient] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const error = "Some files were rejected. Please check the file type and size."
  const success = "Files uploaded successfully!"
  const location = useLocation()

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) return null

  return (
    <Dropzone
      onDrop={onUpload}
      onDragEnter={() => setIsDragging(true)}
      onDragLeave={() => setIsDragging(false)}
      accept={ACCEPTED_FILE_TYPES[acceptedFileTypes]}
      maxSize={MAX_FILE_SIZE}
      maxFiles={location.pathname.includes("summarization") ? 1 : 0}
      multiple={!location.pathname.includes("summarization")}
    >
      {({ getRootProps, getInputProps }) => (
        <section>
          <div
            {...getRootProps()}
            className={`border-dotted border-2 transition duration-300 ease-in-out ${
              isDragging
                ? "border-primary"
                : "border-primary dark:border-white hover:border-opacity-30 dark:hover:border-opacity-30"
            } rounded-sm p-8 focus:outline-none `}
            role="button"
            tabIndex={0}
            aria-label="Upload file dropzone"
          >
            <input {...getInputProps()} />
            <div className="flex flex-row justify-center items-center gap-4">
              <div>
                {state === 1 ? (
                  <Loader2
                    className={clsx("animate-spin w-10 h-10 text-primary")}
                  />
                ) : (
                  <FontAwesomeIcon
                    icon={getFileTypeIcon(acceptedFileTypes)}
                    size="2xl"
                    className="text-primary"
                  />
                )}
              </div>
              {state === FileUploadState.UPLOADING ? (
                <p>
                  Processing file, this may take up to 15 minutes, depending on
                  file size and complexity
                </p>
              ) : (
                <div>
                  <p>
                    <span className="text-primary">Upload a file</span> or drag
                    and drop
                  </p>
                  <p className="text-xxs opacity-60">
                    {getFileTypeText(acceptedFileTypes)}{" "}
                    {`up to 200MB ${maxFiles ? `max ${maxFiles} files` : ""}`}
                  </p>
                </div>
              )}
            </div>
          </div>
          {state === FileUploadState.ERROR && (
            <p className="text-red-500 mt-2">{error}</p>
          )}
          {state === FileUploadState.DONE && (
            <p className="text-green-500 mt-2">{success}</p>
          )}
        </section>
      )}
    </Dropzone>
  )
}

export default UploadFile
