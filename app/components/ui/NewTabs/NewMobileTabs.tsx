import { useEffect, useState } from "react"
import { MobileTabsProps } from "../Tabs/types"
import SingleSelection from "@/components/Shared/SingleSelection/SingleSelection"
import { toPascalCase } from "@/utils/chatSi"

const MobileTabs = ({
  initialTabIndex,
  tabs,
  onTabChange,
  actionIcons = null,
}: MobileTabsProps) => {
  // Find the initial tab index based on the ID
  const getTabIndexById = (tabId: string | number) => {
    const index = tabs.findIndex((tab) => tab.id === tabId)
    return index >= 0 ? index : 0
  }

  const [selectedTab, setSelectedTab] = useState(() => {
    return getTabIndexById(initialTabIndex)
  })

  // Update the selected tab when initialTabIndex changes
  useEffect(() => {
    const newIndex = getTabIndexById(initialTabIndex)
    if (newIndex !== selectedTab) {
      setSelectedTab(newIndex)
    }
  }, [initialTabIndex, selectedTab, tabs])

  const handleChange = (value: string | number) => {
    setSelectedTab(Number(value))
    onTabChange(Number(value))
  }

  // Transform tabs into options format for SelectField
  const options = tabs.map((tab, index) => ({
    value: String(index),
    label: toPascalCase(tab.label),
  }))

  return (
    <div className="flex flex-col w-full">
      {actionIcons && (
        <div className="flex items-center mb-4">{actionIcons}</div>
      )}
      <SingleSelection
        placeholder="Select option"
        value={String(selectedTab)}
        handleValueChange={handleChange}
        options={options}
      />
    </div>
  )
}

export default MobileTabs
