import { Tab } from "@/hooks/useTabs"

export interface FramerTabsProps {
  tabs: Tab[]
  selectedTabIndex: number
  setSelectedTab: (input: [number, number]) => void
}

export interface TabsProps {
  hookProps: {
    tabs: Tab[]
    initialTabIndex?: number
    message?: InfoSectionProps
  }
  variant: "result" | "default"
  isMarkdown?: boolean
  isTooltip?: boolean
  setClipboardText?: (input: string) => void
}

export interface InfoSectionProps {
  sections: {
    title: string
    content: string
  }[]
}

export interface MobileTabsProps {
  initialTabIndex: string
  variant: "default" | "result"
  tabs: Tab[]
  onTabChange: (index: number) => void
  actionIcons?: React.ReactNode
}
