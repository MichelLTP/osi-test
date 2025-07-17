import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/Select/Select"
import useIsMobile from "@/hooks/useIsMobile"
import { useNavigate, useSearchParams } from "@remix-run/react"
import { useState } from "react"
import { TabsComponentProps } from "./types"

export default function TabsComponent({
  TabsProps,
  pixelsToResize,
}: TabsComponentProps) {
  const isMobileSize = useIsMobile(pixelsToResize)
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const [tabSelected, setTabSelected] = useState(() => {
    const tabParam = searchParams.get("tab")
    const index = TabsProps.tabs.findIndex(
      (tab) => tabParam && tab.id.includes(tabParam)
    )
    return index > -1 ? index : 0
  })

  const handleTabChange = (index: number) => {
    setTabSelected(index)
    navigate(`${TabsProps.tabs[index].id}`)
  }

  const [xxx, setXxx] = useState(TabsProps.tabs[tabSelected].label)

  const handleMobileTabChange = (value: string) => {
    setXxx(value)
    const selectedTab = TabsProps.tabs.find((tab, index) => {
      setTabSelected(index)
      return tab.label === value
    })
    if (selectedTab) {
      navigate(`${selectedTab.id}`)
    }
  }
  return (
    <div>
      <div className="flex w-full">
        {isMobileSize ? (
          <Select defaultValue={xxx} onValueChange={handleMobileTabChange}>
            <SelectTrigger>{xxx}</SelectTrigger>
            <SelectContent>
              {TabsProps.tabs.map((tab, index) => (
                <SelectItem
                  className={`!justify-start ${
                    index === tabSelected
                      ? TabsProps.classes.selected
                      : TabsProps.classes.notSelected
                  }`}
                  value={tab.label}
                  key={index}
                >
                  {tab.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <>
            {TabsProps.tabs.map((tab, index) => (
              <button
                key={index}
                className={`grow
                            ${
                              index === tabSelected
                                ? TabsProps.classes.selected
                                : TabsProps.classes.notSelected
                            }`}
                onClick={() => handleTabChange(index)}
              >
                {tab.label}
              </button>
            ))}
          </>
        )}
      </div>
      <div className="w-full pt-8">{TabsProps.tabs[tabSelected].content}</div>
    </div>
  )
}
