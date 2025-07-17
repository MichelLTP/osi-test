import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"
import { motion } from "framer-motion"
import {
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons"

import { cn } from "@/utils/shadcn/utils"
import { Button } from "../Button/Button"
import MobileTabs from "./NewMobileTabs"

// Root Tabs component with orientation support
const Tabs = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Root>
>(({ orientation = "horizontal", ...props }, ref) => (
  <TabsPrimitive.Root ref={ref} orientation={orientation} {...props} />
))
Tabs.displayName = TabsPrimitive.Root.displayName

// Enhanced TabsList with scrolling functionality
const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List> & {
    actionIcons?: React.ReactNode
    variant?: "default" | "result"
    currentValue?: string
    onValueChange?: (value: string) => void
    orientation?: "horizontal" | "vertical"
  }
>(
  (
    {
      className,
      actionIcons,
      variant = "default",
      currentValue,
      onValueChange,
      orientation = "horizontal",
      children,
      ...props
    },
    ref
  ) => {
    const tabsContainerRef = React.useRef<HTMLDivElement>(null)
    const [showLeftArrow, setShowLeftArrow] = React.useState(false)
    const [showRightArrow, setShowRightArrow] = React.useState(false)

    // Extract tabs data and find current index for your MobileTabs component
    const { tabs, initialTabIndex } = React.useMemo(() => {
      const tabElements = React.Children.toArray(children)
      const extractedTabs = tabElements
        .map((child, index) => {
          if (React.isValidElement(child) && child.props.value) {
            return {
              id: child.props.value,
              label:
                typeof child.props.children === "string"
                  ? child.props.children
                  : child.props.value,
            }
          }
          return null
        })
        .filter(Boolean) as Array<{ id: string; label: string }>

      const currentIndex =
        extractedTabs.findIndex((tab) => tab.id === currentValue) || 0

      return {
        tabs: extractedTabs,
        initialTabIndex: Math.max(0, currentIndex),
      }
    }, [children, currentValue])

    const scrollTabs = (direction: "left" | "right") => {
      if (tabsContainerRef.current) {
        const scrollAmount = direction === "left" ? -200 : 200
        tabsContainerRef.current.scrollBy({
          left: scrollAmount,
          behavior: "smooth",
        })
      }
    }

    const checkScrollArrows = React.useCallback(() => {
      if (tabsContainerRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } =
          tabsContainerRef.current
        setShowLeftArrow(scrollLeft > 0)

        // On initial render, if content is wider than container, show right arrow
        const hasOverflow = scrollWidth > clientWidth
        setShowRightArrow(hasOverflow && scrollLeft + clientWidth < scrollWidth)
      }
    }, [])

    React.useEffect(() => {
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
    }, [checkScrollArrows])

    // Run checkScrollArrows again after tabs data changes
    React.useEffect(() => {
      if (tabsContainerRef.current && tabs.length > 0) {
        setTimeout(() => {
          checkScrollArrows()
        }, 0)
      }
    }, [tabs, checkScrollArrows])

    const getBaseClasses = () => {
      if (orientation === "vertical") {
        return "h-full flex flex-col items-start justify-start pr-0"
      }
      return "w-full flex flex-row items-center justify-between pr-0 md:pt-8 mb-8 md:border-b md:border-secondary md:dark:border-white"
    }

    return (
      <div className={cn(getBaseClasses(), className)}>
        {/* Hide mobile tabs for vertical orientation */}
        {orientation === "horizontal" && (
          <div
            className={cn(
              "w-full flex",
              variant !== "result" && "mt-5",
              "md:hidden"
            )}
          >
            <MobileTabs
              tabs={tabs}
              actionIcons={actionIcons}
              initialTabIndex={currentValue || ""}
              variant={variant}
              onTabChange={(index: number) => {
                onValueChange?.(tabs[index].id)
              }}
            />
          </div>
        )}

        <div
          className={cn(
            orientation === "vertical"
              ? "h-full flex flex-col items-start gap-2"
              : "w-full justify-start items-center gap-2 hidden md:flex"
          )}
        >
          {/* Scroll arrows - only for horizontal */}
          {orientation === "horizontal" && showLeftArrow && (
            <Button
              onClick={() => scrollTabs("left")}
              icon={faChevronLeft}
              variant="ghost"
              className="flex-shrink-0 flex items-center justify-center h-8 w-8 rounded-full !pb-[15px]"
            />
          )}

          {/* Scrollable tabs container */}
          <div
            className={cn(
              orientation === "vertical"
                ? "flex-grow overflow-hidden w-full"
                : "flex-grow overflow-hidden",
              actionIcons &&
                variant === "result" &&
                orientation === "horizontal" &&
                "-bottom-1 relative"
            )}
          >
            <div
              ref={tabsContainerRef}
              className={cn(
                orientation === "vertical"
                  ? "h-full flex flex-col gap-y-2 overflow-y-auto scrollbar-hide"
                  : "w-full flex gap-y-5 gap-x-6 overflow-x-auto scrollbar-hide"
              )}
              style={{
                scrollbarWidth: "none",
                msOverflowStyle: "none",
              }}
            >
              <TabsPrimitive.List
                ref={ref}
                className={cn(
                  orientation === "vertical"
                    ? "flex flex-col gap-y-2"
                    : "flex gap-x-6"
                )}
                {...props}
              >
                {children}
              </TabsPrimitive.List>
            </div>
          </div>

          {/* Right scroll arrow - only for horizontal */}
          {orientation === "horizontal" && showRightArrow && (
            <Button
              onClick={() => scrollTabs("right")}
              icon={faChevronRight}
              variant="ghost"
              className="flex-shrink-0 flex items-center justify-center h-8 w-8 rounded-full !pb-[15px]"
            />
          )}

          {/* Action Icons - only for horizontal */}
          {orientation === "horizontal" && actionIcons && (
            <div className="flex items-center">{actionIcons}</div>
          )}
        </div>
      </div>
    )
  }
)
TabsList.displayName = TabsPrimitive.List.displayName

