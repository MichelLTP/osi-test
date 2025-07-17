import { BACKEND_API_BASE_URL_HTTP } from "@/utils/envvars"
import { backendFetch } from "@/utils/fetch"

import { setTimeout } from "timers/promises"
import { enhancePortraitsWithImages } from "../discovery/discovery.server"

const MAX_RETRIES = 75
const INITIAL_DELAY = 5000 // 1 seconds

// Request queue to prevent multiple simultaneous requests
const requestQueue: { [key: string]: Promise<any> } = {}

/// GET REQUESTS

export async function getAggInput(token: string, aggId: string) {
  try {
    const response = await backendFetch(
      token,
      "GET",
      `${BACKEND_API_BASE_URL_HTTP}/aggregator_service/history/workspace/${aggId}/stub`
    )

    if (!response.ok) {
      console.log(`🚀🚀🚀 Status: ${response.status}, ${await response.text()}`)
    }
    return response.json()
  } catch (error) {
    console.log(error)
    throw new Error("Failed to get Aggregator Form details.")
  }
}

export async function getAggResult(token: string, aggId: string) {
  try {
    const response = await backendFetch(
      token,
      "GET",
      `${BACKEND_API_BASE_URL_HTTP}/aggregator_service/history/workspace/${aggId}`
    )

    if (!response.ok) {
      console.log(`🚀🚀🚀 Status: ${response.status}, ${await response.text()}`)
    }
    return response.json()
  } catch (error) {
    console.log(error)
    throw new Error("Failed to get Aggregator Form details with Result.")
  }
}

export async function fetchQaJobSearch(token: string, sessionId: string) {
  const queueKey = `${sessionId}`
  // If there's already a request in progress for this sessionId pair, return that promise
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
          `${BACKEND_API_BASE_URL_HTTP}/document_tools/qa/job_search?session_id=${sessionId}`,
          { customMessage: "Failed to fetch QA response." }
        )

        if (response.status === 200) {
          return await response.json()
        }

        if (response.status === 225) {
          const delay = INITIAL_DELAY
          console.log(
            `Attempt ${retryCount + 1} failed. Retrying in ${
              delay / 1000
            } seconds...`
          )
          await setTimeout(delay)
          retryCount++
        } else {
          throw new Error(
            `Error after the sucess of the backendFetch! status: ${
              response.status
            } ${await response.text()}`
          )
        }
      } catch (error) {
        console.error("Error fetching QA response:", error)
        throw new Error("Failed to fetch QA response.")
      }
    }
    throw new Error("Max retries reached. Failed to fetch QA response.")
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

export async function fetchQAHistory(token: string) {
  try {
    const response = await backendFetch(
      token,
      "GET",
      `${BACKEND_API_BASE_URL_HTTP}/document_tools/qa/history`
    )
    return await response.json()
  } catch (error) {
    throw new Error("Failed to fetch QA History.")
  }
}

export async function fetchAggHistory(token: string) {
  try {
    const response = await backendFetch(
      token,
      "GET",
      `${BACKEND_API_BASE_URL_HTTP}/aggregator_service/history`
    )
    return await response.json()
  } catch (error) {
    throw new Error("Failed to fetch Aggregator History.")
  }
}

export async function fetchQAHistoryResponse(
  token: string,
  session_id: string
) {
  try {
    const response = await backendFetch(
      token,
      "GET",
      `${BACKEND_API_BASE_URL_HTTP}/document_tools/qa/history/${session_id}`
    )
    return await response.json()
  } catch (error) {
    throw new Error("Failed to fetch QA History Response.")
  }
}

export async function deleteQASingleHistory(token: string, session_id: string) {
  try {
    const response = await backendFetch(
      token,
      "DELETE",
      `${BACKEND_API_BASE_URL_HTTP}/document_tools/qa/history/${session_id}`
    )
    return response.status
  } catch (error) {
    throw new Error("Failed to delete QA Single History")
  }
}

