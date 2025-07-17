import {
  json,
  ShouldRevalidateFunction,
  useNavigation,
  useLoaderData,
  useFetcher,
  useNavigate,
} from "@remix-run/react"
import type { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node"
import { faPlus } from "@fortawesome/free-solid-svg-icons"
import { ErrorBoundaryComponent } from "@/components/ui/ErrorBoundaryComponent/ErrorBoundaryComponent"
import React from "react"

import { createSpace } from "@/data/searchspaces/searchSpaces.server"
import { requiredUserSession } from "@/data/auth/session.server"
import { getMenuVariables } from "@/data/menuvariables/menuvariables.server"
import Modal from "@/components/Shared/Modal/Modal"
import { SpaceFormModal } from "@/components/SearchSpaces/SpaceFormModal/SpaceFormModal"
import { useSpaceForm } from "@/hooks/useSpaceForm"
import { toast } from "@/hooks/useToast"
import {
  createMetadataSearchFilters,
  fetchMetadataFilters,
} from "@/data/searchsi/searchSi.server"
import { fetchSessionDocs } from "@/data/litepaper/litepaper.server"
import { DBFile } from "@/components/Shared/UploadFile/types"
import { createMetadataSearchFilters_BEStructure } from "@/utils/metadataFilters"

export default function SearchSpaces_create() {
  const { receivedDBFiles, filters } = useLoaderData<typeof loader>()
  const fetcher = useFetcher<typeof action>()
  const navigate = useNavigate()
  const navigation = useNavigation()
  const isSubmitting =
    navigation.formAction === "/searchSpaces/create" ||
    fetcher.state === "submitting" ||
    navigation.state === "submitting"

  const form = useSpaceForm({
    loaderDBFiles: receivedDBFiles,
    filters,
    cancelNavigation: "/searchSpaces",
  })

  const isButtonDisabled =
    isSubmitting ||
    !form.title?.trim() ||
    !form.description?.trim() ||
    !form.selectedDBFiles ||
    form.selectedDBFiles.length === 0

  React.useEffect(() => {
    if (
      fetcher.state === "idle" &&
      fetcher.data?.workspace_id &&
      fetcher.data?.status?.toString() === "200"
    ) {
      toast({
        title: "Space Created",
        description: fetcher.data?.message,
        variant: "success",
      })
      navigate("/searchSpaces/spaces/" + fetcher.data.workspace_id)
      form.resetForm()
    }
    if (
      (fetcher.state === "idle" &&
        fetcher.data?.status?.toString() === "500") ||
      fetcher.data?.status?.toString() === "400"
    ) {
      toast({
        title: "Error",
        description: fetcher.data?.message || "An error has occurred",
        variant: "error",
      })
    }
  }, [fetcher])

  return (
    <fetcher.Form method="post">
      <SpaceFormModal
        form={form}
        isSubmitting={isSubmitting}
        isButtonDisabled={isButtonDisabled}
        title={"New Space"}
        actionIcon={faPlus}
        actionText={"Create Space"}
        action="create"
      />
    </fetcher.Form>
  )
}

export async function loader({ request }: LoaderFunctionArgs) {
  const token = await requiredUserSession(request)
  const envVar = await getMenuVariables()
  const formData = new FormData()

  const requestData = {
    has_db_files: true,
    has_personal_files: false,
  }

  formData.append("data", JSON.stringify(requestData))
  const first_response = await fetchSessionDocs(token, formData)

  const transformedResponse = {
    personal_files: first_response.personal_files.map((doc: DBFile) => ({
      id: doc.doc_id,
      filename: doc.doc_name,
    })),
    db_files: first_response.db_files.map((doc: DBFile) => ({
      id: doc.doc_id,
      filename: doc.doc_name,
    })),
  }
  let status
  if (
    first_response.personal_files.length === 0 &&
    first_response.db_files.length === 0
  ) {
    status = "noFiles"
  } else {
    status = null
  }

  const filters = await fetchMetadataFilters(token)

  return json({
    envVar,
    receivedPersonalFiles: transformedResponse.personal_files,
    receivedDBFiles: transformedResponse.db_files,
    status: status,
    filters: filters,
  })
}

export const action = async ({ request }: ActionFunctionArgs) => {
  const token = await requiredUserSession(request)
  const formData = await request.formData()

  const files = formData.get("files")
  const title = formData.get("title")
  const description = formData.get("description")
  const writingStyle = formData.get("writingStyle")

  const url = new URL(request.url)
  const intent = url.searchParams.get("intent") || formData.get("intent")

  if (intent === "filter") {
    const submitFilters = await createMetadataSearchFilters(
      token,
      createMetadataSearchFilters_BEStructure(formData)
    )
    return json({
      newFilters: submitFilters,
    })
  } else if (intent === "create") {
    const filesArray = files
      ? JSON.parse(files as string).map((file: { id: string }) => file.id)
      : []
    if (!title || !description || !filesArray || filesArray.length === 0) {
      return null
    }
    const result = await createSpace(token, {
      title: title as string,
      description: description as string,
      doc_ids: filesArray,
      instructions: writingStyle as string,
    })
    return json({
      status: result.status,
      workspace_id: result.data,
      message: "Space created successfully",
    })
  } else {
    return null
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
  return (
    <Modal title={"Error"} size={"default"}>
      <ErrorBoundaryComponent isMainRoute={false} />
    </Modal>
  )
}
