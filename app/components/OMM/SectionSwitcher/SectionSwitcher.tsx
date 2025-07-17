import React, { useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { TabsProps } from "@/components/OMM/SectionSwitcher/types"
import MobileTabs from "@/components/ui/Tabs/MobileTabs"

const SectionSwitcher = ({ tabs }: TabsProps): React.ReactNode => {
  const [selectedIndex, setSelectedIndex] = useState(0)

  const handleTabChange = (index: number) => {
    setSelectedIndex(index)
  }

  return (
    <section className="w-full flex flex-col">
      <header className="w-full flex items-center justify-between border-b pt-8 mb-8 border-secondary dark:border-white">
        <div className={"flex md:hidden w-full"}>
          <MobileTabs
            initialTabIndex={0}
            variant={"search results"}
            tabs={tabs}
            onTabChange={handleTabChange}
          />
        </div>
        <div className="w-full gap-y-5 hidden md:flex">
          {tabs.map((tab, index) => (
            <button
              key={index}
              className={`text-secondary dark:text-white text-md flex items-center px-8 pb-2 font-bold border-b-2 ${
                selectedIndex === index
                  ? "border-secondary dark:border-white border-b-2"
                  : "border-transparent"
              }`}
              onClick={() => handleTabChange(index)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </header>
      <AnimatePresence>
        {tabs.map((tab, index) => (
          <motion.main
            key={index + tab.id}
            animate={selectedIndex === index ? "open" : "closed"}
            variants={{
              open: {
                opacity: 1,
                transitionEnd: {
                  display: "block",
                },
              },
              closed: {
                opacity: 0,
                transitionEnd: {
                  display: "none",
                },
              },
            }}
          >
            {tab.children}
          </motion.main>
        ))}
      </AnimatePresence>
    </section>
  )
}

export default SectionSwitcher