export async function deleteAggSingleHistory(token: string, aggId: string) {
  try {
    const response = await backendFetch(
      token,
      "DELETE",
      `${BACKEND_API_BASE_URL_HTTP}/aggregator_service/history/workspace/${aggId}`
    )
    return response.status
  } catch (error) {
    throw new Error("Failed to delete Aggregator Single History")
  }
}

export async function deleteQAHistory(token: string) {
  try {
    const response = await backendFetch(
      token,
      "DELETE",
      `${BACKEND_API_BASE_URL_HTTP}/document_tools/qa/history`
    )
    return response.status
  } catch (error) {
    throw new Error("Failed to DELETE QA History")
  }
}

export async function deleteAggHistory(token: string) {
  try {
    const response = await backendFetch(
      token,
      "DELETE",
      `${BACKEND_API_BASE_URL_HTTP}/aggregator_service/history`
    )
    return response.status
  } catch (error) {
    throw new Error("Failed to DELETE Aggregator History")
  }
}

export async function fetchSummarizationResult(token: string, job_id: string) {
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
          `${BACKEND_API_BASE_URL_HTTP}/document_tools/summarization/job_search?job_id=${job_id}`,
          { customMessage: "Failed to fetch summarization response." }
        )

        if (response.status === 200) {
          const data = await response.json()
          return data
        }

        if (response.status === 225) {
          const delay = INITIAL_DELAY
          console.log(
            `Attempt ${retryCount + 1} failed. Retrying in ${
              delay / 1000
            } seconds...`
          )
          await setTimeout(delay)
          retryCount++
        } else {
          throw new Error(
            `Error after backendFetch sucess! status: ${
              response.status
            }, ${await response.text()}`
          )
        }
      } catch (error) {
        console.error("Error fetching Summarization response:", error)
        throw new Error("Failed to fetch Summarization response.")
      }
    }
    throw new Error(
      "Max retries reached. Failed to fetch Summarization response."
    )
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

export async function fetchSummarizationHistory(token: string) {
  try {
    const response = await backendFetch(
      token,
      "GET",
      `${BACKEND_API_BASE_URL_HTTP}/document_tools/summarization/history`
    )
    return await response.json()
  } catch (error) {
    throw new Error("Failed to fetch Summarization History.")
  }
}

export async function fetchSummarizationHistoryResponse(
  token: string,
  session_id: string
) {
  try {
    const response = await backendFetch(
      token,
      "GET",
      `${BACKEND_API_BASE_URL_HTTP}/document_tools/summarization/history/${session_id}`
    )
    return await response.json()
  } catch (error) {
    throw new Error("Failed to fetch Summarization History Response.")
  }
}

export async function deleteSummarizationSingleHistory(
  token: string,
  session_id: string
) {
  try {
    const response = await backendFetch(
      token,
      "DELETE",
      `${BACKEND_API_BASE_URL_HTTP}/document_tools/summarization/history/${session_id}`
    )
    return response.status
  } catch (error) {
    throw new Error("Failed to delete summarization Single History")
  }
}

export async function deleteSummarizationHistory(token: string) {
  try {
    const response = await backendFetch(
      token,
      "DELETE",
      `${BACKEND_API_BASE_URL_HTTP}/document_tools/summarization/history`
    )
    return response.status
  } catch (error) {
    throw new Error("Failed to DELETE Summarization History")
  }
}

export async function fetchOutputParsersDocID(token: string, job_id: string) {
  const queueKey = `${job_id}`
  console.log("fetchOutputParsersDocID", job_id)
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
          `${BACKEND_API_BASE_URL_HTTP}/document_tools/output_parsers/job_search?job_id=${job_id}`,
          { customMessage: "Failed to fetch Output Parsers doc id" }
        )

        if (response.status === 200) {
          return await response.json()
        }

        if (response.status === 225) {
          const delay = INITIAL_DELAY
          console.log(
            `Attempt ${retryCount + 1} failed. Retrying in ${
              delay / 1000
            } seconds...`
          )
          await setTimeout(delay)
          retryCount++
        } else {
          throw new Error(
            `Error after the success of the backendFetch! status: ${
              response.status
            } ${await response.text()}`
          )
        }
      } catch (error) {
        console.error("Error fetching QA response:", error)
        throw new Error("Failed to fetch Output Parsers doc ID.")
      }
    }
    throw new Error(
      "Max retries reached. Failed to fetch Output Parsers response."
    )
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

