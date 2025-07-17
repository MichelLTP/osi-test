import { SummarizationResponseProps } from "@/components/DocTools/Summarization/types"
import { MarkdownRenderer } from "@/components/Shared/MarkdownRender/MarkdownRender"
import CopyToClipboard from "@/components/Shared/CopyToClipboard/CopyToClipboard"
import { useContentID } from "@/store/copytoclipboard"
import { useEffect } from "react"

const TopInsights = ({
  summarizationResponse,
}: {
  summarizationResponse: SummarizationResponseProps
}) => {
  const { setContentID } = useContentID()
  const answerId = `answer-section`

  useEffect(() => {
    setContentID(answerId)
  }, [])

  return (
    <>
      <div className="p-4 prose summarization" id={answerId}>
        <MarkdownRenderer
          className="prose summarization"
          value={summarizationResponse?.top_insights}
        />
      </div>
      <CopyToClipboard className="pl-3 justify-end" />
    </>
  )
}

export default TopInsights
