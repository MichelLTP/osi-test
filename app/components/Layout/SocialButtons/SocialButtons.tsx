import React, { useState, useEffect } from "react"
import { Link, useFetcher } from "@remix-run/react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faBug } from "@fortawesome/free-solid-svg-icons"
import { faThumbsDown, faThumbsUp } from "@fortawesome/free-regular-svg-icons"
import { Button } from "@/components/ui/Button/Button"
import { FeedbackState, SocialButtonsProps } from "./type"
import TextArea from "@/components/ui/TextArea/TextArea"
import { toast } from "@/hooks/useToast"
import { cn } from "@/utils/shadcn/utils"
import { action } from "@/routes/documentTools.summarization.response"
import Modal from "@/components/Shared/Modal/Modal"

const SocialButtons: React.FC<SocialButtonsProps> = ({
  response,
  responseIds = [],
  onFeedbackChange,
}) => {
  const [showReportModal, setShowReportModal] = useState(false)
  const [reportText, setReportText] = useState("")
  const [isFeedbackSubmitting, setIsFeedbackSubmitting] = useState(false)
  const [feedbackState, setFeedbackState] = useState<FeedbackState>(
    response?.feedback || "NEUTRAL"
  )
  const fetcher = useFetcher<typeof action>()

  useEffect(() => {
    if (response?.feedback) {
      setFeedbackState(response.feedback)
    }
  }, [response])

  useEffect(() => {
    if (
      fetcher.data?.feedbackState &&
      fetcher.data.feedbackState !== "failed"
    ) {
      setFeedbackState(fetcher.data.feedbackState)
      setIsFeedbackSubmitting(false)
      if (fetcher.data.feedbackState === "DISLIKE") {
        toast({
          title: "Report sent",
          description: "Thanks for your feedback",
          variant: "success",
        })
      }
    }
    if (onFeedbackChange) {
      const feedbackField = fetcher.data?.feedbackField || ""
      const feedbackState =
        (fetcher.data?.feedbackState as FeedbackState) || "NEUTRAL"
      onFeedbackChange(feedbackField, feedbackState)
    }
  }, [fetcher.data])

  const handleLike = () => {
    const newState = feedbackState === "LIKE" ? "NEUTRAL" : "LIKE"
    submitFeedback(newState)
  }

  const handleDislike = () => {
    if (feedbackState === "DISLIKE") {
      submitFeedback("NEUTRAL")
    } else {
      setShowReportModal(true)
    }
  }

  const handleReportSubmit = () => {
    submitFeedback("DISLIKE", reportText)
    setShowReportModal(false)
    setReportText("")
  }

  const submitFeedback = (state: FeedbackState, report?: string) => {
    setIsFeedbackSubmitting(true)

    const formData = new FormData()
    formData.append("feedbackState", state)

    if (report) {
      formData.append("report", report)
    }

    responseIds.forEach(({ name, value }) => {
      if (value) formData.append(name, value)
    })

    fetcher.submit(formData, {
      method: "post",
      action: "?intent=feedback",
    })
  }

  const handleModalClose = () => {
    setShowReportModal(false)
    setReportText("")
  }

  return (
    <>
      <div className="space-x-1">
        <Button
          className={cn(
            "text-[17px]",
            isFeedbackSubmitting &&
              "text-gray-400 dark:text-gray-600 pointer-events-none",
            feedbackState === "LIKE" && "text-primary dark:text-primary"
          )}
          type="submit"
          variant="ghost"
          onClick={handleLike}
          disabled={isFeedbackSubmitting}
        >
          <FontAwesomeIcon icon={faThumbsUp} />
        </Button>

        <Button
          className={cn(
            "text-[17px] scale-x-[-1]",
            isFeedbackSubmitting &&
              "text-gray-400 dark:text-gray-500 pointer-events-none",
            feedbackState === "DISLIKE" && "text-primary dark:text-primary"
          )}
          variant="ghost"
          onClick={handleDislike}
          disabled={isFeedbackSubmitting}
        >
          <FontAwesomeIcon icon={faThumbsDown} />
        </Button>
      </div>

      {showReportModal && (
        <Modal
          title={"Report Issue"}
          handleClose={handleModalClose}
          icon={faBug}
        >
          <TextArea
            id="description"
            name="description"
            placeholder="Describe the issue you encountered"
            className="bg-third dark:bg-secondary-dark resize-none overflow-y-auto max-h-[120px] leading-[1.5] outline-none text-secondary dark:text-white"
            value={reportText}
            onChange={(e) => setReportText(e.target.value)}
            rows={5}
          />
          <p className="text-secondary dark:text-white text-sm mt-2">
            *Raise a{" "}
            <Link
              to="https://jti.service-now.com/sp?id=index"
              className="text-primary hover:underline transition-all"
              target="_blank"
              rel="noopener noreferrer"
            >
              ticket
            </Link>{" "}
            if you wish to report the issue to IT
          </p>

          <div className="flex justify-end mt-10 gap-2">
            <Button
              disabled={!reportText.trim()}
              onClick={handleReportSubmit}
              className="px-4 py-2"
            >
              Submit
            </Button>
          </div>
        </Modal>
      )}
    </>
  )
}

export default SocialButtons
