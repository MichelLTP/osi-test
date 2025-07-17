import { MessageObject } from "@/components/ChatSi/ChatSiResponse/type"

const customJsonParser = (inputString: string): MessageObject[] => {
  // Remove any invisible characters and trim
  const cleanedInput = inputString
    .replace(/[\u0000-\u001F\u007F-\u009F\u200B-\u200D\uFEFF]/g, "")
    .trim()

  // Check if the input is a single JSON object
  try {
    return [JSON.parse(cleanedInput)]
  } catch (e) {
    // If parsing as a single object fails, continue with multiple object parsing
  }

  // Split the input string into an array of JSON-like strings
  const jsonStrings = cleanedInput.split(/}\s*{/).map((str, index, array) => {
    if (index === 0) return str + "}"
    if (index === array.length - 1) return "{" + str
    return "{" + str + "}"
  })

  // Parse each JSON string
  const result = jsonStrings.map((jsonString) => {
    try {
      return JSON.parse(jsonString)
    } catch (error) {
      console.error(`Error parsing JSON: ${error.message}`)
      return null
    }
  })

  // Filter out any null results from parsing errors
  return result.filter((item) => item !== null)
}

export const parseMessages = (
  messages: { message: string }[]
): MessageObject[] => {
  return messages
    .map((msg) => {
      try {
        if (!msg.message.includes("type") || !msg.message.includes("body")) {
          return null
        }
        return customJsonParser(msg.message) as MessageObject[]
      } catch (error) {
        console.error("Error parsing message:", error)
        return null
      }
    })
    .filter((msg): msg is MessageObject[] => msg !== null)
    .flat()
}
