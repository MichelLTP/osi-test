import React from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faCheck, faXmark } from "@fortawesome/free-solid-svg-icons"
import { FileType, FileUploadProgressProps } from "./type"
import { cn } from "@/utils/shadcn/utils"
import { Loader2 } from "lucide-react"
import clsx from "clsx"

const FileUploadProgress: React.FC<FileUploadProgressProps> = ({
  acceptedFiles,
  onCancelUpload,
  loading,
  variant,
  className,
  isScrollable = false,
  scrollableCount = 5,
}) => {
  const getFileName = (file: FileType | Document): string => {
    if (typeof file === "string") return file
    if (file instanceof File) return file.name
    if ("doc_name" in file) return file.doc_name || ""
    if ("title" in file && typeof file.title === "string")
      return file.title || ""
    if ("name" in file) return file.name || ""
    if ("label" in file) return file.label || ""
    if ("filename" in file && typeof file.filename === "string")
      return file.filename || ""
    if ("path" in file && typeof file.path === "string") return file.path || ""
    return ""
  }

  return (
    <ul
      className={cn(
        "py-3",
        isScrollable ? `overflow-y-auto styled-scrollbar pr-4` : "",
        className
      )}
      style={{
        maxHeight: isScrollable ? `${scrollableCount * 35}px` : "none",
      }}
    >
      {acceptedFiles?.map((file, index) => (
        <li key={index} className="flex items-center gap-2 text-xs ">
          {loading ? (
            <Loader2 className={clsx("animate-spin w-5 h-5 text-primary")} />
          ) : variant === "documents" ? (
            <FontAwesomeIcon
              icon={faCheck}
              size="lg"
              className="text-success"
            />
          ) : (
            <FontAwesomeIcon
              icon={faCheck}
              size="lg"
              className="text-primary"
            />
          )}
          <span className="text-base text-sm">
            {variant === "documents" && file?.custom && (
              <span className="font-bold">{file.custom} </span>
            )}
            {getFileName(file)}
          </span>
          <button
            className={"ml-auto"}
            type="button"
            onClick={() => onCancelUpload && onCancelUpload(file)}
          >
            <FontAwesomeIcon
              icon={faXmark}
              size="lg"
              style={{ color: "#de574d" }}
            />
          </button>
        </li>
      ))}
    </ul>
  )
}

export default FileUploadProgress
