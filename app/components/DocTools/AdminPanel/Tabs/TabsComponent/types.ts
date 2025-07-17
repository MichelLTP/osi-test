export interface Tab {
  id: string
  label: string
  content: React.ReactNode
}

export interface TabsProps {
  tabs: Tab[]
  classes: {
    selected: string
    notSelected: string
  }
}

export interface TabsComponentProps {
  TabsProps: TabsProps
  pixelsToResize: number
}
