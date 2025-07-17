export interface MessageObject {
  type: string
  body: React.ReactNode | string
}

export interface StreamingContentProps {
  currentStatus?: Status
  streamingText: string[]
  completeResponse: MessageObject[]
  isCompleted: boolean
  handleSourceClick?: (e: React.MouseEvent<HTMLDivElement>) => void
  isStreaming?: boolean
}

interface Status {
  body: string
}

export interface FadeInSlotProps {
  children: React.ReactNode
  node: Element
}

export interface ResponseContentProps
  extends Pick<
    StreamingContentProps,
    "completeResponse" | "streamingText" | "isCompleted"
  > {
  handleSourceClick?: (e: React.MouseEvent<HTMLDivElement>) => void
  isClickable?: boolean
}

export interface HistoryResponseProps extends StreamingContentProps {}

export interface LiveResponseProps extends StreamingContentProps {
  handleSourceClick: (e: React.MouseEvent<HTMLDivElement>) => void
}

export type SourceState = {
  ref: string
}
