import {
  AggregatorPrompt,
  OutputSectionResponse,
} from "@/components/LitePaper/Output/types"

export type TextOutputProps = {
  content: OutputSectionResponse | AggregatorPrompt
  handleSave?: (content: OutputSectionResponse, docValue: string) => void
}
