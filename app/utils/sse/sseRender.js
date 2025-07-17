export const askChatSI = (messages) => {
  return fetch("/api/chatsi", {
    method: "POST",
    body: JSON.stringify({ messages }),
  })
}

export const askDocumentToolsQA = (messages) => {
  return fetch("/api/doctoolsQA", {
    method: "POST",
    body: JSON.stringify({ messages }),
  })
}

export const askDocumentToolsOutputParsers = (messages) => {
  return fetch("/api/doctoolsOutputParsers", {
    method: "POST",
    body: JSON.stringify({ messages }),
  })
}

export const previewLitePaperSection = (formData) => {
  return fetch("/api/greypaperPreview", {
    method: "POST",
    body: formData,
  })
}

export const runLitePaper = (formData) => {
  return fetch("/api/greypaperRun", {
    method: "POST",
    body: formData,
  })
}

export const askAgg = (formData) => {
  return fetch("/api/agg", {
    method: "POST",
    body: formData,
  })
}

export const askAggService = (formData) => {
  return fetch("/api/doctoolsAggService", {
    method: "POST",
    body: formData,
  })
}

export const runSearchSpaceInsights = (id) => {
  return fetch("/api/spaceInsights?id=" + id, {
    method: "PUT",
  })
}

export const processChatResponse = async ({ response, onChunk }) => {
  if (!response.body) {
    throw new Error("Response body is null or undefined")
  }
  const reader = response.body.pipeThrough(new TextDecoderStream()).getReader()
  let buffer = "" // Buffer to store incomplete JSON data
  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += value // Append the new chunk to the buffer
      // Process all parts that begin with 'data:'
      let parts = buffer.split("data: ").filter(Boolean) // Split by 'data:' and ignore empty parts
      let lastCompleteIndex = -1
      try {
        for (let i = 0; i < parts.length; i++) {
          const part = parts[i].trim()

          // Skip processing if the part contains ' ping - '
          if (part.includes(" ping - ")) {
            continue
          }

          if (part) {
            const parsedChunk = JSON.parse(part) //DO NOT REMOVE try to break it in case is not a valid chunk
            onChunk(part.toString().replace(/^\s+/, "").replace(/\n/g, ""))
            // console.log('sent in SSE:', part)
            lastCompleteIndex = i
          }
        }
        buffer = ""
      } catch (error) {
        // console.log("Incomplete or invalid chunk, waiting for more data:", buffer, error);
        buffer = parts.slice(lastCompleteIndex + 1).join("data: ")
      }
    }
  } catch (error) {
    console.error("Error processing chat response:", error)
    throw error
  } finally {
    reader.releaseLock()
  }
}

export const processOpenStoryResponse = async ({ response, onChunk }) => {
  if (!response.body) {
    throw new Error("Response body is null or undefined")
  }
  const reader = response.body.pipeThrough(new TextDecoderStream()).getReader()
  let buffer = "" // Buffer to store incomplete JSON data

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += value // Append the new chunk to the buffer

      // Process all parts that begin with 'data:'
      let parts = buffer.split("data: ").filter(Boolean) // Split by 'data:' and ignore empty parts
      let lastCompleteIndex = -1
      try {
        for (let i = 0; i < parts.length; i++) {
          const part = parts[i].trim()
          // Skip processing if the part contains ' ping - '
          if (part.includes(" ping - ")) {
            continue
          }

          if (part) {
            onChunk(part)
            lastCompleteIndex = i
          }
        }
        buffer = ""
      } catch (error) {
        // console.log("Incomplete or invalid chunk, waiting for more data:", buffer, error);
        buffer = "data: " + parts.slice(lastCompleteIndex + 1).join("data: ")
      }
    }
  } catch (error) {
    console.error("Error processing chat response:", error)
    throw error
  } finally {
    reader.releaseLock()
  }
}

