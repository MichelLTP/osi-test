import { Button } from "@/components/ui/Button/Button"
import { faFile, faPaperPlane } from "@fortawesome/free-regular-svg-icons"
import UploadFile from "../UploadFile/UploadFile"
import FileUploadProgress from "../FileUploadProgress/FileUploadProgress"
import { Input } from "@/components/ui/Input/Input"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faMagnifyingGlass, faXmark } from "@fortawesome/free-solid-svg-icons"
import Modal from "../Modal/Modal"
import { useEffect, useState } from "react"
import { AcceptedFile, FileUploadState } from "../UploadFile/types"
import { useActionData, useSubmit } from "@remix-run/react"
import { PersonalFiles, usePrivateLibrary } from "@/store/privateLibrary"
import { Skeleton } from "@/components/ui/Skeleton/Skeleton"
import useLocalDBFilesStore from "@/store/localDB"

export default function PrivateLibraryUploader({
  children,
}: {
  children: React.ReactNode
}) {
  const [uploadState, setUploadState] = useState<FileUploadState>(
    FileUploadState.INITIAL
  )
  const [files, setFiles] = useState<(File | AcceptedFile)[]>([])

  const submit = useSubmit()
  const actionData = useActionData<{ privateLibrary: PersonalFiles[] }>()
  const {
    privateLibraryList,
    isPrivateLibraryLoading,
    isModalOpen,
    setPrivateLibraryList,
    setIsPrivateLibraryLoading,
    setIsModalOpen,
  } = usePrivateLibrary()
  const { handleCancelUpload } = useLocalDBFilesStore()

  const handleClose = () => {
    setIsModalOpen(false)
  }

  const onUpload = (acceptedFiles: File[]) => {
    setFiles((prevFiles) => [...prevFiles, ...acceptedFiles])
  }

  const onCancelUpload = (file: AcceptedFile) => {
    let newFileControllers = []

    if (file.label !== undefined) {
      newFileControllers = files.filter(
        (c) => (c as AcceptedFile).label !== file.label
      )
    } else {
      newFileControllers = files.filter((c) => c.name !== file.name)
    }
    setFiles(newFileControllers)
    setUploadState(FileUploadState.INITIAL)
  }

  const handleProcessDocument = (): void => {
    const formData = new FormData()
    files.forEach((f) => formData.append("files", f as File))

    const data = JSON.stringify({
      metadata_filters: null,
      has_personal_files: true,
      has_db_files: false,
    })

    formData.append("data", data)

    submit(formData, {
      method: "post",
      encType: "multipart/form-data",
      action: `?intent=uploadPrivateDoc`,
    })
    setUploadState(FileUploadState.UPLOADING)
    setIsPrivateLibraryLoading(true)
    setFiles([])
  }

  const deletePrivateDoc = (id: string) => {
    const params = new URLSearchParams()
    params.append(
      "data",
      JSON.stringify({
        metadata_filters: null,
        has_personal_files: true,
        has_db_files: false,
      })
    )
    submit(params, { method: "post", action: `?privateDocId=${id}` })
    setIsPrivateLibraryLoading(true)
  }

  useEffect(() => {
    if (isModalOpen) {
      if (privateLibraryList.length === 0) {
        setIsPrivateLibraryLoading(true)
      }
      const params = new URLSearchParams()
      params.append(
        "data",
        JSON.stringify({
          metadata_filters: null,
          has_personal_files: true,
          has_db_files: false,
        })
      )
      submit(params, { method: "post", action: `?intent=privateLibrary` })
    }
  }, [isModalOpen, submit])

  // Update the store only if new data is received and it's different from current state.
  useEffect(() => {
    if (actionData?.privateLibrary) {
      if (actionData.privateLibrary !== privateLibraryList) {
        setPrivateLibraryList(actionData.privateLibrary)
        setUploadState(FileUploadState.INITIAL)
        setIsPrivateLibraryLoading(false)
      }
    }
  }, [
    actionData,
    privateLibraryList,
    setPrivateLibraryList,
    setIsPrivateLibraryLoading,
    setUploadState,
  ])

  return (
    <>
      {children}
      {isModalOpen && (
        <Modal size="big" title="Private library" handleClose={handleClose}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <section className="flex flex-col gap-3">
              <span className="border-b border-secondary/60 dark:border-third-dark flex w-full pb-2">
                Upload file
              </span>
              <div
                className={`${isPrivateLibraryLoading && "pointer-events-none opacity-50"} mt-3`}
              >
                <UploadFile
                  onUpload={onUpload}
                  state={uploadState}
                  acceptedFileTypes="documents"
                />
              </div>
              <div className="h-[68px] pr-5 overflow-auto styled-scrollbar">
                <FileUploadProgress
                  className="space-y-[5px]"
                  acceptedFiles={files}
                  onCancelUpload={(file) =>
                    onCancelUpload(file as AcceptedFile)
                  }
                  loading={uploadState === FileUploadState.UPLOADING}
                />
              </div>
              <Button
                variant="default"
                icon={faPaperPlane}
                className="text-base font-normal ml-auto max-w-[200px] mt-7"
                onClick={() => {
                  handleProcessDocument()
                }}
                disabled={files.length === 0}
              >
                Process documents
              </Button>
            </section>

            <section className="flex flex-col gap-6">
              <span className="border-b border-secondary/60 dark:border-third-dark flex w-full pb-2">
                Private library
              </span>
              <div className="flex items-center text-secondary/50 bg-third pl-4 rounded-xs">
                <FontAwesomeIcon icon={faMagnifyingGlass} />
                <Input placeholder="Search document" className="outline-none" />
              </div>

              <div className="flex flex-col gap-2 max-h-[106px] overflow-y-auto styled-scrollbar">
                {uploadState === FileUploadState.UPLOADING ||
                isPrivateLibraryLoading ? (
                  <div className="flex flex-col gap-2">
                    <Skeleton className="h-5 w-[250px] rounded-xs" />
                    <Skeleton className="h-5 w-[300px] rounded-xs" />
                    <Skeleton className="h-5 w-[180px] rounded-xs" />
                    <Skeleton className="h-5 w-[220px] rounded-xs" />
                  </div>
                ) : privateLibraryList.length > 0 ? (
                  privateLibraryList.map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <FontAwesomeIcon icon={faFile} className="text-primary" />
                      <span>{item.doc_name}</span>
                      <button
                        onClick={() => {
                          deletePrivateDoc(item.doc_id)
                          handleCancelUpload({
                            ...item,
                            isPrivate: true,
                            id: item.doc_id,
                            filename: "",
                          })
                        }}
                      >
                        <FontAwesomeIcon
                          icon={faXmark}
                          size="lg"
                          style={{ color: "#de574d" }}
                        />
                      </button>
                    </div>
                  ))
                ) : (
                  <span>No document found</span>
                )}
              </div>
            </section>
          </div>
        </Modal>
      )}
    </>
  )
}
