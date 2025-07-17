import * as React from "react"
import * as AccordionPrimitive from "@radix-ui/react-accordion"

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faMinus, faPlus } from "@fortawesome/free-solid-svg-icons"
import { cn } from "@/utils/shadcn/utils"
import { ChevronDown, ChevronUp } from "lucide-react"
import { AccordionProps } from "./types"
import { AccordionContext, useAccordion } from "@/hooks/useAccordion"
import { transformRouter } from "@/utils/routers/routeFiltersItems"

const Accordion = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Root>,
  AccordionProps & { variant?: "default" | "expandLastOnly" }
>(
  (
    {
      className,
      children,
      onExpandChange,
      variant = "default",
      type,
      ...props
    },
    ref
  ) => {
    const [expandedItems, setExpandedItems] = React.useState<string[] | string>(
      type === "single" ? "" : []
    )

    // Handle controlled component behavior if onExpandChange is provided
    const handleExpandChange = React.useCallback(
      (items: string[] | string) => {
        setExpandedItems(items)
        if (onExpandChange) onExpandChange(items)
      },
      [onExpandChange]
    )

    // Function to auto-expand a new item (close others if needed)
    const autoExpand = React.useCallback(
      (value: string) => {
        if (type === "single") {
          handleExpandChange(value)
        } else {
          handleExpandChange([value])
        }
      },
      [handleExpandChange, type]
    )

    // Manual toggle for user interaction via accordion triggers
    const handleValueChange = React.useCallback(
      (values: string[] | string) => {
        handleExpandChange(values)
      },
      [handleExpandChange]
    )

    return (
      <AccordionContext.Provider
        value={{
          expandedItems,
          setExpandedItems: handleValueChange,
          autoExpand,
          variant,
        }}
      >
        {type === "single" ? (
          <AccordionPrimitive.Root
            ref={ref}
            className={cn("w-full", className)}
            type="single"
            value={expandedItems as string}
            onValueChange={handleValueChange as (value: string) => void}
            collapsible={props.collapsible}
            {...props}
          >
            {children}
          </AccordionPrimitive.Root>
        ) : (
          <AccordionPrimitive.Root
            ref={ref}
            className={cn("w-full", className)}
            type="multiple"
            value={expandedItems as string[]}
            onValueChange={handleValueChange}
            {...props}
          >
            {children}
          </AccordionPrimitive.Root>
        )}
      </AccordionContext.Provider>
    )
  }
)
Accordion.displayName = "Accordion"

interface AccordionItemProps
  extends React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item> {
  isLastItem?: boolean
}

const AccordionItem = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Item>,
  AccordionItemProps
>(({ className, value, isLastItem, ...props }, ref) => {
  const { autoExpand, variant, registerItemValue } = useAccordion()

  // Register this item's value for potential allOpen usage
  React.useEffect(() => {
    if (value && registerItemValue) {
      registerItemValue(value as string)
    }
  }, [value, registerItemValue])

  React.useEffect(() => {
    // Expand if variant is expandLastOnly and this is the last item
    if (variant === "expandLastOnly" && value) {
      autoExpand(value)
    }
  }, [isLastItem, value, autoExpand, variant])

  return (
    <AccordionPrimitive.Item
      ref={ref}
      className={cn("border-b dark:border-third-dark", className)}
      value={value as string}
      {...props}
    />
  )
})
AccordionItem.displayName = "AccordionItem"

interface AccordionTriggerProps
  extends React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger> {
  showMetadataFilters?: boolean | void
  iconStyle?: "default" | "arrow"
  showRouterDocs?:
    | boolean
    | "docs"
    | "radrs"
    | "omm"
    | "grrp"
    | "gpt4"
    | "duckduckgo"
  variant?: "default" | "litePaper section" | "litePaper subsection"
}

const AccordionTrigger = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Trigger>,
  AccordionTriggerProps
