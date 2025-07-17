import { backendFetch } from "@/utils/fetch"
import { BACKEND_API_BASE_URL_HTTP } from "@/utils/envvars"
import {
  CreateSpaceData,
  MetaDataDocs,
  SpaceInfo,
  Workspace,
} from "@/data/searchspaces/types"
import { FeedbackState } from "@/components/Layout/SocialButtons/type"

export async function createSpace(token: string, formData: CreateSpaceData) {
  try {
    const response = await backendFetch(
      token,
      "POST",
      `${BACKEND_API_BASE_URL_HTTP}/search_spaces`,
      {
        body: JSON.stringify(formData) || "{}",
      }
    )
    const status = response.status
    const data = await response.json()
    return { status, data }
  } catch (error) {
    throw new Error(`Failed to create search space: ${error}`)
  }
}

export const getAllSpaces = async (
  token: string,
  count?: number,
  offset?: number
): Promise<SpaceInfo[]> => {
  try {
    const response = await backendFetch(
      token,
      "GET",
      `${BACKEND_API_BASE_URL_HTTP}/search_spaces?count=${count || 6}&offset=${offset || 0}`
    )
    let data = await response.json()
    data = await Promise.all(
      data.map(async (space: SpaceInfo) => ({
        ...space,
        thumbnail_url: space.thumbnail_url
          ? await fetchCoverImages(token, space.thumbnail_url)
          : null,
      }))
    )
    return data || []
  } catch (error) {
    throw new Error(`Failed to fetch search spaces: ${error}`)
  }
}

export const getSpaceById = async (
  token: string,
  spaceId: string
): Promise<Workspace> => {
  try {
    const response = await backendFetch(
      token,
      "GET",
      `${BACKEND_API_BASE_URL_HTTP}/search_spaces/workspaces/${spaceId}`
    )
    const data = await response.json()

    if (Array.isArray(data?.docs_with_metadata)) {
      data.docs_with_metadata = data.docs_with_metadata.map(
        (doc: MetaDataDocs) => {
          const metadata = doc.doc_metadata

          return {
            ...doc,
            doc_metadata: metadata,
          }
        }
      )
    }
    return data || null
  } catch (error) {
    throw new Error(`Failed to fetch search space by ID: ${error}`)
  }
}

export async function fetchCoverImages(token: string, images: string) {
  try {
    const response = await backendFetch(
      token,
      "GET",
      `${BACKEND_API_BASE_URL_HTTP}${images}`
    )

    if (!response.ok) throw new Error("Fetch failed")
    const blob = await response.blob()
    const buffer = await blob.arrayBuffer()
    const base64 = Buffer.from(buffer).toString("base64")
    const contentType = response.headers.get("content-type") || "image/jpeg"
    return `data:${contentType};base64,${base64}`
  } catch (error) {
    throw new Error("Failed to fetch Image")
  }
}

export const deleteSpace = async (
  token: string,
  spaceId: string
): Promise<number> => {
  try {
    const response = await backendFetch(
      token,
      "DELETE",
      `${BACKEND_API_BASE_URL_HTTP}/search_spaces/workspaces/${spaceId}`
    )
    return response.status
  } catch (error) {
    throw new Error(`Failed to delete search space: ${error}`)
  }
}

export const editSpace = async (
  token: string,
  spaceId: string,
  data: CreateSpaceData
): Promise<{ status: number; data: SpaceInfo }> => {
  try {
    const response = await backendFetch(
      token,
      "PATCH",
      `${BACKEND_API_BASE_URL_HTTP}/search_spaces/workspaces/${spaceId}`,
      { body: JSON.stringify(data) }
    )
    const status = response.status
    const res = await response.json()
    return { status, data: res }
  } catch (error) {
    throw new Error(`Failed to edit search space: ${error}`)
  }
}

export const runSpaceInsights = async (
  token: string,
  spaceId: string
): Promise<ReadableStream> => {
  try {
    const response = await backendFetch(
      token,
      "PUT",
      `${BACKEND_API_BASE_URL_HTTP}/search_spaces/workspaces/${spaceId}`,
      {
        contentType: "application/json",
        customMessage: "Failed to PUT Search Spaces Insights",
      }
    )
    if (!response.body) {
      throw new Error("Response body is null")
    }
    const reader = response.body.getReader()

    return new ReadableStream({
      async start(controller) {
        try {
          const done = false
          while (!done) {
            const { done, value } = await reader.read()
            if (done) break
            const content = value.toString()
            controller.enqueue(content)
          }
          controller.close()
        } catch (error) {
          controller.error(error)
        }
      },
    })
  } catch (error) {
    console.error("Failed to run PUT Search Spaces Insights", error)
    throw new Error("Failed to run PUT Search Spaces Insights")
  }
}

export const sendFeedbackToSpaces = async (
  token: string,
  spaceId: string,
  sectionId: string,
  feedbackState: FeedbackState,
  report?: string
): Promise<{
  status: number
  data: { feedback: { state: FeedbackState } }
}> => {
  try {
    const response = await backendFetch(
      token,
      "PATCH",
      `${BACKEND_API_BASE_URL_HTTP}/search_spaces/workspaces/${spaceId}/${sectionId}/feedback`,
      {
        body: JSON.stringify({ state: feedbackState, report: report }),
        contentType: "application/json",
        customMessage: "Failed to send feedback to search space",
      }
    )
    const status = response.status
    const res = await response.json()
    return { status, data: res }
  } catch (error) {
    throw new Error(`Failed to send feedback: ${error}`)
  }
}
