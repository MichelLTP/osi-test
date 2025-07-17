import { ReactNode, useState, useEffect, useRef } from "react"

export type Tab = {
  label: string
  id?: string
  children: ReactNode
  isMarkdown: boolean
}

export function useTabs({
  tabs,
  initialTabIndex,
  onChange,
}: {
  tabs: Tab[]
  initialTabIndex: number
  onChange?: (id: string) => void
}) {
  const userSelectedRef = useRef(false)

  const [[selectedTabIndex, direction], setSelectedTab] = useState(() => [
    initialTabIndex === -1 ? 0 : initialTabIndex,
    0,
  ])

  // Add effect to update selectedTabIndex when initialTabIndex changes
  // BUT only if the user hasn't manually selected a tab
  useEffect(() => {
    if (
      initialTabIndex !== -1 &&
      initialTabIndex !== selectedTabIndex &&
      !userSelectedRef.current
    ) {
      setSelectedTab([
        initialTabIndex,
        initialTabIndex > selectedTabIndex ? 1 : -1,
      ])
    }
  }, [initialTabIndex, selectedTabIndex])

  // Wrapper for setSelectedTab that also marks the selection as user-initiated
  const handleUserTabSelection = (newTabState: [number, number]) => {
    userSelectedRef.current = true
    setSelectedTab(newTabState)
  }

  return {
    tabProps: {
      tabs,
      selectedTabIndex,
      onChange,
      setSelectedTab: handleUserTabSelection,
      setProgrammaticTab: setSelectedTab,
    },
    selectedTab: tabs[selectedTabIndex],
    contentProps: {
      direction,
      selectedTabIndex,
    },
    resetUserSelection: () => {
      userSelectedRef.current = false
    },
  }
}