>(
  (
    {
      className,
      children,
      showMetadataFilters,
      showRouterDocs,
      iconStyle = "default",
      variant = "default",
      ...props
    },
    ref
  ) => {
    const renderToggleIcon = () => {
      if (iconStyle === "default") {
        return (
          <div
            className={
              variant.includes("litePaper")
                ? "absolute right-2 top-2"
                : "flex items-center"
            }
          >
            <FontAwesomeIcon
              icon={faPlus}
              className="!h-4 !w-4 shrink-0 transition-transform duration-200 group-data-[state=open]:hidden text-primary bg-primary bg-opacity-5 rounded-full p-2"
            />
            <FontAwesomeIcon
              icon={faMinus}
              className="!h-4 !w-4 shrink-0 transition-transform duration-200 group-data-[state=closed]:hidden text-primary bg-primary bg-opacity-5 rounded-full p-2"
            />
          </div>
        )
      }

      if (iconStyle === "arrow") {
        return (
          <div className="self-start">
            <ChevronDown className="transition-transform text-black dark:text-white duration-200 group-data-[state=open]:hidden p-1" />
            <ChevronUp className="transition-transform text-black dark:text-white duration-200 group-data-[state=closed]:hidden p-1" />
          </div>
        )
      }

      return null
    }

    const renderRouterDocs = () => {
      if (!showRouterDocs) return null

      const label = transformRouter(showRouterDocs)

      if (variant === "default") {
        return (
          <p
            className={cn(
              "text-xs bg-primary capitalize text-white rounded-lg px-4 py-1 w-fit max-w-full whitespace-nowrap"
            )}
          >
            {label}
          </p>
        )
      }

      return (
        <p
          className={cn(
            variant === "litePaper section"
              ? "ml-[30px] text-start text-xl text-primary"
              : "text-start text-xl text-primary"
          )}
        >
          {label}
        </p>
      )
    }

    const renderTriggerContent = () => {
      if (variant === "default") {
        return (
          <>
            <div className="flex flex-col items-baseline gap-y-2 md:flex-row md:items-center md:gap-y-0 justify-between w-full mr-8">
              {children}
              {showRouterDocs && (
                <>
                  {!!showMetadataFilters && showRouterDocs === "docs" ? (
                    <div className="flex flex-col gap-1 sm:flex-row sm:gap-5">
                      <p className="w-[140px] text-xs bg-success text-white rounded-lg px-4 py-1">
                        with metadata filters
                      </p>
                      {renderRouterDocs()}
                    </div>
                  ) : (
                    renderRouterDocs()
                  )}
                </>
              )}
            </div>
            {renderToggleIcon()}
          </>
        )
      }

      return (
        <>
          <div className="flex flex-col">
            {children}
            {showRouterDocs && renderRouterDocs()}
          </div>
          {renderToggleIcon()}
        </>
      )
    }

    const getTriggerClassNames = () => {
      if (variant === "litePaper section") {
        return cn(
          "relative flex w-full group border bg-black/[0.02] rounded-[8px] p-7",
          className
        )
      }

      if (variant === "litePaper subsection") {
        return cn(
          "relative flex w-full group border-l-2 border-secondary px-4",
          className
        )
      }

      return cn(
        "flex flex-1 items-center justify-between py-4 text-2xlbold transition-all group",
        className
      )
    }

    return (
      <AccordionPrimitive.Header className="flex">
        <AccordionPrimitive.Trigger
          ref={ref}
          className={getTriggerClassNames()}
          {...props}
        >
          {renderTriggerContent()}
        </AccordionPrimitive.Trigger>
      </AccordionPrimitive.Header>
    )
  }
)

AccordionTrigger.displayName = AccordionPrimitive.Trigger.displayName

const AccordionContent = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>
>(({ className, children, variant = "default", ...props }, ref) => (
  <AccordionPrimitive.Content
    ref={ref}
    className={cn(
      "overflow-hidden text-sm transition-all data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down",
      className
    )}
    {...props}
  >
    {variant === "litePaper section" || variant === "litePaper subsection" ? (
      <div>{children}</div>
    ) : (
      <div className="pb-12 pt-0">{children}</div>
    )}
  </AccordionPrimitive.Content>
))
AccordionContent.displayName = AccordionPrimitive.Content.displayName

export {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
  useAccordion,
}
