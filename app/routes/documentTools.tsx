import Header from "@/components/Layout/Header/Header"
import Main from "@/components/Layout/Main/Main"
import MobileMenu from "@/components/Layout/MobileMenu/MobileMenu"
import Sidebar from "@/components/Layout/Sidebar/Sidebar"
import { getMenuVariables } from "@/data/menuvariables/menuvariables.server"
import { useCloseSidebar } from "@/store/layout"
import { Outlet, useFetcher, useLocation } from "@remix-run/react"
import { clsx } from "clsx"
import { ErrorBoundaryComponent } from "@/components/ui/ErrorBoundaryComponent/ErrorBoundaryComponent"
import { OutletContext } from "@/components/DocTools/DocToolsResponse/type"
import { doesPathInclude } from "@/utils/sharedFunctions"

const DocumentTools = () => {
  const fetcher = useFetcher<OutletContext>()
  const history =
    fetcher.data && fetcher.data?.history && fetcher.data?.history.length > 0
      ? fetcher.data?.history
      : null

  const location = useLocation()
  const close = useCloseSidebar((state) => state.close)

  return (
    <>
      <Sidebar />
      <MobileMenu />
      <div
        className={clsx(
          "transition-[padding] duration-300 w-full p-0 !m-0 flex flex-col",
          close ? "md:pl-sidebarClosed" : "md:pl-sidebarOpen"
        )}
      >
        <Header />
        <Main
          hasMobileMenu
          hasFooter={doesPathInclude(
            ["QA", "summarization"],
            location.pathname
          )}
        >
          <Outlet context={{ history }} />
        </Main>
      </div>
    </>
  )
}

export default DocumentTools

export async function loader() {
  const envVar = await getMenuVariables()
  return { envVar }
}

export function ErrorBoundary() {
  return <ErrorBoundaryComponent isMainRoute={true} />
}
