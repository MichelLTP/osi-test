import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faLightbulb } from "@fortawesome/free-regular-svg-icons"
import { WhileYouWaitProps } from "./type"
import { Skeleton } from "@/components/ui/Skeleton/Skeleton"

export default function WhileYouWait({ inputText }: WhileYouWaitProps) {
  return (
    <div className="flex flex-col my-6 md:my-0">
      <div className="flex items-center space-x-2 md:mb-2">
        <span className="text-secondary dark:text-white">
          <FontAwesomeIcon icon={faLightbulb} size="lg" />
        </span>
        <span className="text-secondary dark:text-white text-xl font-bold">
          Did you know?
        </span>
      </div>
      {(inputText?.length ?? 0 > 0) ? (
        <div className=" lg:mb-5 sm:mb-auto">
          <span className="text-secondary dark:text-white text-base">
            {inputText}
          </span>
        </div>
      ) : (
        <div className="mt-5">
          {Array(3)
            .fill(null)
            .map((_, index) => (
              <Skeleton key={index} className="h-[23px] w-full mb-2" />
            ))}
        </div>
      )}
    </div>
  )
}
