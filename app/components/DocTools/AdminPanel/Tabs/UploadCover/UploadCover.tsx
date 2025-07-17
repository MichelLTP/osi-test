import FileUploadProgress from "@/components/Shared/FileUploadProgress/FileUploadProgress"
import { AcceptedFile } from "@/components/Shared/UploadFile/types"
import UploadFile from "@/components/Shared/UploadFile/UploadFile"
import { Label } from "@/components/ui/Label/Label"
import { useAdminPanelDiscoveryStore } from "@/store/AdminPanel/discovery"
import { useEffect, useState } from "react"

const UploadCover = () => {
  const [currentFile, setCurrentFile] = useState<File | AcceptedFile | null>(
    null
  )
  const { setHeaderImage, addUploadImage, image, removeUploadImage } =
    useAdminPanelDiscoveryStore()

  const onUpload = (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const newFile = acceptedFiles[0]
      setCurrentFile(newFile)
    }
  }

  useEffect(() => {
    if (currentFile) {
      setHeaderImage({
        position: "TOP",
        matching_filename: currentFile.name,
        title: currentFile.name,
      })
      addUploadImage(currentFile as File)
    }
  }, [currentFile, setHeaderImage, addUploadImage])

  const onCancelUpload = () => {
    currentFile?.name && removeUploadImage(currentFile?.name)
    setCurrentFile(null)
    setHeaderImage(null)
  }

  return (
    <div className="w-full gap-2 flex flex-col md:w-1/2">
      <Label>Attach header image*</Label>
      <UploadFile onUpload={onUpload} acceptedFileTypes="images" />
      {(currentFile !== null || image !== null) && (
        <FileUploadProgress
          acceptedFiles={
            currentFile ? [currentFile] : image ? [{ label: image.title }] : []
          }
          onCancelUpload={onCancelUpload}
        />
      )}
    </div>
  )
}

export default UploadCover
