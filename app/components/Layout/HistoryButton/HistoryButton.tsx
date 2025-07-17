import { faClockRotateLeft } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { motion } from "framer-motion"
import { cn } from "@/utils/shadcn/utils"
import Tooltip from "@/components/ui/Tooltip/Tooltip"
import { clsx } from "clsx"

export default function HistoryButton({
  handleHistoryClick,
  className,
}: {
  handleHistoryClick: () => void
  className?: string
}) {
  return (
    <div className={clsx("absolute right-0 bottom-8", className)}>
      <Tooltip sideOffset={15} text="Chat History">
        <motion.button
          onClick={handleHistoryClick}
          className={cn(
            "hover:opacity-80 items-center justify-center rounded-full border border-primary w-[36px] h-[36px] bg-primary lg:bg-white lg:dark:bg-primary-dark transition-[display] duration-300"
          )}
          whileHover={{ rotate: 360 }}
          transition={{ duration: 0.5 }}
        >
          <FontAwesomeIcon
            icon={faClockRotateLeft}
            className="text-white dark:text-secondary-dark lg:text-primary lg:dark:text-primary"
            size="xs"
          />
        </motion.button>
      </Tooltip>
    </div>
  )
}
