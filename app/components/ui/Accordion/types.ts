export type AccordionContextType = {
  expandedItems: string[] | string
  setExpandedItems: (items: string[] | string) => void
  autoExpand: (value: string) => void
}

export interface AccordionBaseProps {
  defaultExpanded?: string[] | string
  onExpandChange?: (expanded: string[] | string) => void
  className?: string
  children: React.ReactNode
}

export interface AccordionProps extends AccordionBaseProps {
  type: "single" | "multiple"
  collapsible?: boolean
}