const TAB_TRIGGER_VARIANTS = {
  base: "text-md flex items-center focus:transition-color justify-center flex-shrink-0 text-secondary dark:text-white text-nowrap relative data-[state=active]:font-bold",
  horizontal: {
    base: "px-8 pb-[12px] data-[state=active]:after:content-[''] data-[state=active]:after:absolute data-[state=active]:after:bottom-0 data-[state=active]:after:left-0 data-[state=active]:after:right-0 data-[state=active]:after:h-[2px]",
    result:
      "data-[state=active]:text-secondary data-[state=active]:dark:text-white data-[state=active]:after:bg-secondary data-[state=active]:after:dark:bg-white",
    default:
      "data-[state=active]:text-primary data-[state=active]:dark:text-primary data-[state=active]:after:bg-primary",
  },
  vertical: {
    base: "w-full px-4 py-3 justify-start data-[state=active]:after:content-[''] data-[state=active]:after:absolute data-[state=active]:after:left-0 data-[state=active]:after:top-0 data-[state=active]:after:bottom-0 data-[state=active]:after:w-[2px]",
    result:
      "data-[state=active]:text-secondary data-[state=active]:dark:text-white data-[state=active]:after:bg-secondary data-[state=active]:after:dark:bg-white",
    default:
      "data-[state=active]:text-primary data-[state=active]:dark:text-primary data-[state=active]:after:bg-primary",
  },
} as const

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger> & {
    variant?: "default" | "result"
    orientation?: "horizontal" | "vertical"
    isTooltip?: boolean
  }
>(
  (
    { className, variant, orientation = "horizontal", children, ...props },
    ref
  ) => {
    const getVariantClasses = () => {
      return cn(
        TAB_TRIGGER_VARIANTS.base,
        TAB_TRIGGER_VARIANTS[orientation].base,
        TAB_TRIGGER_VARIANTS[orientation][variant || "default"]
      )
    }

    const renderContent = () => {
      if (typeof children === "string") {
        return (
          <span title={children}>
            {children.length > 30
              ? children.substring(0, 27) + "..."
              : children}
          </span>
        )
      }
      return children
    }

    return (
      <TabsPrimitive.Trigger
        ref={ref}
        className={cn(getVariantClasses(), className)}
        {...props}
      >
        {renderContent()}
      </TabsPrimitive.Trigger>
    )
  }
)
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName

// Enhanced TabsContent with animation
const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content> & {
    animate?: boolean
  }
>(({ className, children, ...props }, ref) => {
  return (
    <TabsPrimitive.Content
      ref={ref}
      className={cn(
        "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        className
      )}
      {...props}
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
      >
        {children}
      </motion.div>
    </TabsPrimitive.Content>
  )
})
TabsContent.displayName = TabsPrimitive.Content.displayName

export { Tabs, TabsList, TabsTrigger, TabsContent }