export async function fetchOutputParsersFieldTypes(token: string) {
  try {
    const response = await backendFetch(
      token,
      "GET",
      `${BACKEND_API_BASE_URL_HTTP}/document_tools/output_parsers/valid_formats`,
      { customMessage: "Failed to fetch Output Parsers Field Types" }
    )

    if (!response.ok) {
      throw new Error("Failed to fetch Output Parsers Field Types.")
    }
    const data = await response.json()

    return data
  } catch (error) {
    throw new Error("Failed to fetch Output Parsers Field Types.")
  }
}

export async function fetchAdminPanelDocID(token: string, job_id: string) {
  try {
    const response = await backendFetch(
      token,
      "GET",
      `${BACKEND_API_BASE_URL_HTTP}/document_tools/mock/admin_panel/upload/{id}?job_id=${job_id}`,
      { customMessage: "Failed to fetch AdminPanel doc id" }
    )

    if (!response.ok) {
      throw new Error("Failed to fetch Admin Panel doc ID.")
    }
    const data = await response.json()
    if (data.state === "running") {
      console.log("Sleeping...")
      await new Promise((resolve) => setTimeout(resolve, 5000))
      return fetchAdminPanelDocID(token, job_id)
    }

    return data
  } catch (error) {
    throw new Error("Failed to fetch QA doc ID.")
  }
}

export async function fetchLocalDBFiles(token: string) {
  try {
    const response = await backendFetch(
      token,
      "GET",
      `${BACKEND_API_BASE_URL_HTTP}/document_tools/documents`,
      { customMessage: "Failed to fetch local files from DB." }
    )
    return await response.json()
  } catch (error) {
    throw new Error("Failed to fetch local files from DB")
  }
}

