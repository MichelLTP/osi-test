import { Bubble } from "../../Layout/Historybar/HistoryBubble/type"

export interface ChatHistoryProps {
  bubbles: Bubble[]
  variant?: string
  handleNewChatClean?: () => void
}
