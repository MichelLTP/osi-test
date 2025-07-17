import { redirect } from "@remix-run/node"
import { useState, useEffect } from "react"
import { Dialog, DialogTitle } from "@radix-ui/react-dialog"
import { DialogContent } from "@/components/ui/Dialog/Dialog"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/Button/Button"

const Homepage = () => {
  const [isOpen, setIsOpen] = useState(false)

  // Use useEffect to control the dialog opening with a slight delay after component mount
  useEffect(() => {
    const hasDismissed = sessionStorage.getItem("showWelcomeDialog") === "false"

    const timer = setTimeout(() => {
      setIsOpen(!hasDismissed)
    }, 1200)

    return () => clearTimeout(timer)
  }, [])

  const handleDialogClose = () => {
    sessionStorage.setItem("showWelcomeDialog", "false")
    setIsOpen(false)
  }

  return (
    <div>
      <AnimatePresence>
        {isOpen && (
          <Dialog open={isOpen}>
            <DialogContent asChild>
              <motion.div
                key="dialog"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="border-primary shadow-lg rounded-lg w-[95vw] md:w-full p-8 md:ml-[50px] bg-white dark:bg-background"
              >
                <DialogTitle className="flex items-center gap-2 text-secondary font-bold text-xl dark:text-white">
                  <img src={"/logo-icon.svg"} alt="logo" className="w-[16px]" />
                  <span>Before You Dive In</span>
                </DialogTitle>

                <div className="flex flex-col items-center justify-center">
                  Welcome to Open SI, your gateway to a suite of tools designed
                  to support your work and exploration. As you navigate the
                  platform and interact with its features, keep in mind that the
                  responses and outputs provided need to follow JTI policies on
                  data & information disclosure, and might not always be
                  accurate, complete, or fully appropriate for your context. Use
                  your judgment and verify the answers, which are not legally
                  binding. Please also note that your conversations and shared
                  information may be stored in anonymized form to help improve
                  Open SI and enhance the overall user experience.
                </div>
                <Button onClick={handleDialogClose}>Understood</Button>
              </motion.div>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>
    </div>
  )
}

export default Homepage

export async function loader() {
  return redirect("/test")
}
