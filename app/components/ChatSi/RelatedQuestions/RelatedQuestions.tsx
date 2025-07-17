import { Skeleton } from "@/components/ui/Skeleton/Skeleton"
import { faLink, faRetweet } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { MessageObject, RelatedQuestionsProps } from "./type"
import { Button } from "@/components/ui/Button/Button"
import { useSSE } from "@/store/chatsi"

export default function RelatedQuestions({
  isLoading,
  parsedMessages,
  routerId,
  isStreaming,
}: RelatedQuestionsProps) {
  const { handleStoreSubmit } = useSSE()

  const streamEnded = parsedMessages.some(
    (msg: MessageObject) => msg.type === "end"
  )
  const relatedQuestions = parsedMessages.find(
    (messageObject: MessageObject) => messageObject.type === "related_questions"
  )
  if (
    streamEnded &&
    (!relatedQuestions ||
      !relatedQuestions.body ||
      relatedQuestions.body.length === 0)
  ) {
    return null
  }
  return (
    <div
      className={`flex flex-col ${
        isStreaming ? "xl:pt-1 border-t xl:mt-4" : "mt-0"
      } border-0`}
    >
      <div className="flex items-center space-x-2 lg:mt-4">
        <span className="text-secondary dark:text-white">
          <FontAwesomeIcon icon={faRetweet} size="lg" />
        </span>
        <span className="text-secondary dark:text-white text-xl font-bold">
          Related questions
        </span>
      </div>
      {isLoading ? (
        <div className="mt-5">
          {Array(3)
            .fill(null)
            .map((_, index) => (
              <Skeleton key={index} className="h-[23px] w-full mb-2" />
            ))}
        </div>
      ) : (
        <div className="mt-2">
          {relatedQuestions &&
            relatedQuestions.body &&
            relatedQuestions.body.map((prompt: string, index: number) => (
              <div
                key={index}
                className="flex items-start gap-x-2 justify-start mt-2"
              >
                <Button
                  variant="ghostIcon"
                  className="!pt-0"
                  icon={faLink}
                  onClick={() => {
                    handleStoreSubmit && handleStoreSubmit(prompt, routerId)
                  }}
                />

                <button
                  className=" text-secondary dark:text-white text-base text-left block hover:underline hover:text-primary focus:outline-none"
                  disabled={isLoading}
                  onClick={() => {
                    handleStoreSubmit && handleStoreSubmit(prompt, routerId)
                  }}
                >
                  {prompt}
                </button>
              </div>
            ))}
        </div>
      )}
    </div>
  )
}
