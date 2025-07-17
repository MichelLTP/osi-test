import { SearchSiResultData } from "@/components/SearchSi/type"
import { BACKEND_API_BASE_URL_HTTP } from "@/utils/envvars"
import { backendFetch } from "@/utils/fetch"

/// GET REQUESTS

import { setTimeout } from "timers/promises"

const MAX_RETRIES = 75
const INITIAL_DELAY = 1000 // 1 seconds

// Request queue to prevent multiple simultaneous requests
const requestQueue: { [key: string]: Promise<any> } = {}

export async function fetchSearchSiResult(
  token: string,
  job_id: string
): Promise<any> {
  const queueKey = `${job_id}`

  // If there's already a request in progress for this session_id/job_id pair, return that promise
  if (requestQueue[queueKey]) {
    return requestQueue[queueKey]
  }

  // Create a new promise for this request and add it to the queue
  const requestPromise = (async () => {
    let retryCount = 0
    while (retryCount < MAX_RETRIES) {
      if (retryCount === 0) {
        await setTimeout(2000)
      }
      try {
        const response = await backendFetch(
          token,
          "GET",
          `${BACKEND_API_BASE_URL_HTTP}/search_si/job_response?job_id=${job_id}`,
          { raiseError: false }
        )

        if (response.ok) {
          const data = await response.json()
          return data
        }

        if (response.status === 425) {
          const delay = INITIAL_DELAY
          console.log(
            `Attempt ${retryCount + 1} failed. Retrying in ${
              delay / 1000
            } seconds...`
          )
          await setTimeout(delay)
          retryCount++
        } else {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
      } catch (error) {
        console.error("Error fetching search si response:", error)
        throw new Error("Failed to fetch search si response.")
      }
    }
    throw new Error("Max retries reached. Failed to fetch search si response.")
  })()

  // Add the promise to the queue
  requestQueue[queueKey] = requestPromise

  try {
    // Wait for the request to complete
    const result = await requestPromise
    return result
  } finally {
    // Remove the request from the queue when it's done, regardless of success or failure
    delete requestQueue[queueKey]
  }
}

export async function fetchPdfResponse(token: string, doc_id: string) {
  try {
    const response = await backendFetch(
      token,
      "GET",
      `${BACKEND_API_BASE_URL_HTTP}/search_si/download_doc?doc_id=${doc_id}`,
      { contentType: "application/pdf" }
    )
    return response
  } catch (error) {
    throw new Error("Failed to fetch PDF Response.")
  }
}

export async function fetchMetadataFilters(token: string) {
  try {
    const response = await backendFetch(
      token,
      "GET",
      `${BACKEND_API_BASE_URL_HTTP}/search_si/filters?search_method=Metadata Search`
    )
    return await response.json()
  } catch (error) {
    throw new Error("Failed to fetch Metadata Filters.")
  }
}

/// POST REQUESTS

export async function setUserFeedback(token: string, formData: FormData) {
  const formDataObj: { [key: string]: any } = {}
  for (const [key, value] of formData.entries()) {
    formDataObj[key] = value
  }

  try {
    const response = await backendFetch(
      token,
      "POST",
      `${BACKEND_API_BASE_URL_HTTP}/search_si/user_feedback`,
      { body: JSON.stringify(formDataObj) }
    )
    return response.status
  } catch (error) {
    throw new Error("Failed to POST user feedback.")
  }
}

export async function createSearchSiPrompt(
  token: string,
  search_method: string,
  prompt?: string,
  filters?: Record<string, any>
) {
  try {
    const response = await backendFetch(
      token,
      "POST",
      `${BACKEND_API_BASE_URL_HTTP}/search_si/job_search?search_method=${search_method}&top=10&search_keyword=${prompt}`,
      { body: JSON.stringify(filters) }
    )
    return await response.json()
  } catch (error) {
    throw new Error("Failed to POST semantic search prompt.")
  }
}

export async function createRelatedDocumentsSearch(
  token: string,
  documentData: SearchSiResultData
) {
  try {
    const response = await backendFetch(
      token,
      "POST",
      `${BACKEND_API_BASE_URL_HTTP}/search_si/related_docs`,
      { body: documentData }
    )
    return await response.json()
  } catch (error) {
    throw new Error("Failed to POST semantic search prompt.")
  }
}

export async function createMetadataSearch(token: string, filters: any) {
  try {
    const response = await backendFetch(
      token,
      "POST",
      `${BACKEND_API_BASE_URL_HTTP}/search_si/job_search?search_method=Metadata Search&top=10&search_keyword=`,
      { body: JSON.stringify(filters) }
    )
    return await response.json()
  } catch (error) {
    throw new Error("Failed to send search si prompt.")
  }
}

export async function createMetadataSearchFilters(token: string, filters: any) {
  try {
    const response = await backendFetch(
      token,
      "POST",
      `${BACKEND_API_BASE_URL_HTTP}/search_si/filters?search_method=Metadata Search`,
      { body: JSON.stringify(filters) }
    )
    return await response.json()
  } catch (error) {
    throw new Error("Failed to fetch new filters")
  }
}

export async function fetchSearchSiHistory(token: string, history_n: number) {
  try {
    const response = await backendFetch(
      token,
      "GET",
      `${BACKEND_API_BASE_URL_HTTP}/search_si/search_history?history_n=${history_n}`
    )
    return await response.json()
  } catch (error) {
    throw new Error("Failed to fetch SearchSi History.")
  }
}

export async function ReportAnIssue(
  token: string,
  job_id: string,
  doc_id: string,
  comment: string
) {
  try {
    const response = await backendFetch(
      token,
      "POST",
      `${BACKEND_API_BASE_URL_HTTP}/search_si/report_issue?job_id=${job_id}&doc_id=${doc_id}&comment=${comment}`
    )
    return await response.json()
  } catch (error) {
    throw new Error("Failed to POST SearchSI Report Issue.")
  }
}

export async function deleteSearchSiSingleHistory(
  token: string,
  job_id: string
) {
  try {
    const response = await backendFetch(
      token,
      "DELETE",
      `${BACKEND_API_BASE_URL_HTTP}/search_si/job/${job_id}`
    )
    return response.status
  } catch (error) {
    throw new Error("Failed to delete SearchSI Single History")
  }
}

export async function DeleteSearchSiHistory(token: string) {
  try {
    const response = await backendFetch(
      token,
      "DELETE",
      `${BACKEND_API_BASE_URL_HTTP}/search_si/clear_history`
    )
    return response.status
  } catch (error) {
    throw new Error("Failed to DELETE SearchSI History")
  }
}

export async function fetchSourceFromDocId(token: string, doc_id: string) {
  try {
    const response = await backendFetch(
      token,
      "GET",
      `${BACKEND_API_BASE_URL_HTTP}/search_si/doc/${doc_id}`
    )
    return await response.json()
  } catch (error) {
    throw new Error("Failed to fetch Document.")
  }
}

export async function fetchSearchSiAudio(token: string, doc_id: string) {
  try {
    const response = await backendFetch(
      token,
      "GET",
      `${BACKEND_API_BASE_URL_HTTP}/resources/audios/${doc_id}`
    )
    if (!response.ok) throw new Error("Fetch failed")

    const blob = await response.blob()
    if (!blob) return ""

    const buffer = await blob.arrayBuffer()
    const base64 = Buffer.from(buffer).toString("base64")
    if (!base64) return ""

    const contentType = response.headers.get("content-type")
    if (!contentType) return ""

    return `data:${contentType};base64,${base64}`
  } catch (error) {
    return ""
  }
}
