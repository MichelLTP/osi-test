import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faClose, faPlus, faTrashCan } from "@fortawesome/free-solid-svg-icons"
import { ChatHistoryProps } from "./type"
import HistoryBubble from "./HistoryBubble/HistoryBubble"
import { LoadingComponent } from "@/components/Layout/LoadingComponent/LoadingComponent"
import { useHistorybar } from "@/store/layout"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/Button/Button"
import { useFetcher, useLocation, useNavigate } from "@remix-run/react"
import { useSearchMethod } from "@/store/searchsi"
import { useEffect, useState } from "react"
import { Toaster } from "@/components/ui/Toast/Toaster"

export default function ChatHistory({
  bubbles,
  variant,
  handleNewChatClean,
}: ChatHistoryProps) {
  const titles: Record<string, string> = {
    "chat si": "Chat History",
    "search si": "Search History",
    qa: "Q&A History",
    summarization: "Summarization History",
    aggregator: "Aggregator History",
  }

  const barTitle = variant && titles[variant]
  const { isHistorybarOpen, setIsHistorybarOpen } = useHistorybar()
  const navigate = useNavigate()
  const location = useLocation()
  const fetcher = useFetcher()
  const { searchMethod } = useSearchMethod()
  const [HistoryLoadingState, setHistoryLoadingState] = useState(false)

  const showNewChatButton =
    variant === "chat si" ||
    variant === "search si" ||
    variant === "aggregator" ||
    variant === "qa"

  const handleNewChatClick = () => {
    setIsHistorybarOpen(false)
    if (variant === "chat si" && handleNewChatClean) {
      handleNewChatClean?.()
      navigate("/")
    } else if (variant === "aggregator") {
      handleNewChatClean?.()
      navigate("/documentTools/aggService")
    } else if (variant === "qa") {
      handleNewChatClean?.()
      navigate("/documentTools/QA")
    }
    const currentUrl = location.pathname
    const responseIndex = currentUrl.indexOf("/response")

    let baseUrl
    if (responseIndex !== -1) {
      baseUrl = currentUrl.substring(0, responseIndex)
    } else {
      baseUrl = currentUrl
    }

    navigate(baseUrl)
  }

  const handleDeleteClick = () => {
    setHistoryLoadingState(true)
    const formData = new FormData()
    if (variant === "chat si") {
      formData.append("intent", "clear")
      fetcher.submit(formData, {
        method: "post",
        action: `/chatSi`,
      })
    } else if (variant === "search si") {
      formData.append("method", searchMethod)
      fetcher.submit(formData, {
        method: "post",
        action: `/searchSi`,
      })
    } else if (variant === "qa") {
      formData.append("method", "qaMethod")
      fetcher.submit(formData, {
        method: "post",
        action: `/documentTools/qa`,
      })
    } else if (variant === "summarization") {
      formData.append("method", "summarizationMethod")
      fetcher.submit(formData, {
        method: "post",
        action: `/documentTools/summarization`,
      })
    } else if (variant === "aggregator") {
      fetcher.submit(formData, {
        method: "post",
        action: `?intent=clearHistory`,
      })
    }
  }

  useEffect(() => {
    const isHistoryEmpty = bubbles?.some(
      (bubble) => bubble.title === "History is empty"
    )

    if (isHistoryEmpty) {
      setHistoryLoadingState(false)
    }
  }, [bubbles])

  const handleCloseClick = () => {
    setIsHistorybarOpen(false)
  }

  useEffect(() => {
    setIsHistorybarOpen(false)
  }, [location])

  return (
    <aside className="flex flex-col justify-end items-center">
      <Toaster />
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: isHistorybarOpen ? "0%" : "100%" }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className={`border-l top-0 right-0 bottom-0 fixed bg-third dark:bg-secondary-dark z-30`}
      >
        <div className="flex justify-between items-center p-4">
          <span className="text-xlbold">{barTitle}</span>
          <Button
            className={`transition-opacity duration-300 text-2xl text-secondary dark:text-white absolute top-3 right-3 hover:text-primary dark:hover:text-primary`}
            variant={"ghostIcon"}
            icon={faClose}
            onClick={handleCloseClick}
          ></Button>
        </div>
        <div className="flex flex-col w-full justify-center items-center py-8 overflow-y-auto styled-scrollbar px-4">
          <div
            className={`${
              showNewChatButton
                ? "h-[calc(100vh-16rem)]"
                : "h-[calc(100vh-12rem)]"
            }`}
          >
            {bubbles?.length === 0 || !bubbles || HistoryLoadingState ? (
              <LoadingComponent variant="history" />
            ) : (
              bubbles.map((bubble, index) => (
                <HistoryBubble key={index} bubble={bubble} variant={variant} />
              ))
            )}
          </div>
        </div>
        <div className="w-full bottom-4 flex flex-col items-center justify-center">
          {showNewChatButton && (
            <motion.div
              onClick={handleNewChatClick}
              className="p-2 bg-primary border-primary text-white border text-center rounded-[10px] my-2 w-[226px] h-[36px] hover:bg-transparent hover:text-primary cursor-pointer transition-all ease-in-out duration-300 text-base"
            >
              <FontAwesomeIcon icon={faPlus} />
              <span className="ml-2">
                {{
                  aggregator: "New Aggregator",
                  qa: "New Q&A",
                  "chat si": "New Chat",
                  "search si": "New Search",
                }[variant] || "New Chat"}
              </span>
            </motion.div>
          )}
          <motion.div
            onClick={handleDeleteClick}
            className="p-2 bg-transparent text-error border-error border text-center rounded-[10px] my-2 w-[226px] h-[36px] hover:bg-error hover:text-white cursor-pointer transition-all ease-in-out duration-300 text-base"
          >
            <FontAwesomeIcon icon={faTrashCan} />
            <span className="ml-2">clear history</span>
          </motion.div>
        </div>
      </motion.div>
      <div
        className={`${
          !isHistorybarOpen ? "opacity-0 invisible" : "opacity-50 visible"
        }  transition-all duration-300 md:hidden fixed top-0 bg-secondary dark:bg-primary-dark h-full w-full z-20`}
      ></div>
    </aside>
  )
}
