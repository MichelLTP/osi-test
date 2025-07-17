import { BACKEND_API_BASE_URL_HTTP } from "@/utils/envvars"
import { backendFetch } from "@/utils/fetch"

export async function UploadPrivateFiles(token: string, formData: FormData) {
  try {
    const response = await backendFetch(
      token,
      "POST",
      `${BACKEND_API_BASE_URL_HTTP}/user/files`,
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

export const getAggServiceStream = async (
  token: string,
  { messages, files, session_id, workspaceId }
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
      `${BACKEND_API_BASE_URL_HTTP}/greypaper/workspaces/${workspaceId}/process`,
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

export const getGreyPaperPreviewStream = async (
  token: string,
  { messages, workspaceId }
) => {
  const payload = {
    section: messages[0],
  }

  try {
    const response = await backendFetch(
      token,
      "POST",
      `${BACKEND_API_BASE_URL_HTTP}/greypaper/new/workspaces/${workspaceId}/preview`,
      { body: JSON.stringify(payload), contentType: "application/json" }
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
    console.error("Error in LitePaper Preview:", error)
    throw error
  }
}

export const getGreyPaperRunStream = async (
  token: string,
  { messages, workspaceId }
) => {
  const payload = {
    sections: messages,
  }

  try {
    const response = await backendFetch(
      token,
      "POST",
      `${BACKEND_API_BASE_URL_HTTP}/greypaper/new/workspaces/${workspaceId}/run`,
      { body: JSON.stringify(payload), contentType: "application/json" }
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
    console.error("Error in LitePaper Preview:", error)
    throw error
  }
}

export async function getUserWorkspaces(token: string) {
  try {
    const response = await backendFetch(
      token,
      "GET",
      `${BACKEND_API_BASE_URL_HTTP}/greypaper/new/workspaces`
    )
    return await response.json()
  } catch (error) {
    throw new Error("Failed to fetch User Workspaces (LitePaper).")
  }
}

export async function createUserWorkspace(token: string, formData: FormData) {
  try {
    const jsonBody = Object.fromEntries(formData.entries())
    const response = await backendFetch(
      token,
      "POST",
      `${BACKEND_API_BASE_URL_HTTP}/greypaper/new/workspaces`,
      { body: JSON.stringify(jsonBody), contentType: "application/json" }
    )

    if (!response.ok) {
      console.log(`🚀🚀🚀 Status: ${response.status}, ${await response.text()}`)
    }
    return response.json()
  } catch (error) {
    console.log(error)
    throw new Error("Failed to create User Workspace (LitePaper).")
  }
}

export async function updateUserWorkspace(
  token: string,
  formData: FormData,
  workspaceId: string
) {
  try {
    const jsonBody = Object.fromEntries(formData.entries())
    const response = await backendFetch(
      token,
      "PUT",
      `${BACKEND_API_BASE_URL_HTTP}/greypaper/new/workspaces/${workspaceId}`,
      { body: JSON.stringify(jsonBody), contentType: "application/json" }
    )

    if (!response.ok) {
      console.log(`🚀🚀🚀 Status: ${response.status}, ${await response.text()}`)
    }
    return response.json()
  } catch (error) {
    console.log(error)
    throw new Error("Failed to update User Workspace (LitePaper).")
  }
}

export async function getWorkspaceInput(token: string, workspaceId: string) {
  try {
    const response = await backendFetch(
      token,
      "GET",
      `${BACKEND_API_BASE_URL_HTTP}/greypaper/new/workspaces/${workspaceId}`
    )

    if (!response.ok) {
      console.log(`🚀🚀🚀 Status: ${response.status}, ${await response.text()}`)
    }
    return response.json()
  } catch (error) {
    console.log(error)
    throw new Error("Failed to get Workspace details (LitePaper).")
  }
}

export async function getWorkspaceResult(token: string, workspaceId: string) {
  try {
    const response = await backendFetch(
      token,
      "GET",
      `${BACKEND_API_BASE_URL_HTTP}/greypaper/new/workspaces/${workspaceId}/result`
    )

    if (!response.ok) {
      console.log(`🚀🚀🚀 Status: ${response.status}, ${await response.text()}`)
    }
    return response.json()
  } catch (error) {
    console.log(error)
    throw new Error("Failed to get Workspace details (LitePaper).")
  }
}

export async function saveWorkspaceInput(
  token: string,
  workspaceId: string,
  payload: Record<string, any>
) {
  try {
    const response = await backendFetch(
      token,
      "PUT",
      `${BACKEND_API_BASE_URL_HTTP}/greypaper/new/workspaces/${workspaceId}/form`,
      { body: JSON.stringify(payload), contentType: "application/json" }
    )

    if (!response.ok) {
      console.log(`🚀🚀🚀 Status: ${response.status}, ${await response.text()}`)
    }
    return await response.status
  } catch (error) {
    console.log(error)
    throw new Error("Failed to save Workspace input (LitePaper).")
  }
}

export async function saveWorkspaceResult(
  token: string,
  workspaceId: string,
  hash_id: string,
  index: number,
  payload: Record<string, any>
) {
  try {
    const response = await backendFetch(
      token,
      "PUT",
      `${BACKEND_API_BASE_URL_HTTP}/greypaper/new/workspaces/${workspaceId}/result/${hash_id}/${index}`,
      { body: JSON.stringify(payload), contentType: "application/json" }
    )

    if (!response.ok) {
      console.log(`🚀🚀🚀 Status: ${response.status}, ${await response.text()}`)
    }
    return await response.status
  } catch (error) {
    console.log(error)
    throw new Error("Failed to save Workspace Result (LitePaper).")
  }
}

export async function deleteWorkspace(token: string, workspaceId: string) {
  try {
    const response = await backendFetch(
      token,
      "DELETE",
      `${BACKEND_API_BASE_URL_HTTP}/greypaper/new/workspaces/${workspaceId}`
    )
    return response.status
  } catch (error) {
    throw new Error("Failed to delete LitePaper Workspace")
  }
}
