import { BACKEND_API_BASE_URL_HTTP } from "@/utils/envvars"
import { backendFetch } from "@/utils/fetch"

export async function fetchSessionDocs(token: string, formData: FormData) {
  try {
    const response = await backendFetch(
      token,
      "POST",
      `${BACKEND_API_BASE_URL_HTTP}/aggregator_service/search`,
      { body: formData, contentType: null }
    )

    if (!response.ok) {
      console.log(`Status: ${response.status}, ${await response.text()}`)
    }
    return response.json()
  } catch (error) {
    throw new Error("Failed to Fetch Session Documents.")
  }
}

export async function fetchDBDocuments(token: string) {
  try {
    const response = await backendFetch(
      token,
      "GET",
      `${BACKEND_API_BASE_URL_HTTP}/aggregator_service/files`
    )
    return await response.json()
  } catch (error) {
    throw new Error("Failed to fetch DB documents.")
  }
}

export const getAggServiceStream = async (
  token: string,
  { messages, files, session_id }
) => {
  const formData = new FormData()

  formData.append(
    "form",
    JSON.stringify({
      forms: messages,
    })
  )

  if (files && files.length > 0) {
    files.forEach((file, index) => {
      formData.append(`files`, file, file.name)
    })
  }
  if (session_id) {
    formData.append(`session_id`, session_id)
  }

  try {
    const response = await backendFetch(
      token,
      "POST",
      `${BACKEND_API_BASE_URL_HTTP}/aggregator_service/process_form`,
      { body: formData, contentType: null }
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
            // Assuming each chunk is a complete JSON object
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
    console.error("Error in getAggServiceStream:", error)
    throw error
  }
}