export async function fetchSessionDocs(token: string, formData: FormData) {
  try {
    const response = await backendFetch(
      token,
      "POST",
      `${BACKEND_API_BASE_URL_HTTP}/user/files/search`,
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

export async function UploadDocumentToolsOutputParsersFile(
  token: string,
  formData: FormData
) {
  try {
    const response = await backendFetch(
      token,
      "POST",
      `${BACKEND_API_BASE_URL_HTTP}/document_tools/output_parsers/uploadfile?node_size=20000&node_overlap=200`,
      {
        body: formData,
        contentType: null,
        customMessage: "Failed to POST Document Tools Output Parsers",
      }
    )
    return await response.json()
  } catch (error) {
    throw new Error("Failed to POST Document Tools Output Parsers.")
  }
}

export const getOutputParsersStream = async (token: string, { messages }) => {
  try {
    const response = await backendFetch(
      token,
      "POST",
      `${BACKEND_API_BASE_URL_HTTP}/document_tools/output_parsers/parsedoc`,
      {
        body: JSON.stringify(messages),
        customMessage: "Failed to POST Document Tools Output Parsers",
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

export async function UploadDocumentToolsAdminPanelFile(
  token: string,
  formData: FormData
) {
  try {
    const response = await backendFetch(
      token,
      "POST",
      `${BACKEND_API_BASE_URL_HTTP}/document_tools/mock/admin_panel/uploadfile/?node_size=2000&node_overlap=200`,
      {
        body: JSON.stringify(formData),
        customMessage: "Failed to POST Document Tools Admin Panel",
      }
    )
    return await response.json()
  } catch (error) {
    throw new Error("Failed to POST Document Tools Admin Panel.")
  }
}

export async function fetchAPDiscoveryTags(token: string) {
  try {
    const response = await backendFetch(
      token,
      "GET",
      `${BACKEND_API_BASE_URL_HTTP}/admin_panel/discovery/tags`,
      { customMessage: "Failed to fetch discovery tags" }
    )
    return await response.json()
  } catch (error) {
    throw new Error("Failed to fetch discovery tags")
  }
}

export async function fetchLocalDBStories(token: string) {
  try {
    const response = await backendFetch(
      token,
      "GET",
      `${BACKEND_API_BASE_URL_HTTP}/admin_panel/discovery/stories`,
      { customMessage: "Failed to fetch local files from DB." }
    )
    return await response.json()
  } catch (error) {
    throw new Error("Failed to fetch local files from DB")
  }
}
export async function fetchStoryData(token: string, id: string) {
  try {
    const response = await backendFetch(
      token,
      "GET",
      `${BACKEND_API_BASE_URL_HTTP}/discovery/new/stories/${id}`,
      { customMessage: "Failed to fetch local files from DB." }
    )

    const storyData = await response.json()

    if (!storyData) {
      throw new Error("Failed to fetch Discovery Stories")
    }
    const apiDataStructure = { portraits: storyData }
    const enhancedPortraitsData = await enhancePortraitsWithImages(
      apiDataStructure,
      token
    )
    return enhancedPortraitsData
  } catch (error) {
    throw new Error("Failed to fetch local files from DB")
  }
}

//POST REQUESTS

export async function preprocessQaFiles(token: string, formData: FormData) {
  try {
    const response = await backendFetch(
      token,
      "POST",
      `${BACKEND_API_BASE_URL_HTTP}/document_tools/qa/preprocess`,
      {
        body: formData,
        contentType: null,
        customMessage: "Failed to POST Document Tools QA",
      }
    )
    return await response.json()
  } catch (error) {
    throw new Error("Failed to POST Document Tools QA.")
  }
}

export async function UploadPrivateDocument(token: string, formData: FormData) {
  try {
    const response = await backendFetch(
      token,
      "POST",
      `${BACKEND_API_BASE_URL_HTTP}/user/files`,
      {
        body: formData,
        contentType: null,
        customMessage: "Failed to POST Private Document",
      }
    )
    return await response.json()
  } catch (error) {
    throw new Error("Failed to POST Private Document.")
  }
}

export async function UpdatePrivateLibrary(
  token: string,
  dataParams: URLSearchParams
) {
  try {
    const response = await backendFetch(
      token,
      "POST",
      `${BACKEND_API_BASE_URL_HTTP}/user/files/search`,
      {
        body: dataParams,
        contentType: "application/x-www-form-urlencoded",
      }
    )
    return await response.json()
  } catch (error) {
    console.log(error)
    throw new Error("Failed to POST Private Library.")
  }
}

export async function ProcessDocument(token: string, formData: FormData) {
  try {
    const response = await backendFetch(
      token,
      "POST",
      `${BACKEND_API_BASE_URL_HTTP}/aggregator_service/upload`,
      {
        body: formData,
        contentType: null,
        customMessage: "Failed to Upload LitePaper Private Library Docs",
      }
    )
    return await response.status
  } catch (error) {
    throw new Error("Failed to Upload LitePaper Private Library Docs.")
  }
}

export async function createDocumentSummarization(
  token: string,
  formData: FormData
) {
  const formDataObj: { [key: string]: any } = {}
  for (const [key, value] of formData.entries()) {
    formDataObj[key] = value
  }
  try {
    const response = await backendFetch(
      token,
      "POST",
      `${BACKEND_API_BASE_URL_HTTP}/document_tools/summarization`,
      {
        body: formData,
        contentType: null,
        customMessage: "Failed to POST Document Tools Summarization",
      }
    )
    return await response.json()
  } catch (error) {
    throw new Error("Failed to POST Document Tools Summarization")
  }
}

export async function setSummarizationFeedback(
  token: string,
  formData: FormData
) {
  const formDataObj: { [key: string]: any } = {}
  for (const [key, value] of formData.entries()) {
    formDataObj[key] = value
  }

  try {
    const response = await backendFetch(
      token,
      "POST",
      `${BACKEND_API_BASE_URL_HTTP}/document_tools/summarization/feedback`,
      {
        body: JSON.stringify(formDataObj),
        customMessage: "Failed to POST Document Tools Summarization Feedback",
      }
    )
    return await response.json()
  } catch (error) {
    throw new Error("Failed to POST Document Tools Summarization")
  }
}

export async function setQAFeedback(token: string, formData: FormData) {
  const formDataObj: { [key: string]: any } = {}
  for (const [key, value] of formData.entries()) {
    if (typeof value === "string") {
      try {
        const parsedValue = JSON.parse(value)
        if (typeof parsedValue === "object" && parsedValue !== null) {
          formDataObj[key] = parsedValue
        } else {
          formDataObj[key] = value
        }
      } catch (error) {
        formDataObj[key] = value
      }
    } else {
      formDataObj[key] = value
    }
  }

  try {
    const response = await backendFetch(
      token,
      "POST",
      `${BACKEND_API_BASE_URL_HTTP}/document_tools/qa/feedback`,
      {
        body: JSON.stringify(formDataObj),
        customMessage: "Failed to POST Document Tools QA Feedback",
      }
    )
    return await response.json()
  } catch (error) {
    console.error("Failed to POST Document Tools QA Feedback", error)
    throw new Error("Failed to POST Document Tools QA Feedback")
  }
}

export async function createDiscoveryStory(token: string, formData: FormData) {
  const formDataObj: { [key: string]: any } = {}
  for (const [key, value] of formData.entries()) {
    formDataObj[key] = value
  }

  try {
    const response = await backendFetch(
      token,
      "POST",
      `${BACKEND_API_BASE_URL_HTTP}/admin_panel/discovery/stories`,
      {
        body: formData,
        contentType: null,
        customMessage: "Failed to POST Discovery Story",
      }
    )
    return await response.json()
  } catch (error) {
    console.error("Failed to POST Discovery Story", error)
    throw new Error("Failed to POST Discovery Story")
  }
}

export async function updateDiscoveryStory(
  token: string,
  formData: FormData,
  id: string
) {
  const formDataObj: { [key: string]: any } = {}
  for (const [key, value] of formData.entries()) {
    formDataObj[key] = value
  }

  try {
    const response = await backendFetch(
      token,
      "PUT",
      `${BACKEND_API_BASE_URL_HTTP}/admin_panel/discovery/stories/${id}`,
      {
        body: formData,
        contentType: null,
        customMessage: "Failed to POST Discovery Story",
      }
    )
    return await response.json()
  } catch (error) {
    console.error("Failed to POST Discovery Story", error)
    throw new Error("Failed to POST Discovery Story")
  }
}

// DELETE REQUESTS

export async function deletePrivateDocument(token: string, id: string) {
  try {
    const response = await backendFetch(
      token,
      "DELETE",
      `${BACKEND_API_BASE_URL_HTTP}/user/files/${id}`
    )
    return await response.json()
  } catch (error) {
    console.log(error)
    throw new Error("Failed to DELETE Private Document.")
  }
}

//SSE REQUESTS

export const getDocumentToolsQAStream = async (token: string, { messages }) => {
  try {
    const response = await backendFetch(
      token,
      "POST",
      `${BACKEND_API_BASE_URL_HTTP}/document_tools/qa/send_v2`,
      {
        body: JSON.stringify(messages),
        customMessage: "Error in getChatStream",
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

export async function submitRunAnalysis(token: string, formData: FormData) {
  const formDataObj: { [key: string]: any } = {}
  let workspaceId: string | undefined

  for (const [key, value] of formData.entries()) {
    if (key === "body") {
      try {
        const parsedBody = JSON.parse(value.toString())
        workspaceId = parsedBody.workspace_id
      } catch (err) {
        console.error("Invalid JSON in body:", err)
      }
    }

    formDataObj[key] = value
  }
  const baseUrl = `${BACKEND_API_BASE_URL_HTTP}/aggregator_service/run`
  const url = workspaceId ? `${baseUrl}?workspace_id=${workspaceId}` : baseUrl
  try {
    const response = await backendFetch(token, "POST", url, {
      body: formDataObj.body,
      contentType: "application/json",
      customMessage: "Failed to POST AggService Analysis",
    })
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
    console.error("Failed to POST AggService Analysis", error)
    throw new Error("Failed to POST Discovery Story")
  }
}
