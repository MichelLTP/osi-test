import { useEffect, useState } from "react"
import { FileUploadState } from "../UploadFile/types"
import UploadFile from "../UploadFile/UploadFile"
import FileUploadProgress from "../FileUploadProgress/FileUploadProgress"
import LoadFromDB from "../LoadFromDB/LoadFromDB"
import { useSearchParams } from "@remix-run/react"
import { useSources } from "@/store/openstory"
import { Option } from "../LoadFromDB/type"
import { DBFileInfo } from "./type"
import useLocalDBFilesStore from "@/store/localDB"

export default function UploadFileOrLoadFromDB({
  sourceId,
  sectionId,
}: {
  sourceId: number
  sectionId: number
}) {
  const {
    sources,
    addDBFilesToSection,
    removeDBFilesFromSection,
    removeUploadedFileFromSection,
    addUploadedFilesToSection,
    importedParameters,
    setImportedParametesFlag,
  } = useSources()

  const [searchParams] = useSearchParams()
  const [uploadState, setUploadState] = useState<FileUploadState>(
    FileUploadState.INITIAL
  )

  const { localDBFiles } = useLocalDBFilesStore()
  const [dbFiles, setDBFiles] = useState<DBFileInfo[]>([])
  const [localFiles, setLocalFiles] = useState<File[]>([])
  const [filteredDBFiles, setFilteredDBFiles] = useState<DBFileInfo[]>([])

  const onDBFileUpload = (acceptedFiles: Option[]) => {
    const refactoredFiles = acceptedFiles.map((file) => ({
      doc_name: file.label,
      doc_id: file.value,
    }))
    setDBFiles((prevFiles) => [...prevFiles, ...refactoredFiles])
    addDBFilesToSection(sourceId, sectionId, refactoredFiles)
  }

  const onCancelDBUpload = (file: DBFileInfo) => {
    const newFileControllers = dbFiles.filter(
      (c) => c.doc_name !== file.doc_name
    )
    setDBFiles(newFileControllers)
    removeDBFilesFromSection(sourceId, sectionId, file)
    setUploadState(FileUploadState.INITIAL)
  }

  const onLocalUpload = (acceptedFiles: File[]) => {
    setLocalFiles((prevFiles) => [...prevFiles, ...acceptedFiles])
    addUploadedFilesToSection(sourceId, sectionId, acceptedFiles)
  }

  const onCancelLocalUpload = (file: File) => {
    const newFileControllers = localFiles.filter((c) => c.name !== file.name)
    setLocalFiles(newFileControllers)
    removeUploadedFileFromSection(sourceId, sectionId, file.name)
    setUploadState(FileUploadState.INITIAL)
  }

  //Update DB files when import parameters is used
  useEffect(() => {
    if (importedParameters) {
      setDBFiles([])
      setLocalFiles([])
      const source = sources.find((src) => src.id === sourceId)
      if (source) {
        const section = source.sections.find((sec) => sec.id === sectionId)
        if (section) {
          if (section.db_documents) {
            setDBFiles(section.db_documents)
            setImportedParametesFlag(false)
          }
        }
      }
    }
  }, [importedParameters])

  //If DB files are selected, filter the original files
  useEffect(() => {
    if (dbFiles.length > 0) {
      const updatedLocalDBFiles = localDBFiles.filter((localFile) =>
        dbFiles.every((dbFile) => dbFile.doc_name !== localFile.doc_name)
      )
      setFilteredDBFiles(updatedLocalDBFiles)
    } else {
      setFilteredDBFiles(localDBFiles)
    }
  }, [dbFiles, localDBFiles])

  const TabsProps = {
    tabs: [
      {
        id: "?tab=upload-file",
        label: "Upload file",
        content: (
          <div>
            <UploadFile
              onUpload={onLocalUpload}
              state={uploadState}
              acceptedFileTypes="documents"
            />
            <FileUploadProgress
              acceptedFiles={localFiles}
              onCancelUpload={onCancelLocalUpload}
              loading={uploadState === FileUploadState.UPLOADING}
            />
          </div>
        ),
        isMarkdown: false,
      },
      {
        id: "?tab=load-from-database",
        label: "Load from database",
        content: (
          <div>
            <LoadFromDB files={filteredDBFiles} uploadFile={onDBFileUpload} />
            <FileUploadProgress
              acceptedFiles={dbFiles}
              onCancelUpload={onCancelDBUpload}
              loading={uploadState === FileUploadState.UPLOADING}
            />
          </div>
        ),
        isMarkdown: false,
      },
    ],
    classes: {
      selected:
        "text-md flex items-center px-8 pb-2 focus:transition-color justify-center text-primary border-b-2 border-primary",
      notSelected:
        "text-md flex items-center px-8 pb-2 focus:transition-color justify-center text-secondary dark:text-white text-nowrap border-b border-secondary ",
    },
  }

  const [tabSelected, setTabSelected] = useState(() => {
    const tabParam = searchParams.get("tab")
    const index = TabsProps.tabs.findIndex(
      (tab) => tabParam && tab.id.includes(tabParam)
    )
    return index > -1 ? index : 0
  })

  const handleTabChange = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    index: number
  ) => {
    event.preventDefault()
    setTabSelected(index)
  }

  return (
    <>
      <div className="w-full grid grid-cols-2 pt-8">
        {TabsProps.tabs.map((tab, index) => (
          <button
            key={index}
            className={`${index !== tabSelected && "dark:border-third-dark"} ${
              index === tabSelected
                ? TabsProps.classes.selected
                : TabsProps.classes.notSelected
            }`}
            onClick={(event) => handleTabChange(event, index)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="w-full pt-8">{TabsProps.tabs[tabSelected].content}</div>
    </>
  )
}
