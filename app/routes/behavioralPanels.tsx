import Sidebar from "@/components/Layout/Sidebar/Sidebar"
import { motion } from "framer-motion"
import Header from "@/components/Layout/Header/Header"
import Main from "@/components/Layout/Main/Main"
import { useCloseSidebar } from "@/store/layout"
import useIsMobile from "@/hooks/useIsMobile"
import MobileMenu from "@/components/Layout/MobileMenu/MobileMenu"
import { LoaderFunctionArgs } from "@remix-run/node"
import { requiredUserSession } from "@/data/auth/session.server"
import { ErrorBoundaryComponent } from "@/components/ui/ErrorBoundaryComponent/ErrorBoundaryComponent"
import { getMenuVariables } from "@/data/menuvariables/menuvariables.server"

const BehavioralPanels = () => {
  const close = useCloseSidebar((state) => state.close)
  const isMobile = useIsMobile()

  return (
    <>
      <Sidebar />
      <MobileMenu />
      <motion.div
        initial={{
          paddingLeft: isMobile ? "0px" : close ? "97px" : "290px",
        }}
        animate={{
          paddingLeft: isMobile ? "0px" : close ? "97px" : "290px",
        }}
        className="w-full p-0 !m-0 flex flex-col"
      >
        <Header />
        <div className="flex w-full h-[calc(100vh-56px)]">
          <Main hasMobileMenu>
            <iframe
              src="https://pt.m.wikipedia.org/wiki/Japan_Tobacco_International"
              title="wiki"
              className="w-full h-full hidden md:flex border-none"
            ></iframe>
            <iframe
              src="https://pt.m.wikipedia.org/wiki/Japan_Tobacco_International"
              title="wiki"
              className="w-full h-full flex md:hidden focus-visible:outline-none"
            ></iframe>
          </Main>
        </div>
      </motion.div>
    </>
  )
}

export async function loader({ request }: LoaderFunctionArgs) {
  // This line is for protecting the current route
  await requiredUserSession(request)
  const envVar = await getMenuVariables()
  return { envVar }
}

export default BehavioralPanels

export function ErrorBoundary() {
  return <ErrorBoundaryComponent isMainRoute={true} />
}
