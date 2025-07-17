import FileUploadProgress from "@/components/Shared/FileUploadProgress/FileUploadProgress"
import {
  AcceptedFile,
  FileUploadState,
} from "@/components/Shared/UploadFile/types"
import UploadFile from "@/components/Shared/UploadFile/UploadFile"
import { Label } from "@/components/ui/Label/Label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select/Select"
import { useAdminPanelDiscoveryStore } from "@/store/AdminPanel/discovery"
import { useState } from "react"

const UploadImage = ({
  sectionIndex,
  domain,
  imageName,
}: {
  sectionIndex: number
  domain: string
  imageName: string
}) => {
  const [uploadState, setUploadState] = useState<FileUploadState>(
    FileUploadState.INITIAL
  )
  const [currentFile, setCurrentFile] = useState<File | AcceptedFile | null>(
    null
  )
  const [imagePos, setImagePos] = useState<"BOTTOM" | "TOP">("TOP")

  const {
    sections,
    updateSection,
    key_questions,
    updateKeyQuestion,
    addUploadImage,
  } = useAdminPanelDiscoveryStore()

  const isKeyQuestions = domain === "Key Questions"
  const items = isKeyQuestions ? key_questions : sections
  const updateItem = isKeyQuestions ? updateKeyQuestion : updateSection

  const imagePosition = [
    { value: "BOTTOM", label: "Bottom" },
    { value: "TOP", label: "Top" },
    { value: "RIGHT", label: "Right" },
    { value: "LEFT", label: "Left" },
  ]

  const onUpload = (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const newFile = acceptedFiles[0]
      setCurrentFile(newFile)
      addUploadImage(newFile)

      const currentItem = items[sectionIndex]

      if (currentItem) {
        updateItem(sectionIndex, {
          ...currentItem,
          image: {
            position: imagePos,
            matching_filename: newFile.name,
            title: newFile.name,
          },
        })
      }
    }
  }

  const onCancelUpload = () => {
    setCurrentFile(null)
    setUploadState(FileUploadState.INITIAL)

    const currentItem = items[sectionIndex]
    if (currentItem) {
      updateItem(sectionIndex, {
        ...currentItem,
        image: null,
      })
    }
  }

  const handlePositionChange = (value: string) => {
    setImagePos(value as "BOTTOM" | "TOP")
    const currentItem = items[sectionIndex]
    if (currentItem?.image && currentItem) {
      updateItem(sectionIndex, {
        ...currentItem,
        image: {
          ...currentItem.image,
          position: value as "TOP" | "BOTTOM" | "RIGHT" | "LEFT",
        },
      })
    }
  }

  return (
    <div className="flex flex-col">
      <h5 className="text-base border-b border-black pb-2 dark:border-white">
        Upload an image
      </h5>
      <div className="flex flex-col mt-9 gap-16 md:flex-row">
        <div className="flex flex-col w-full gap-2 md:w-1/2">
          <Label>Attach a relevante image</Label>
          <UploadFile
            onUpload={onUpload}
            state={uploadState}
            acceptedFileTypes="images"
          />
          {(currentFile !== null || imageName !== null) && (
            <FileUploadProgress
              acceptedFiles={
                currentFile
                  ? [currentFile]
                  : imageName
                    ? [{ label: imageName }]
                    : []
              }
              onCancelUpload={onCancelUpload}
              loading={uploadState === FileUploadState.UPLOADING}
            />
          )}
        </div>
        <div className="flex flex-col w-full gap-7 md:w-1/2">
          <div className="flex flex-col gap-2">
            <Label className="text-base">Image Position</Label>
            <Select value={imagePos} onValueChange={handlePositionChange}>
              <SelectTrigger className="dark:bg-secondary-dark dark:text-white bg-white dark:border">
                <SelectValue placeholder="Position" />
              </SelectTrigger>
              <SelectContent className="rounded-xs shadow-md bg-white dark:bg-secondary-dark dark:text-white focus-within:border-primary transition-[border-color] duration-300 focus-within:border-opacity-15 focus-within:border border border-transparent">
                {imagePosition.map((position) => (
                  <SelectItem
                    key={position.value}
                    className="rounded-xs hover:bg-primary"
                    value={position.value}
                  >
                    {position.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UploadImage
