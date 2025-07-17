import useAggServiceStore, {
  DisplayMetaAnalysis,
} from "@/store/AggregatorService/aggregatorservice"
import { OutputSectionResponse } from "@/components/LitePaper/Output/types"
import {
  findMatchingContent,
  renderOutputHandler,
} from "@/utils/documentTools/adminPanel/aggservice"

const AggServiceMetaResponse = ({
  meta_analysis,
}: {
  meta_analysis: DisplayMetaAnalysis
}) => {
  const { result, updateOutputSectionResponse } = useAggServiceStore()

  const handleSave = (content: OutputSectionResponse, docValue: string) => {
    updateOutputSectionResponse(content.uuid || "", content.index ?? 0, {
      type: "Markdown",
      result: docValue,
    })
  }

  return (
    <>
      {meta_analysis.topic_meta_analysis &&
        meta_analysis.topic_meta_analysis.map((meta, index: number) => {
          // Get the content for this topic meta analysis
          const metaContent = findMatchingContent(meta?.uuid, result)
          return (
            <div key={index} className="mb-[40px]">
              <h5 className="text-basebold text-left text-primary">
                {meta?.title}
              </h5>

              {renderOutputHandler(
                {
                  ...metaContent,
                  index,
                  uuid: meta.uuid,
                  type: "Markdown",
                } as OutputSectionResponse,
                handleSave
              )}
            </div>
          )
        })}
      {meta_analysis.overall_meta_analysis &&
        meta_analysis.overall_meta_analysis.title.length !== 0 && (
          <div className="mb-[40px]">
            <h5 className="text-basebold text-left text-primary">
              {meta_analysis.overall_meta_analysis.title}
            </h5>

            {renderOutputHandler(
              {
                ...findMatchingContent(
                  meta_analysis.overall_meta_analysis.uuid,
                  result
                ),
                index: 0,
                uuid: meta_analysis.overall_meta_analysis.uuid,
                type: "Markdown",
              } as OutputSectionResponse,
              handleSave
            )}
          </div>
        )}
    </>
  )
}

export default AggServiceMetaResponse
