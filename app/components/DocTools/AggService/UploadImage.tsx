import FileUploadProgress from "@/components/Shared/FileUploadProgress/FileUploadProgress"
import { FileUploadState } from "@/components/Shared/UploadFile/types"
import UploadFile from "@/components/Shared/UploadFile/UploadFile"
import { Button } from "@/components/ui/Button/Button"
import { faPaperPlane } from "@fortawesome/free-solid-svg-icons"
import { useFetcher } from "@remix-run/react"
import { useEffect, useState } from "react"

const UploadImage = () => {
  const fetcher = useFetcher<{
    response?: string
  }>()
  const [files, setFiles] = useState<File[]>([])
  const [uploadState, setUploadState] = useState<FileUploadState>(
    FileUploadState.INITIAL
  )

  const onUpload = (acceptedFiles: File[]) => {
    setFiles((prevFiles) => [...prevFiles, ...acceptedFiles])
  }

  const onCancelUpload = () => {
    setFiles([])
    setUploadState(FileUploadState.INITIAL)
  }

  const onProcessDocument = () => {
    setUploadState(FileUploadState.UPLOADING)
    const formData = new FormData()
    files.forEach((file) => {
      formData.append("files", file)
    })
    formData.append("session_id", "")
    fetcher.submit(formData, {
      method: "post",
      encType: "multipart/form-data",
      action: "?intent=processDocument",
    })
  }

  useEffect(() => {
    if (Number(fetcher.data?.response) === 200) {
      setUploadState(FileUploadState.DONE)
      setTimeout(() => setUploadState(FileUploadState.INITIAL), 5000)
    }
  }, [fetcher.state])

  return (
    <>
      {" "}
      <UploadFile
        onUpload={onUpload}
        state={uploadState}
        acceptedFileTypes="documents"
      />
      <FileUploadProgress
        acceptedFiles={files}
        onCancelUpload={onCancelUpload}
        loading={uploadState === FileUploadState.UPLOADING}
      />
      <div className="w-full flex justify-end">
        <Button
          variant="default"
          icon={faPaperPlane}
          className="w-fit mt-10 text-base font-normal "
          disabled={uploadState === FileUploadState.UPLOADING}
          onClick={() => {
            onProcessDocument()
          }}
        >
          Process document
        </Button>
      </div>
    </>
  )
}

export default UploadImage
