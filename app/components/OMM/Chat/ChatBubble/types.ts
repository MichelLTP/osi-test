import type { TableData } from "@/components/ui/DynamicDataTable/types"

export type ChatBubbleProps = {
  message: string
  timestamp: Date
  variant: "user" | "ai"
  type?: "code" | "table"
  initialMessage?: boolean
  table_data?: TableData | undefined
}
