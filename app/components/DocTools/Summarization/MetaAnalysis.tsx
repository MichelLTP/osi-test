import SocialButtons from "@/components/Layout/SocialButtons/SocialButtons"
import { SummarizationResponseProps } from "@/components/DocTools/Summarization/types"
import { useContentID } from "@/store/copytoclipboard"
import { useEffect } from "react"
import { MarkdownRenderer } from "@/components/Shared/MarkdownRender/MarkdownRender"
import CopyToClipboard from "@/components/Shared/CopyToClipboard/CopyToClipboard"

const MetaAnalysis = ({
  summarizationResponse,
}: {
  summarizationResponse: SummarizationResponseProps
}) => {
  const { setContentID } = useContentID()
  const answerId = `answer-section`
  const responseIds = [
    {
      name: "job_id",
      value: summarizationResponse?.jobID || "",
    },
  ]

  useEffect(() => {
    setContentID(answerId)
  }, [])

  return (
    <>
      <div className="p-4 prose summarization" id={answerId}>
        <MarkdownRenderer
          className="prose summarization"
          value={summarizationResponse?.meta_summary}
        />
      </div>
      <div className="flex justify-end mt-2 mb-10 px-4">
        <SocialButtons
          response={summarizationResponse}
          responseIds={responseIds}
        />
        <CopyToClipboard />
      </div>
    </>
  )
}

export default MetaAnalysis
