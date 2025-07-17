import { BubbleProps, FetcherDataProps } from "./type"
import { useFetcher, useNavigate } from "@remix-run/react"
import { useHistorybar, useLoadingState } from "@/store/layout"
import {
  useDocumentQAStore,
  useSummarizationStore,
} from "@/store/documenttools"
import { useSearchMethod } from "@/store/searchsi"
import { useEffect, useState } from "react"
import Modal from "@/components/Shared/Modal/Modal"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faClose, faExclamationCircle } from "@fortawesome/free-solid-svg-icons"
import { toast } from "@/hooks/useToast"
import { ConfirmationModalProps } from "@/components/LitePaper/types"

const Bubble = ({ bubble, variant }: BubbleProps) => {
  const navigate = useNavigate()
  const fetcher = useFetcher<FetcherDataProps>()
  const { setIsHistorybarOpen } = useHistorybar()
  const { setIsSummarizationResponseLoading, setIsInputCollapsed } =
    useSummarizationStore()
  const { setDocSessionID } = useDocumentQAStore()

  const { setLoadingSearchSI } = useSearchMethod()
  const { setLoadingState } = useLoadingState()

  const [isVisible, setIsVisible] = useState(true)
  const [confirmationModal, setConfirmationModal] =
    useState<ConfirmationModalProps>({
      open: false,
      action: null,
      title: "",
    })

  const handleClick = () => {
    setLoadingState(true)
    setLoadingSearchSI(true)
    if (variant === "chat si") {
      setIsHistorybarOpen(false)
      navigate(
        `/chatSi?intent=history_response&session_id=${bubble.session_id}`
      )
    } else if (variant === "search si") {
      let sanitizedSearchMethod =
        bubble.search_method?.replace(/\s+/g, "") ?? ""
      sanitizedSearchMethod =
        sanitizedSearchMethod.charAt(0).toLowerCase() +
        sanitizedSearchMethod.slice(1)

      if (sanitizedSearchMethod != "") {
        setIsHistorybarOpen(false)
        navigate(
          `/searchSi/${sanitizedSearchMethod}/response?job_id=${bubble.job_id}`
        )
      } else {
        console.error(
          "URL does not match the expected pattern - History Bubble error"
        )
      }
    } else if (variant === "qa") {
      setIsHistorybarOpen(false)
      if (bubble.session_id) {
        setDocSessionID(bubble.session_id)
      }
      navigate(`?intent=history_response&session_id=${bubble.session_id}`)
    } else if (variant === "summarization") {
      setIsHistorybarOpen(false)
      setIsSummarizationResponseLoading(true)
      setIsInputCollapsed(0)
      navigate(
        `/documentTools/summarization/response?intent=history_response&session_id=${bubble.session_id}`
      )
    } else if (variant === "aggregator") {
      setIsHistorybarOpen(false)
      navigate(`?aggId=${bubble.session_id}`)
    }
  }

  const handdleDeleteBuble = (e: React.MouseEvent) => {
    e.stopPropagation()
    setConfirmationModal((prev) => ({
      ...prev,
      open: true,
      title: bubble.title,
    }))
  }

  const handleModalConfirmation = () => {
    setConfirmationModal((prev) => ({ ...prev, open: false }))
    const formData = new FormData()
    formData.append("historyIntent", "delete_single_history")
    formData.append("bubble_id", bubble.session_id ?? bubble.job_id ?? "")
    fetcher.submit(formData, {
      method: "post",
    })
  }

  useEffect(() => {
    if (fetcher.data && fetcher.data?.deleteSingleHistory === 200) {
      setIsVisible(false)
      toast({
        title: `Chat deleted successfully`,
        description: `${bubble.title}`,
        variant: "success",
        marginRight: "right-4 sm:right-[280px]",
      })
    }
  }, [fetcher.data])

  if (!isVisible && variant === "chat si") return null

  return (
    <div>
      <button
        className={`relative group ${
          bubble.title == "History is empty"
            ? "my-2 w-[226px] text-left text-secodary"
            : "p-6 pr-12 bg-white dark:bg-opacity-10 rounded-[19px] my-2 w-[226px] hover:bg-primary dark:hover:bg-opacity-100 hover:text-white cursor-pointer transition-all ease-in-out duration-300 text-sm text-left"
        }`}
        onClick={handleClick}
      >
        <span className="line-clamp-2">{bubble.title}</span>
        {bubble.title != "History is empty" && (
          <FontAwesomeIcon
            onClick={handdleDeleteBuble}
            icon={faClose}
            className="absolute top-3 right-3 text-primary group-hover:text-white"
          />
        )}
      </button>
      {confirmationModal.open && (
        <Modal
          title={`Delete chat`}
          size={"small"}
          icon={faExclamationCircle}
          hasCancel
          handleClose={() =>
            setConfirmationModal((prev) => ({
              ...prev,
              open: false,
              action: null,
            }))
          }
          variant={"confirmation"}
          confirmationProps={{
            actionText: "Delete",
            handleAction: () => handleModalConfirmation(),
          }}
        >
          <p className={"mb-12 mt-4"}>
            Are you sure you want to delete{" "}
            <strong>{confirmationModal.title}</strong>?
          </p>
        </Modal>
      )}
    </div>
  )
}

export default Bubble
