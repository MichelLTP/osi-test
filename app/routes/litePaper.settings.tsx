import { useEffect, useState } from "react"
import { faPenToSquare, faPlus } from "@fortawesome/free-solid-svg-icons"
import { FileUploadState } from "@/components/Shared/UploadFile/types"
import {
  useFetcher,
  ShouldRevalidateFunction,
  useNavigate,
  json,
} from "@remix-run/react"
import { requiredUserSession } from "@/data/auth/session.server"
import {
  createUserWorkspace,
  updateUserWorkspace,
  UploadPrivateFiles,
} from "@/data/litepaper/litepaper.server"
import { ActionFunctionArgs, redirect } from "@remix-run/node"
import { ErrorBoundaryComponent } from "@/components/ui/ErrorBoundaryComponent/ErrorBoundaryComponent"
import { useLitePaper } from "@/store/litepaper"
import { hasChatSISubtype } from "@/utils/litepaper"
import LitePaperSettings from "@/components/LitePaper/LitePaperSettings/LitePaperSettings"
import useLocalDBFilesStore from "@/store/localDB"
import Modal from "@/components/Shared/Modal/Modal"

const Settings = () => {
  const fetcher = useFetcher<{ status: string; workspaceId: any }>()
  const litePaper = useLitePaper()
  const { setLocalPrivateFiles } = useLocalDBFilesStore()
  const [uploadState, setUploadState] = useState<FileUploadState>(
    FileUploadState.INITIAL
  )
  const [privateFiles, setPrivateFiles] = useState<File[]>([])
  const navigate = useNavigate()

  const onPrivateFileUpload = (acceptedFiles: File[]) => {
    setUploadState(FileUploadState.INITIAL)
    setPrivateFiles((prevFiles) => [...prevFiles, ...acceptedFiles])
  }

  const onCancelPrivateFile = (file: File) => {
    const newFileControllers = privateFiles.filter((c) => c.name !== file.name)
    setPrivateFiles(newFileControllers)
    setUploadState(FileUploadState.INITIAL)
  }

  const handleSubmit = (): void => {
    const formData = new FormData()
    formData.append("name", litePaper.paperName)
    formData.append("description", litePaper.description)
    formData.append("subtitle", litePaper.subtitle)
    formData.append("authors", litePaper.authors)
    formData.append("writing_style", litePaper.writingStyle)

    if (privateFiles.length !== 0) {
      setUploadState(FileUploadState.UPLOADING)
      if (typeof privateFiles !== "string" && privateFiles.length > 0) {
        privateFiles.forEach((f) => formData.append("files", f))
      }
      const queryParams = new URLSearchParams()
      queryParams.append("intent", "upload")
      const currentParams = new URLSearchParams(window.location.search)
      const workspaceId = currentParams.get("workspaceId")

      if (workspaceId) {
        queryParams.append("workspaceId", workspaceId as string)
      }
      fetcher.submit(formData, {
        method: "post",
        encType: "multipart/form-data",
        action: `?${queryParams.toString()}`,
      })
    } else {
      fetcher.submit(formData, {
        method: "post",
        encType: "multipart/form-data",
      })
    }
  }

  const newPaperHandlers = {
    uploadState,
    privateFiles,
    setPrivateFiles,
    onPrivateFileUpload,
    onCancelPrivateFile,
    handleSubmit,
  }

  useEffect(() => {
    if (fetcher.data) {
      const { status, workspaceId } = fetcher.data

      if (status && status === "success") {
        setUploadState(FileUploadState.DONE)
        setPrivateFiles([])
        if (hasChatSISubtype(litePaper.sections)) {
          setLocalPrivateFiles([])
        }
      }
      navigate(`/litePaper/slides?workspaceId=${workspaceId}`)
    }
  }, [fetcher.data])

  return (
    <Modal
      title={litePaper.paperName !== "" ? "Edit Paper" : "New Paper"}
      icon={litePaper.paperName !== "" ? faPenToSquare : faPlus}
      size={"default"}
      handleClose={() => {
        navigate(-1)
      }}
    >
      <LitePaperSettings {...newPaperHandlers} />
    </Modal>
  )
}

export default Settings

export async function action({ request }: ActionFunctionArgs) {
  const token = await requiredUserSession(request)

  let workspaceId

  const formData = await request.formData()
  const url = new URL(request.url)
  const intent = url.searchParams.get("intent")
  workspaceId = url.searchParams.get("workspaceId")

  const workspaceData = new FormData()
  const filesData = new FormData()

  for (const [key, value] of formData.entries()) {
    if (
      key === "name" ||
      key === "description" ||
      key === "authors" ||
      key === "subtitle" ||
      key === "writing_style"
    ) {
      workspaceData.append(key, value)
    } else if (key === "files") {
      filesData.append(key, value)
    }
  }

  if (workspaceId) {
    const workspaceStatus = await updateUserWorkspace(
      token,
      workspaceData,
      workspaceId
    )
  } else {
    workspaceId = await createUserWorkspace(token, workspaceData)
  }

  if (intent == "upload") {
    const status = await UploadPrivateFiles(token, filesData)
    const resultStatus = status === 200 ? "success" : "error"
    return json({ status: resultStatus, workspaceId: workspaceId })
  } else {
    return redirect(`/litePaper/slides?workspaceId=${workspaceId}`)
  }
}

export const shouldRevalidate: ShouldRevalidateFunction = ({
  currentParams,
  defaultShouldRevalidate,
  nextParams,
}) => {
  if (currentParams === nextParams) {
    return false
  }
  return defaultShouldRevalidate
}

export function ErrorBoundary() {
  return <ErrorBoundaryComponent isMainRoute={false} />
}
