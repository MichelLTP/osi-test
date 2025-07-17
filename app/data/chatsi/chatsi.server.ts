import { BACKEND_API_BASE_URL_HTTP } from "@/utils/envvars"
import { backendFetch } from "@/utils/fetch"

export async function fetchExampleQuestions(token: string) {
  // NOTE: We should get rid of these "fake" try/catch block
  // as they add a lot of bulk, but do they add any value?
  try {
    const response = await backendFetch(
      token,
      "GET",
      `${BACKEND_API_BASE_URL_HTTP}/chat_si/sample_questions?n=4`
    )
    const data = await response.json()
    return data
  } catch (error) {
    throw new Error("Failed to fetch Example Questions.")
  }
}

export async function fetchWhileYouWaitFacts(token: string) {
  try {
    const response = await backendFetch(
      token,
      "GET",
      `${BACKEND_API_BASE_URL_HTTP}/chat_si/did_you_know`
    )
    const data = await response.json()
    return data
  } catch (error) {
    throw new Error("Failed to fetch While you Wait facts.")
  }
}

export async function fetchChatsiHistory(token: string) {
  try {
    const response = await backendFetch(
      token,
      "GET",
      `${BACKEND_API_BASE_URL_HTTP}/chat_si/sessions`
    )
    const data = await response.json()
    return data
  } catch (error) {
    throw new Error("Failed to fetch ChatSi History.")
  }
}

export async function fetchChatsiHistoryResponse(
  token: string,
  session_id: string
) {
  try {
    const response = await backendFetch(
      token,
      "GET",
      `${BACKEND_API_BASE_URL_HTTP}/chat_si/sessions/${session_id}`
    )
    const data = await response.json()
    return data
  } catch (error) {
    throw new Error("Failed to fetch ChatSi History Response.")
  }
}

export async function fetchInternalLink(token: string, link: string) {
  try {
    const response = await backendFetch(
      token,
      "GET",
      `${BACKEND_API_BASE_URL_HTTP}/${link}`
    )
    return response
  } catch (error) {
    throw new Error("Failed to fetch Internal Link.")
  }
}

export async function ReportAnIssue(
  token: string,
  session_id: string,
  job_id: string,
  comment: string
) {
  try {
    const response = await backendFetch(
      token,
      "POST",
      `${BACKEND_API_BASE_URL_HTTP}/chat_si/report_issue?session_id=${session_id}&job_id=${job_id}&comment=${comment}`
    )
    const data = await response.json()
    return data
  } catch (error) {
    throw new Error("Failed to POST ChatSI Report Issue.")
  }
}

export async function setUserFeedback(token: string, formData: FormData) {
  const formDataObj: { [key: string]: any } = {}
  for (const [key, value] of formData.entries()) {
    formDataObj[key] = value
  }
  try {
    const response = await backendFetch(
      token,
      "POST",
      `${BACKEND_API_BASE_URL_HTTP}/chat_si/user_feedback`,
      { body: JSON.stringify(formDataObj) }
    )
    return response.status
  } catch (error) {
    throw new Error("Failed to POST user feedback.")
  }
}

export async function deleteChatSiSingleHistory(
  token: string,
  session_id: string
) {
  try {
    const response = await backendFetch(
      token,
      "DELETE",
      `${BACKEND_API_BASE_URL_HTTP}/chat_si/sessions/${session_id}`
    )
    return response.status
  } catch (error) {
    throw new Error("Failed to delete ChatSI Single History")
  }
}

export async function DeleteChatSiHistory(token: string) {
  try {
    const response = await backendFetch(
      token,
      "DELETE",
      `${BACKEND_API_BASE_URL_HTTP}/chat_si/sessions`
    )
    return response.status
  } catch (error) {
    throw new Error("Failed to DELETE ChatSI History")
  }
}

export const getChatSIStream = async (
  token: string,
  { messages }: { messages: any }
) => {
  try {
    const response = await backendFetch(
      token,
      "POST",
      `${BACKEND_API_BASE_URL_HTTP}/chat_si/question`,
      { body: JSON.stringify(messages) }
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
    console.error("Error in getChatStream:", error)
    throw error
  }
}

export async function fetchSourceImages(token: string, images: string) {
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
