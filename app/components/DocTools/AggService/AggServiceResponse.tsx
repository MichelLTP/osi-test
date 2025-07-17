import useAggServiceStore, {
  DisplayTopic,
} from "@/store/AggregatorService/aggregatorservice"
import { OutputSectionResponse } from "@/components/LitePaper/Output/types"
import {
  findMatchingContent,
  renderOutputHandler,
} from "@/utils/documentTools/adminPanel/aggservice"

const AggServiceResponse = ({ topics }: { topics: DisplayTopic[] }) => {
  const { result, updateOutputSectionResponse } = useAggServiceStore()

  const handleSave = (content: OutputSectionResponse, docValue: string) => {
    updateOutputSectionResponse(content.uuid || "", content.index ?? 0, {
      type: "Markdown",
      result: docValue,
    })
  }
  return (
    <>
      {topics &&
        topics.map((topic, index: number) => {
          // Get the content for this topic
          const topicContent = findMatchingContent(topic?.response_uuid, result)

          return (
            <div key={index} className="mb-[40px]">
              <h5 className="text-basebold text-left text-primary">
                {topic?.title}
              </h5>

              {renderOutputHandler(
                {
                  ...topicContent,
                  index,
                  uuid: topic.response_uuid,
                  type: "Markdown",
                } as OutputSectionResponse,
                handleSave
              )}
            </div>
          )
        })}
    </>
  )
}

export default AggServiceResponse
