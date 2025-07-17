export interface RelatedQuestionsProps {
  isLoading: boolean
  parsedMessages: MessageObject[]
  routerId: string
  isStreaming?: boolean
}

export interface MessageObject {
  type: string
  body?: string[]
}
