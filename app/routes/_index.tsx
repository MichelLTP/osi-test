import FeatureCardsGrid from "@/components/Homepage/FeatureCardsGrid/FeatureCardsGrid"
import Header from "@/components/Layout/Header/Header"
import Main from "@/components/Layout/Main/Main"
import MobileMenu from "@/components/Layout/MobileMenu/MobileMenu"
import Sidebar from "@/components/Layout/Sidebar/Sidebar"
import { ErrorBoundaryComponent } from "@/components/ui/ErrorBoundaryComponent/ErrorBoundaryComponent"
import { requiredUserSession } from "@/data/auth/session.server"
import { getMenuVariables } from "@/data/menuvariables/menuvariables.server"
import { useCloseSidebar } from "@/store/layout"
import { LoaderFunctionArgs, redirect } from "@remix-run/node"
import clsx from "clsx"
import { useState, useEffect } from "react"
import { Dialog, DialogTitle } from "@radix-ui/react-dialog"
import { DialogContent } from "@/components/ui/Dialog/Dialog"
import { json } from "@remix-run/node"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/Button/Button"
import { useLoaderData } from "@remix-run/react"

const Homepage = () => {
  const close = useCloseSidebar((state) => state.close)
  const { envVar } = useLoaderData<typeof loader>()
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

      <Sidebar />
      <MobileMenu />
      <div
        className={clsx(
          "transition-[padding] duration-300 w-full p-0 m-0 h-full",
          close ? "md:pl-sidebarClosed" : "md:pl-sidebarOpen"
        )}
      >
        <Header />
        <Main hasMobileMenu>
          <div className="min-h-[calc(100vh-138px)] sm:min-h-[calc(100vh-62px)] w-full flex flex-col items-center justify-center transition-[width,transform] duration-300 -mt-5">
            <FeatureCardsGrid disabledVars={envVar} />
          </div>
        </Main>
      </div>
    </div>
  )
}

export default Homepage

export async function loader({ request }: LoaderFunctionArgs) {
  await requiredUserSession(request)
  const envVar = await getMenuVariables()

  const userAgent = request.headers.get("user-agent") || ""
  const isMobile =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      userAgent
    )

  if (isMobile) return redirect("/chatSi")
  return json({ envVar })
}

export function ErrorBoundary() {
  return <ErrorBoundaryComponent isMainRoute={false} />
}
