import { useNavigate } from "@remix-run/react"
import { motion } from "framer-motion"
import { useEffect, useState } from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
} from "../Select/Select"
import { MobileTabsProps } from "./types"

const MobileTabs = ({
  initialTabIndex,
  variant,
  tabs,
  onTabChange,
}: MobileTabsProps) => {
  const navigate = useNavigate()
  const [selectedTab, setSelectedTab] = useState(initialTabIndex)

  // Update the selected tab when initialTabIndex changes
  useEffect(() => {
    if (initialTabIndex !== selectedTab) {
      setSelectedTab(initialTabIndex)
    }
  }, [initialTabIndex])

  const handleChange = (value: string | number) => {
    const newIndex = Number(value)
    setSelectedTab(newIndex)

    if (variant === "header" && tabs[newIndex]?.id) {
      navigate(`/${tabs[newIndex].id}`)
    }

    onTabChange(newIndex)
  }

  // Force the select value to always match our local state
  const selectValue = String(selectedTab)

  return (
    <Select value={selectValue} onValueChange={handleChange}>
      <SelectTrigger
        className={`w-full px-0 pb-2 text-xl font-bold relative bg-transparent dark:bg-transparent dark:text-white ${
          variant === "header" ? "text-primary !bg-transparent" : ""
        }`}
      >
        <span className={"text-center w-full"}>
          {tabs[selectedTab]?.label || "Select option"}
        </span>
      </SelectTrigger>
      <SelectContent>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {tabs.map((tab, index) => (
            <div key={`tab-${index}-${tab.label}`}>
              <SelectItem
                value={String(index)}
                className={`py-3 text-${
                  variant === "header"
                    ? selectedTab === index
                      ? "primary"
                      : "secondary dark:text-white"
                    : "secondary dark:text-white"
                }
                      ${selectedTab === index ? "font-bold" : ""}`}
              >
                {tab?.label}
              </SelectItem>
              <SelectSeparator
                className={`border-b${
                  selectedTab === index ? "-2" : ""
                } border-${
                  variant === "header"
                    ? selectedTab === index
                      ? "primary"
                      : "secondary dark:border-white"
                    : "secondary dark:border-white"
                }`}
              />
            </div>
          ))}
        </motion.div>
      </SelectContent>
    </Select>
  )
}

export default MobileTabs
