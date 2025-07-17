import { motion, AnimatePresence } from "framer-motion"
import PlotlyWrapper from "@/components/ui/PlotlyWrapper/PlotlyWrapper"
import { useMemo } from "react"
import { Theme } from "@/utils/darkTheme/theme-provider"

const PlotlyThemeWrapper = ({
  index,
  lightContent,
  darkContent,
  theme,
}: {
  index: number
  lightContent: string
  darkContent: string
  theme: Theme
}) => {
  const plotlyContent = useMemo(() => {
    return theme === "dark" ? JSON.parse(darkContent) : JSON.parse(lightContent)
  }, [theme, lightContent, darkContent])

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={theme}
        initial={{ opacity: 0 }}
        exit={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
        className="overflow-x-auto"
      >
        <PlotlyWrapper index={index} content={plotlyContent} />
      </motion.div>
    </AnimatePresence>
  )
}

export default PlotlyThemeWrapper