export const processLitePaperResponse = async ({ response, onChunk }) => {
  if (!response.body) {
    throw new Error("Response body is null or undefined")
  }

  const reader = response.body.pipeThrough(new TextDecoderStream()).getReader()
  let buffer = "" // Buffer to store incomplete JSON data

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += value // Append the new chunk to the buffer

      // Process all parts that begin with 'data:'
      let parts = buffer.split("data: ").filter(Boolean) // Split by 'data:' and ignore empty parts
      let lastCompleteIndex = -1
      try {
        for (let i = 0; i < parts.length; i++) {
          const part = parts[i].trim()

          // Skip processing if the part contains ' ping - '
          if (part.includes(" ping - ")) {
            continue
          }

          if (part) {
            const parsedChunk = JSON.parse(part) //DO NOT REMOVE try to break it in case is not a valid chunk
            onChunk(part)
            lastCompleteIndex = i
          }
        }
        buffer = ""
      } catch (error) {
        // console.log("Incomplete or invalid chunk, waiting for more data:", buffer, error);
        buffer = "data: " + parts.slice(lastCompleteIndex + 1).join("data: ")
      }
    }
  } catch (error) {
    console.error("Error processing chat response:", error)
    throw error
  } finally {
    reader.releaseLock()
  }
}

export const askOmmChat = (
  message,
  threadId,
  marketID,
  scenarioID,
  scenarioName
) => {
  return fetch("/api/omm_chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message,
      threadId,
      marketID,
      scenarioID,
      scenarioName,
    }),
  })
}

export const processQAResponse = async ({ response, onChunk }) => {
  if (!response.body) {
    throw new Error("Response body is null or undefined")
  }
  const reader = response.body.pipeThrough(new TextDecoderStream()).getReader()
  let buffer = "" // Buffer to store incomplete JSON data
  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += value // Append the new chunk to the buffer
      // Process all parts that begin with 'data:'
      let parts = buffer.split("data: ").filter(Boolean) // Split by 'data:' and ignore empty parts
      let lastCompleteIndex = -1
      try {
        for (let i = 0; i < parts.length; i++) {
          const part = parts[i].trim()

          // Skip processing if the part contains ' ping - '
          if (part.includes(" ping - ")) {
            continue
          }

          if (part) {
            onChunk(part.toString().replace(/^\s+/, "").replace(/\n/g, ""))
            // console.log('sent in SSE:', part)
            lastCompleteIndex = i
          }
        }
        buffer = ""
      } catch (error) {
        // console.log("Incomplete or invalid chunk, waiting for more data:", buffer, error);
        buffer = parts.slice(lastCompleteIndex + 1).join("data: ")
      }
    }
  } catch (error) {
    console.error("Error processing chat response:", error)
    throw error
  } finally {
    reader.releaseLock()
  }
}

export const processSearchSpaces = async ({ response, onChunk }) => {
  if (!response.body) {
    throw new Error("Response body is null or undefined")
  }
  const reader = response.body.pipeThrough(new TextDecoderStream()).getReader()
  let buffer = "" // Buffer to store incomplete JSON data

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += value // Append the new chunk to the buffer

      // Process all parts that begin with 'data:'
      let parts = buffer.split("data: ").filter(Boolean) // Split by 'data:' and ignore empty parts
      let lastCompleteIndex = -1
      try {
        for (let i = 0; i < parts.length; i++) {
          const part = parts[i].trim()
          // Skip processing if the part contains ' ping - '
          if (part.includes(" ping - ")) {
            continue
          }

          if (part) {
            const parsedChunk = JSON.parse(part) //DO NOT REMOVE try to break it in case is not a valid chunk
            
            onChunk(part)
            lastCompleteIndex = i
          }
        }
        buffer = ""
      } catch (error) {
        // console.log("Incomplete or invalid chunk, waiting for more data:", buffer, error);
        buffer = "data: " + parts.slice(lastCompleteIndex + 1).join("data: ")
      }
    }
  } catch (error) {
    console.error("Error processing chat response:", error)
    throw error
  } finally {
    reader.releaseLock()
  }
}
