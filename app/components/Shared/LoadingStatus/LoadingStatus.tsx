import { AnimatePresence, motion } from "framer-motion"
import { Loader2 } from "lucide-react"
import { clsx } from "clsx"
import { LoadingStatusProps } from "@/components/Shared/LoadingStatus/types"

const LoadingStatus = ({ statusMessage }: LoadingStatusProps) => {
  return (
    <AnimatePresence mode="wait">
      {statusMessage?.body && (
        <motion.div
          className="py-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          key={statusMessage?.body}
        >
          <div className="flex items-center space-x-2">
            <Loader2
              className={clsx(
                "animate-spin text-primary",
                statusMessage?.body === "Generating a response..." ||
                  (statusMessage?.body === "Generating code..." &&
                    "text-success")
              )}
            />
            <motion.span className="text-sm text-secondary dark:text-third">
              {statusMessage?.body}
            </motion.span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
export default LoadingStatus
