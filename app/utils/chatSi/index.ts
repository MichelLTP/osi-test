import { MetadataObject } from "@/components/ChatSi/ChatSiResponse/type"
import { parseMessages } from "../sse/parseMessages"

export const extractIds = (
  input: string
): {
  sessionId: string | null
  jobId: string | null
} => {
  try {
    const data: any = parseMessages([{ message: input }])
    const metadataObject = data
      .flat()
      .find(
        (item): item is MetadataObject =>
          item && typeof item === "object" && item.type === "id_metadata"
      )

    if (metadataObject && metadataObject.body) {
      return {
        sessionId: metadataObject.body.session_id ?? null,
        jobId: metadataObject.body.job_id ?? null,
      }
    }

    return { sessionId: null, jobId: null }
  } catch (error) {
    console.error("Error parsing JSON:", error)
    return { sessionId: null, jobId: null }
  }
}

export function toPascalCase(str: string): string {
  return str.replace(/(?:^\w|[A-Z]|\b\w)/g, (word: string) => {
    return word.toUpperCase()
  })
}
