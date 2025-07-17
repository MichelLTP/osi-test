import { ReactNode, useEffect, useRef, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { FramerTabsProps } from "./types"

const Tabs = ({
  tabs,
  selectedTabIndex,
  setSelectedTab,
}: FramerTabsProps): JSX.Element => {
  const [buttonRefs, setButtonRefs] = useState<Array<HTMLButtonElement | null>>(
    []
  )

  useEffect(() => {
    setButtonRefs((prev) => prev.slice(0, tabs.length))
  }, [tabs.length])

  const navRef = useRef<HTMLDivElement>(null)
  const navRect = navRef.current?.getBoundingClientRect()

  const [hoveredTabIndex, setHoveredTabIndex] = useState<number | null>(null)

  return (
    <nav
      ref={navRef}
      className="flex justify-center items-center relative z-0 py-2"
      onMouseLeave={() => setHoveredTabIndex(null)}
    >
      {tabs.map((item, i) => (
        <motion.button
          key={i}
          className={`text-md rounded-md flex items-center h-8 px-4 bg-transparent font-bold ${
            (hoveredTabIndex === i || selectedTabIndex === i) && "text-primary"
          }`}
          ref={(el) => (buttonRefs[i] = el)}
          onMouseEnter={() => setHoveredTabIndex(i)}
          onClick={() => {
            setSelectedTab([i, i > selectedTabIndex ? 1 : -1])
          }}
        >
          {item.label}
        </motion.button>
      ))}
      <AnimatePresence>
        {hoveredTabIndex !== null && navRect && (
          <motion.div
            key={"hover"}
            className="absolute z-10 top-0 left-0 rounded-md"
            initial={{ ...getRect(buttonRefs[hoveredTabIndex]), opacity: 0 }}
            animate={{ ...getRect(buttonRefs[hoveredTabIndex]), opacity: 1 }}
            exit={{ ...getRect(buttonRefs[hoveredTabIndex]), opacity: 0 }}
            transition={{ type: "tween", ease: "easeOut", duration: 0.15 }}
          />
        )}
      </AnimatePresence>
    </nav>
  )
}

const Content = ({
  children,
  selectedTabIndex,
  direction,
}: {
  direction: number
  selectedTabIndex: number
  children: ReactNode
}): JSX.Element => {
  return (
    <AnimatePresence custom={direction}>
      <motion.div
        key={selectedTabIndex}
        variants={{
          enter: { opacity: 0, x: 0 },
          center: { opacity: 1, x: 0 },
        }}
        initial="enter"
        animate="center"
        exit="exit"
        custom={direction}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}

const getRect = (element: HTMLButtonElement | null) => {
  if (element) {
    const rect = element.getBoundingClientRect()
    return {
      x: rect.left,
      y: rect.top,
      width: rect.width,
      height: rect.height,
    }
  }
  return { x: 0, y: 0, width: 0, height: 0 }
}

export const Framer = { Tabs, Content }
