import {
  json,
  ShouldRevalidateFunction,
  useNavigation,
  useLoaderData,
  useFetcher,
} from "@remix-run/react"
import type { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node"
import { faPenToSquare } from "@fortawesome/free-solid-svg-icons"
import { ErrorBoundaryComponent } from "@/components/ui/ErrorBoundaryComponent/ErrorBoundaryComponent"
import React, { useEffect } from "react"
import { requiredUserSession } from "@/data/auth/session.server"
import { getMenuVariables } from "@/data/menuvariables/menuvariables.server"
import Modal from "@/components/Shared/Modal/Modal"
import { SpaceFormModal } from "@/components/SearchSpaces/SpaceFormModal/SpaceFormModal"
import { fetchSessionDocs } from "@/data/litepaper/litepaper.server"
import {
  editSpace,
  getSpaceById,
} from "@/data/searchspaces/searchSpaces.server"
import { toast } from "@/hooks/useToast"
import {
  createMetadataSearchFilters,
  fetchMetadataFilters,
} from "@/data/searchsi/searchSi.server"
import { useSpaceForm } from "@/hooks/useSpaceForm"
import { DBFile } from "@/components/Shared/UploadFile/types"
import { createMetadataSearchFilters_BEStructure } from "@/utils/metadataFilters"

export default function SearchSpaces_edit() {
  const { receivedDBFiles, filters, spaceData } = useLoaderData<typeof loader>()
  const fetcher = useFetcher<typeof action>()
  const navigation = useNavigation()
  const isSubmitting =
    navigation.formAction ===
      `/searchSpaces/spaces/${spaceData?.workspace_id}/edit` ||
    fetcher.state === "submitting" ||
    navigation.state === "submitting"

  const form = useSpaceForm({
    loaderDBFiles: receivedDBFiles,
    filters,
    spaceData,
    cancelNavigation: `/searchSpaces/spaces/${spaceData?.workspace_id}`,
  })

  const isButtonDisabled =
    isSubmitting ||
    !form.title.trim() ||
    !form.description.trim() ||
    !form.selectedDBFiles ||
    form.selectedDBFiles.length === 0

  React.useEffect(() => {
    if (
      fetcher.state === "idle" &&
      fetcher.data?.workspace_id &&
      fetcher.data?.status?.toString() === "200"
    ) {
      toast({
        title: "Space Edited",
        description: fetcher.data?.message,
        variant: "success",
      })

      form.closeModal()
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
    <fetcher.Form method={"post"}>
      <SpaceFormModal
        form={form}
        isSubmitting={isSubmitting}
        isButtonDisabled={isButtonDisabled}
        actionIcon={faPenToSquare}
        actionText={"Save Space"}
        action={"edit"}
      />
    </fetcher.Form>
  )
}

export async function loader({ request, params }: LoaderFunctionArgs) {
  const token = await requiredUserSession(request)
  const envVar = await getMenuVariables()
  const formData = new FormData()
  const { id } = params

  if (!id) {
    throw new Response("Space ID is required", { status: 400 })
  }

  const spaceData = await getSpaceById(token, id)

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
    spaceData: spaceData || null,
  })
}

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const token = await requiredUserSession(request)
  const formData = await request.formData()
  const { id } = params
  const files = formData.get("files")
  const title = formData.get("title")
  const writingStyle = formData.get("writingStyle")
  const description = formData.get("description")
  const url = new URL(request.url)
  const intent = url.searchParams.get("intent") || formData.get("intent")

  if (intent === "filter") {
    const submitFilters = await createMetadataSearchFilters(
      token,
      createMetadataSearchFilters_BEStructure(formData)
    )
    return json({
      newFilters: submitFilters,
      status: null,
    })
  } else if (intent === "edit") {
    if (!title || !description || !files) {
      return json({
        status: 400,
        message: "Title, description, and at least one document are required.",
        workspace_id: id,
      })
    }

    let filesArray: string[] = []

    if (
      (files as string)?.startsWith("[") &&
      (files as string)?.endsWith("]")
    ) {
      const parsed = JSON.parse(files as string)
      if (Array.isArray(parsed)) {
        if (parsed[0]?.id) {
          filesArray = parsed.map((file: { id: string }) => file.id)
        } else if (typeof parsed[0] === "string") {
          filesArray = parsed.flatMap((str) => str.split(","))
        }
      }
    } else {
      filesArray = (files as string).split(",")
    }

    if (!id) {
      return json({
        status: 500,
        message: "Space ID is required.",
        workspace_id: id,
      })
    }

    const result = await editSpace(token, id, {
      title: title as string,
      description: description as string,
      doc_ids: filesArray,
      instructions: writingStyle as string,
    })
    if (result.status !== 200) {
      return json({
        status: result.status ?? 500,
        message: "An error has occurred",
        workspace_id: null,
      })
    }

    return json({
      status: result.status,
      workspace_id: result.data?.workspace_id,
      message: "Space edited successfully",
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
