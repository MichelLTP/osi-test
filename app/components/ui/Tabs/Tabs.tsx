import React, { useState, useEffect, useRef } from "react"
import { useTabs } from "@/hooks/useTabs"
import { Framer } from "./FramerTabs"
import {
  Outlet,
  useLocation,
  useNavigate,
  useSearchParams,
} from "@remix-run/react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  faCircleInfo,
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons"
import { TabsProps } from "./types"
import { Popover, PopoverContent, PopoverTrigger } from "../Popover/Popover"
import { AnimatePresence, motion } from "framer-motion"
import InfoSection from "./InfoMessage"
import useIsMobile from "@/hooks/useIsMobile"
import { useCloseSidebar } from "@/store/layout"
import MobileTabs from "./MobileTabs"
import ReactMarkdown from "react-markdown"
import { useContentID } from "@/store/copytoclipboard"
import { doesPathIncludeAll } from "@/utils/sharedFunctions"
import { Button } from "../Button/Button"
import { MarkdownRenderer } from "@/components/Shared/MarkdownRender/MarkdownRender"

const Tabs = ({
  hookProps,
  variant,
  isTooltip = false,
  setClipboardText,
}: TabsProps): React.ReactElement => {
  const { tabs, initialTabIndex = 0, message = [] } = hookProps
  const framer = useTabs({ tabs, initialTabIndex })
  const navigate = useNavigate()
  const location = useLocation()
  const isMobile = useIsMobile()
  const [searchParams] = useSearchParams()
  const close = useCloseSidebar((state) => state.close)
  const boundary = useRef<HTMLDivElement>(null)
  const [selectedIndex, setSelectedIndex] = useState(initialTabIndex)
  const { setContentID } = useContentID()
  const tabsContainerRef = useRef<HTMLDivElement>(null)
  const [showLeftArrow, setShowLeftArrow] = useState(false)
  const [showRightArrow, setShowRightArrow] = useState(false)

  const handleTabChange = (index: number) => {
    setSelectedIndex(index)
    if (variant === "header") {
      if (doesPathIncludeAll(["response", "searchSi"], location.pathname)) {
        const jobID = searchParams.get("job_id")
        const sourceID = searchParams.get("source_id")
        if (jobID) {
          navigate(
            `/${tabs[index].id}/response?job_id=${jobID}&isResultStored=true`
          )
        } else if (sourceID) {
          navigate(`/${tabs[index].id}/response?source_id=${sourceID}`)
        } else navigate(`/${tabs[index].id}`)
      } else {
        navigate(`/${tabs[index].id}`)
      }
    }
    framer.tabProps.setSelectedTab([index, index > selectedIndex ? 1 : -1])

    // Scroll the selected tab into view
    if (tabsContainerRef.current) {
      const tabElement = tabsContainerRef.current.children[index] as HTMLElement
      if (tabElement) {
        const containerRect = tabsContainerRef.current.getBoundingClientRect()
        const tabRect = tabElement.getBoundingClientRect()

        if (tabRect.left < containerRect.left) {
          tabsContainerRef.current.scrollBy({
            left: tabRect.left - containerRect.left - 20,
            behavior: "smooth",
          })
        } else if (tabRect.right > containerRect.right) {
          tabsContainerRef.current.scrollBy({
            left: tabRect.right - containerRect.right + 20,
            behavior: "smooth",
          })
        }
      }
    }
  }

  const scrollTabs = (direction: "left" | "right") => {
    if (tabsContainerRef.current) {
      const scrollAmount = direction === "left" ? -200 : 200
      tabsContainerRef.current.scrollBy({
        left: scrollAmount,
        behavior: "smooth",
      })
    }
  }

  const checkScrollArrows = () => {
    if (tabsContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = tabsContainerRef.current
      setShowLeftArrow(scrollLeft > 0)

      // On initial render, if content is wider than container, show right arrow
      const hasOverflow = scrollWidth > clientWidth
      setShowRightArrow(hasOverflow && scrollLeft + clientWidth < scrollWidth)
    }
  }

  const extractTextContent = (children: React.ReactNode): string => {
    if (typeof children === "string") {
      return children
    }
    if (React.isValidElement(children)) {
      return React.Children.toArray(children.props.children).join("")
    }
    return ""
  }

  const renderTabContent = (): React.ReactNode => {
    if (framer.selectedTab) {
      if (framer.selectedTab.isMarkdown) {
        const contentId = `markdown-content-${framer.selectedTab.id}`
        return (
          <div id={contentId}>
            <MarkdownRenderer
              value={extractTextContent(framer.selectedTab.children)}
            />
          </div>
        )
      } else {
        return framer.selectedTab.children
      }
    }
    return null
  }

  useEffect(() => {
    if (framer.selectedTab?.isMarkdown) {
      const contentId = `markdown-content-${framer.selectedTab.id}`
      setContentID(contentId)
    }
  }, [framer.selectedTab, setContentID])

  useEffect(() => {
    if (tabsContainerRef.current) {
      // Initial check for arrows after component mounts and tabs are rendered
      setTimeout(() => {
        checkScrollArrows()
      }, 0)

      // Add scroll event listener to update arrow visibility
      const tabsContainer = tabsContainerRef.current
      tabsContainer.addEventListener("scroll", checkScrollArrows)

      // Check on resize as well
      window.addEventListener("resize", checkScrollArrows)

      return () => {
        tabsContainer.removeEventListener("scroll", checkScrollArrows)
        window.removeEventListener("resize", checkScrollArrows)
      }
    }
  }, [])

  // Run checkScrollArrows again after tabs data changes
  useEffect(() => {
    if (tabsContainerRef.current && tabs.length > 0) {
      setTimeout(() => {
        checkScrollArrows()
      }, 0)
    }
  }, [tabs])

  const getTabClasses = (variant: string, index: number) => {
    if (
      (variant === "default" || variant === "header") &&
      selectedIndex === index
    ) {
      return "text-primary border-b-2 border-primary font-bold"
    } else if (variant === "search result" && selectedIndex === index) {
      return `text-secondary font-bold dark:text-white border-b-2 border-secondary dark:border-white ${
        (close || (!close && isMobile)) && "text-nowrap"
      }`
    } else {
      return `text-secondary dark:text-white ${
        (close || (!close && isMobile)) && "text-nowrap"
      }`
    }
  }

  useEffect(() => {
    if (
      variant !== "header" &&
      variant !== "summarization" &&
      setClipboardText &&
      framer.selectedTab &&
      framer.selectedTab.isMarkdown
    ) {
      const content = extractTextContent(framer.selectedTab.children)
      setClipboardText(content)
    }
  }, [selectedIndex, framer.selectedTab, variant])

  // Not needed anymore. This handling tab selection synchronization.
  useEffect(() => {
    setSelectedIndex(initialTabIndex)
    framer.tabProps.setSelectedTab([initialTabIndex, 0])
  }, [initialTabIndex])

  return (
    <div className="w-full flex flex-col">
      <div
        className={`w-full flex flex-row items-center justify-between border-b pr-0 md:pt-8 mb-8 border-secondary dark:border-white"
        } ${(close || (!close && isMobile)) && "text-nowrap"}`}
      >
        <div
          className={`w-full ${
            variant === "search result"
              ? `flex ${close ? "sm:hidden" : "xl:hidden"}`
              : "flex sm:hidden"
          }`}
        >
          <MobileTabs
            variant={variant}
            initialTabIndex={initialTabIndex}
            tabs={tabs}
            onTabChange={handleTabChange}
          />
        </div>
        <div
          className={`w-full justify-start flex items-center gap-2 ${
            variant === "search result"
              ? `hidden ${close ? "sm:flex" : "xl:flex"}`
              : "hidden sm:flex"
          }`}
        >
          {/* Left scroll arrow - outside tabs container */}
          {showLeftArrow && (
            <Button
              onClick={() => scrollTabs("left")}
              icon={faChevronLeft}
              variant="ghost"
              className="flex-shrink-0 flex items-center justify-center h-8 w-8 rounded-full"
            />
          )}

          {/* Scrollable tabs container */}
          <div className="relative flex-grow overflow-hidden">
            <div
              ref={tabsContainerRef}
              className="w-full flex gap-y-5 gap-x-6 overflow-x-auto scrollbar-hide"
              style={{
                scrollbarWidth: "none",
                msOverflowStyle: "none",
              }}
            >
              {framer.tabProps.tabs.map((tab, index) => (
                <button
                  key={index}
                  className={`text-md flex items-center px-8 pb-[15px] focus:transition-color justify-center flex-shrink-0 ${getTabClasses(
                    variant,
                    index
                  )}`}
                  onClick={() => handleTabChange(index)}
                >
                  {isTooltip ? (
                    <span title={tab?.label}>
                      {tab?.label.length > 30
                        ? tab?.label.substring(0, 27) + "..."
                        : tab?.label}
                    </span>
                  ) : (
                    tab?.label
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Right scroll arrow - outside tabs container */}
          {showRightArrow && (
            <Button
              onClick={() => scrollTabs("right")}
              icon={faChevronRight}
              variant="ghost"
              className="flex-shrink-0 flex items-center justify-center h-8 w-8 rounded-full"
            />
          )}
        </div>

        {/* Info icon for header variant  */}
        {variant === "header" ? (
          <Popover>
            <PopoverTrigger asChild>
              <FontAwesomeIcon
                icon={faCircleInfo}
                className={`absolute right-5 top-5 sm:relative sm:-top-2 sm:right-0 text-primary cursor-pointer hover:text-primary-dark dark:hover:text-white transition-colors`}
                size="xl"
              />
            </PopoverTrigger>
            <AnimatePresence>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
              >
                <PopoverContent
                  className="w-full max-w-[900px] bg-white border dark:bg-secondary-dark border-primary shadow-lg rounded-lg mt-2 text-xs sm:text-sm md:text-md py-8 px-9"
                  align="start"
                  side="left"
                  avoidCollisions={false}
                  collisionBoundary={boundary.current}
                  style={{
                    width: `calc(100vw - 2.5rem - ${
                      isMobile ? "20px" : close ? "120px" : "360px"
                    })`,
                  }}
                >
                  <InfoSection sections={message?.sections} />
                </PopoverContent>
              </motion.div>
            </AnimatePresence>
          </Popover>
        ) : null}
      </div>

      <Framer.Content
        selectedTabIndex={selectedIndex}
        direction={framer.contentProps.direction}
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        >
          {variant === "header" ? <Outlet /> : renderTabContent()}
        </motion.div>
      </Framer.Content>
    </div>
  )
}

export default Tabs
