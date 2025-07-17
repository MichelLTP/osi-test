import FileUploadProgress from "@/components/Shared/FileUploadProgress/FileUploadProgress"
import LoadFromDB from "@/components/Shared/LoadFromDB/LoadFromDB"
import {
  AcceptedFile,
  DBFile,
  FileUploadState,
} from "@/components/Shared/UploadFile/types"
import UploadFile from "@/components/Shared/UploadFile/UploadFile"
import { Label } from "@/components/ui/Label/Label"
import { useAdminPanelDiscoveryStore } from "@/store/AdminPanel/discovery"
import { useFetcher } from "@remix-run/react"
import { useEffect, useState } from "react"

const DocumentSources = () => {
  const [uploadState, setUploadState] = useState<FileUploadState>(
    FileUploadState.INITIAL
  )
  const {
    addUploadDocument,
    setDocuments,
    setSource,
    removeSource,
    removeDocument,
    removeUploadDocument,
    documents,
    sources,
  } = useAdminPanelDiscoveryStore()
  const [localDBFiles, setLocalDBFiles] = useState<DBFile[]>([])
  const [sourcesDB, setSourcesDB] = useState<AcceptedFile[]>([])
  const [files, setFiles] = useState<(File | AcceptedFile)[]>([])
  const fetcher = useFetcher<{ localDBFiles: DBFile[] }>()

  const onUpload = (acceptedFiles: File[]) => {
    setFiles((prevFiles) => [...prevFiles, ...acceptedFiles])
    acceptedFiles.forEach((file) => {
      setDocuments((prev) => [
        ...prev,
        {
          title: file.name,
          matching_filename: file.name,
        },
      ])
    })
    acceptedFiles.forEach((file) => {
      addUploadDocument(file as File)
    })
  }

  const onUploadDBFiles = (acceptedFiles: AcceptedFile[]) => {
    setSourcesDB((prevFiles) => [...prevFiles, ...acceptedFiles])
    const updatedLocalDBFiles = localDBFiles.filter(
      (localFile) =>
        !acceptedFiles.some(
          (acceptedFile) => acceptedFile.label === localFile.doc_name
        )
    )
    setLocalDBFiles(updatedLocalDBFiles)
    acceptedFiles.forEach((file) => {
      setSource((prev) => [
        ...prev,
        {
          id: file?.value,
          title: file?.label,
        },
      ])
    })
  }

  //Remove function for uploaded documents
  const onCancelUpload = (file: AcceptedFile) => {
    let newFileControllers = []
    if (file?.title !== undefined) {
      newFileControllers = files.filter((c) => c.title !== file.title)
      removeDocument(file.title)
    } else {
      newFileControllers = files.filter((c) => c.name !== file.name)
      removeDocument(file.name)
      removeUploadDocument(file.name)
    }

    setFiles(newFileControllers)
    setUploadState(FileUploadState.INITIAL)
  }

  // Remove function for selected sources
  const onCancelUploadLocalDB = (file: AcceptedFile) => {
    let newFileControllers = []

    // sources from the BE
    if (file?.publisher !== undefined) {
      newFileControllers = sourcesDB.filter((c) => c.title !== file.title)
      removeSource(file.id)
      //sources from the local DB
    } else {
      newFileControllers = sourcesDB.filter((c) => c.name !== file.name)
      removeSource(file.value)
    }
    setSourcesDB(newFileControllers)
    setUploadState(FileUploadState.INITIAL)
  }

  useEffect(() => {
    if (files.length == 0 && documents.length !== 0) {
      setFiles(documents)
    }
    if (sourcesDB.length == 0 && sources.length !== 0) {
      setSourcesDB(sources)
    }
    if (localDBFiles?.length === 0) {
      fetcher.load(`/documentTools/adminPanel/addDiscovery?intent=loadDB`)
    }
  }, [])

  useEffect(() => {
    if (fetcher.data && fetcher.data.localDBFiles?.length > 0) {
      setLocalDBFiles(fetcher.data.localDBFiles)
    }
  }, [fetcher.data])

  return (
    <div className="flex flex-col md:flex-row gap-8">
      <div className=" w-full md:w-1/2 gap-2 flex flex-col">
        <Label>Attached relevant docs (máx. 3)</Label>
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
      </div>
      <div className="w-full md:w-1/2 gap-2 flex flex-col">
        <Label>Open SI Doc IDs</Label>
        <LoadFromDB files={localDBFiles} uploadFile={onUploadDBFiles} />
        {sourcesDB?.length > 0 && (
          <FileUploadProgress
            acceptedFiles={sourcesDB}
            onCancelUpload={onCancelUploadLocalDB}
            loading={uploadState === FileUploadState.UPLOADING}
          />
        )}
      </div>
    </div>
  )
}

export default DocumentSources
