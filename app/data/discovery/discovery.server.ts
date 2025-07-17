import { BACKEND_API_BASE_URL_HTTP } from "@/utils/envvars"
import { backendFetch } from "@/utils/fetch"

// Fetch the list of tags
export async function fetchDiscoveryTags(token: string) {
  const response = await backendFetch(
    token,
    "GET",
    `${BACKEND_API_BASE_URL_HTTP}/discovery/new/tags`,
    { contentType: null }
  )
  return response
}

export async function fetchDiscoveryStoryByID(token: string, id: string) {
  const response = await backendFetch(
    token,
    "GET",
    `${BACKEND_API_BASE_URL_HTTP}/discovery/new/stories/${id}`,
    { contentType: "application/json" }
  )
  const storyData = await response.json()

  if (!storyData) {
    throw new Error("Failed to fetch Discovery Stories")
  }
  const apiDataStructure = { portraits: storyData }
  // Enhance the portraits with image URLs
  const enhancedStoryData = await enhancePortraitsWithImages(
    apiDataStructure,
    token
  )

  return enhancedStoryData
}

export async function fetchAllDiscoveryStories(
  token: string,
  formData: FormData
) {
  const formDataObj: { [key: string]: any } = {}
  for (const [key, value] of formData.entries()) {
    formDataObj[key] = value
  }

  const body =
    Object.keys(formDataObj.tags).length === 2
      ? JSON.stringify({ tags: [] })
      : JSON.stringify({ tags: JSON.parse(formDataObj.tags) })

  const response = await backendFetch(
    token,
    "POST",
    `${BACKEND_API_BASE_URL_HTTP}/discovery/new/stories/search`,
    {
      body,
      contentType: "application/json",
      customMessage: "Failed to POST Discovery Stories",
    }
  )

  const portraitsData = await response.json()

  if (!portraitsData) {
    throw new Error("Failed to fetch Discovery Stories")
  }
  // Enhance the portraits with image URLs amd Audio URLs
  const enhancedPortraitsData = await enhancePortraitsWithImages(
    portraitsData,
    token
  )

  return enhancedPortraitsData
}

// Function to enhance portraits with image URLs
export async function enhancePortraitsWithImages(
  portraitsData: any,
  token: string
) {
  try {
    const enhancedData = JSON.parse(JSON.stringify(portraitsData))
    const enhanceImage = async (
      item: any,
      mediaType: string,
      label: string
    ) => {
      if (item?.image?.id) {
        try {
          item.image.url = await fetchMediaById(item.image.id, mediaType, token)
        } catch (error) {
          console.error(
            `Failed to fetch image for ${label} ${item.title || item.id}:`,
            error
          )
          item.image.url = null
        }
      }
    }

    const enhanceMediaArray = async (
      items: any,
      mediaType: string,
      label: string
    ) => {
      if (Array.isArray(items)) {
        for (const item of items) {
          await enhanceImage(item, mediaType, label)
        }
      } else {
        await enhanceImage(items, mediaType, label)
      }
    }

    // Enhance portraits
    await enhanceMediaArray(enhancedData.portraits, "images", "portrait")

    // Enhance audios
    if (Array.isArray(enhancedData.portraits?.audios)) {
      for (const audio of enhancedData.portraits.audios) {
        if (audio?.id) {
          try {
            audio.url = await fetchMediaById(audio.id, "audios", token)
          } catch (error) {
            console.error(`Failed to fetch audio for ${audio.id}:`, error)
            audio.url = null
          }
        }
      }
    }

    // Enhance sections
    await enhanceMediaArray(
      enhancedData.portraits?.sections,
      "images",
      "section"
    )

    // Enhance key_questions
    await enhanceMediaArray(enhancedData.key_questions, "images", "question")

    return enhancedData
  } catch (error) {
    console.error("Error enhancing portraits with images:", error)
    throw new Error("Failed to process portrait images")
  }
}

async function fetchMediaById(
  mediaId: string,
  mediaType: "images" | "audios",
  token: string
) {
  try {
    const response = await backendFetch(
      token,
      "GET",
      `${BACKEND_API_BASE_URL_HTTP}/admin_panel/discovery/stories/${mediaType}/${mediaId}`
    )

    if (!response.ok) throw new Error("Fetch failed")
    const blob = await response.blob()
    const buffer = await blob.arrayBuffer()
    const base64 = Buffer.from(buffer).toString("base64")
    const contentType =
      response.headers.get("content-type") ||
      (mediaType === "images" ? "image/jpeg" : "audio/mpeg")
    return `data:${contentType};base64,${base64}`
  } catch (error) {
    throw new Error(`Failed to fetch ${mediaType.slice(0, -1)}`)
  }
}
