import { Button } from "@/components/ui/Button/Button"
import { useHistorybar } from "@/store/layout"
import {
  faCheck,
  faInfoCircle,
  faPaperPlane,
  faSliders,
} from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { motion } from "framer-motion"
import React, { useRef, useState } from "react"
import { IChatBar } from "./type"
import { useFetcher } from "@remix-run/react"
import RouteFiltersDropdown from "./RouteFilters/RouteFiltersDropdown"
import { useChatSiStreamingComplete, useSelectedRouter } from "@/store/chatsi"
import { useFiltersStore } from "@/store/filters"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/Popover/Popover"
import SearchType from "@/components/Shared/SearchType/SearchType"
import { cn } from "@/utils/shadcn/utils"
import Tooltip from "@/components/ui/Tooltip/Tooltip"

const ChatbarArea = ({
  disabled,
  handlerClickFilters,
  handlePromptSubmit,
  placeholder,
  preDefinedPrompt,
  hasFilters,
  hasRouters,
  hasInfo,
  hasSearchType,
  direction = "row",
  isResponseRendered,
  isDocumentRouter = true,
  selectedOption,
  onOptionSelect,
}: IChatBar): React.ReactElement => {
  const buttonRef = useRef<HTMLButtonElement>(null)
  const fetcher = useFetcher()
  const { isHistorybarOpen, setIsHistorybarOpen } = useHistorybar()
  const { isFiltersSelected } = useFiltersStore()
  const [textareaValue, setTextareaValue] = useState(preDefinedPrompt || "")
  const [isOpen, setIsOpen] = useState(false)
  const { isChatSiStreamingComplete } = useChatSiStreamingComplete()
  const { selectedRouter } = useSelectedRouter()
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [textareaWidth, setTextareaWidth] = useState<number>(0)

  const showFilters = hasRouters ? hasFilters && isDocumentRouter : hasFilters

  const handleButtonClick = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    if (textareaValue !== "") {
      if (isHistorybarOpen) {
        setIsHistorybarOpen(false)
      }
      e.preventDefault()
      handlePromptSubmit?.(textareaValue)
      setTextareaValue("")
    }
  }

  const handleEnterKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      if (buttonRef.current) {
        buttonRef.current.click()
      }
    }
  }

  React.useEffect(() => {
    const textarea = textareaRef.current
    if (!textarea) return

    const updateWidth = () => setTextareaWidth(textarea.offsetWidth)
    updateWidth()

    const resizeObserver = new window.ResizeObserver(updateWidth)
    resizeObserver.observe(textarea)

    window.addEventListener("resize", updateWidth)
    return () => {
      resizeObserver.disconnect()
      window.removeEventListener("resize", updateWidth)
    }
  }, [])

  const handleTextareaResize = (e) => {
    const textarea = e.target
    textarea.style.height = "auto"
    textarea.style.height = textarea.scrollHeight + "px"
  }

  return (
    <div className="w-full lg:max-w-[822px] mx-auto flex transform-none pb-5">
      <div
        className="focus-within:border-primary transition-[border-color] duration-300 focus-within:border-opacity-15 focus-within:border border border-transparent relative flex items-center w-full bg-third dark:bg-secondary-dark rounded-sm overflow-hidden translate-x-0 ease-in-out py-4 px-6"
        ref={textareaRef}
      >
        <fetcher.Form
          className="w-full flex items-center h-full gap-4"
          method="post"
        >
          <div className="flex h-full sm:flex-row w-full gap-4 items-center justify-between">
            <div
              className={cn(
                "flex gap-4 w-full max-w-[90%]",
                direction === "row" && "flex-row-reverse items-center",
                direction === "column" && "flex-col"
              )}
            >
              <div className="flex items-start sm:items-center w-full h-full">
                <motion.textarea
                  value={textareaValue}
                  onChange={(e) => {
                    setTextareaValue(e.target.value)
                    handleTextareaResize(e)
                  }}
                  onInput={handleTextareaResize}
                  onKeyDown={handleEnterKeyDown}
                  className="w-full bg-third dark:bg-secondary-dark resize-none overflow-y-auto max-h-[120px] leading-[1.5] outline-none text-secondary dark:text-white transition-none [&:placeholder-shown]:overflow-y-hidden pt-[2px] styled-scrollbar"
                  rows={1}
                  placeholder={placeholder}
                  disabled={disabled}
                  name="prompt"
                />
              </div>
              <div className="flex items-center gap-2">
                {hasRouters && (
                  <RouteFiltersDropdown
                    isResponseRendered={isResponseRendered ?? false}
                    maxWidth={textareaWidth}
                  />
                )}

                {showFilters && (
                  <Tooltip
                    text="Filters"
                    className={cn(
                      "gap-2 h-auto relative !mr-0 !p-0",
                      !isChatSiStreamingComplete && "pointer-events-none"
                    )}
                    icon={faSliders}
                    onClick={handlerClickFilters}
                    disabled={!isChatSiStreamingComplete}
                  >
                    {isFiltersSelected && (
                      <FontAwesomeIcon
                        icon={faCheck}
                        className="bg-success rounded-full text-white scale-[0.5] !w-5 !h-5 p-1 absolute -top-3 -right-2"
                      />
                    )}
                  </Tooltip>
                )}
                {hasSearchType && (
                  <Popover open={isOpen} onOpenChange={setIsOpen}>
                    <PopoverTrigger>
                      <Tooltip
                        icon={selectedOption?.icon}
                        text="Method"
                        className={"h-auto !pr-0"}
                        disabled={!isChatSiStreamingComplete}
                      />
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-[350px] bg-white dark:bg-secondary-dark p-[15px] md:p-[30px] rounded-xs"
                      align="center"
                      security="0"
                    >
                      <SearchType
                        isDocumentRouter={isDocumentRouter}
                        onSelectOption={(option) => {
                          onOptionSelect?.(option)
                          setIsOpen(false)
                        }}
                        selectedOption={selectedOption}
                      />
                    </PopoverContent>
                  </Popover>
                )}
                {hasInfo && selectedRouter && (
                  <Tooltip
                    icon={faInfoCircle}
                    text="Info"
                    className={"h-auto !pl-0"}
                    disabled={!isChatSiStreamingComplete}
                    onClick={() => {
                      if (handlePromptSubmit) {
                        handlePromptSubmit(
                          "What prompts are in scope of this router?",
                          selectedRouter?.id
                        )
                      }
                    }}
                  />
                )}
              </div>
            </div>

            <Button
              ref={buttonRef}
              className={cn(
                "rounded-full h-0 w-0 p-4 flex items-center justify-center",
                direction === "column" && "mt-auto"
              )}
              disabled={textareaValue === ""}
              type="submit"
              onClick={handleButtonClick}
            >
              <FontAwesomeIcon
                icon={faPaperPlane}
                className="text-white lg:transform -translate-x-0.5"
              />
            </Button>
          </div>
        </fetcher.Form>
      </div>
    </div>
  )
}

export default ChatbarArea
