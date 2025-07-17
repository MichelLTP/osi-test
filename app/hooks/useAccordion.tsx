import React from "react"

export const AccordionContext = React.createContext<{
  expandedItems: string[] | string
  setExpandedItems: (value: string[] | string) => void
  autoExpand: (value: string) => void
  variant?: "default" | "expandLastOnly" | "allOpen"
  registerItemValue?: (value: string) => void
}>({
  expandedItems: [],
  setExpandedItems: () => {},
  autoExpand: () => {},
  variant: "default",
})

// Custom hook to access accordion context
export const useAccordion = () => {
  const context = React.useContext(AccordionContext)
  if (!context) {
    throw new Error("useAccordion must be used within an Accordion component")
  }
  return context
}
