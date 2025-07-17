import React from "react"
import MobileMenu from "@/components/Layout/MobileMenu/MobileMenu"
import Sidebar from "@/components/Layout/Sidebar/Sidebar"
import { clsx } from "clsx"
import Header from "@/components/Layout/Header/Header"
import Main from "@/components/Layout/Main/Main"
import { Toaster } from "@/components/ui/Toast/Toaster"
import { Outlet } from "@remix-run/react"
import { useCloseSidebar } from "@/store/layout"
import { json, LoaderFunctionArgs } from "@remix-run/node"
import { requiredUserSession } from "@/data/auth/session.server"
import { getMenuVariables } from "@/data/menuvariables/menuvariables.server"
import { ErrorBoundaryComponent } from "@/components/ui/ErrorBoundaryComponent/ErrorBoundaryComponent"

const Agentcy = () => {
  const close = useCloseSidebar((state) => state.close)
  return (
    <>
      <MobileMenu />
      <Sidebar />
      <div
        className={clsx(
          "transition-[padding] duration-300 w-full p-0 m-0 h-full",
          close ? "md:pl-sidebarClosed" : "md:pl-sidebarOpen"
        )}
      >
        <Header />
        <Main hasMobileMenu>
          <Toaster />
          <div className="min-h-[calc(100vh-200px)] w-full flex flex-col gap-6 items-center justify-center transition-[width,transform] duration-300">
            <Outlet />
          </div>
        </Main>
      </div>
    </>
  )
}
export default Agentcy

export async function loader({ request }: LoaderFunctionArgs) {
  const token = await requiredUserSession(request)
  const envVar = await getMenuVariables()

  return json({
    envVar,
  })
}

export function ErrorBoundary() {
  return <ErrorBoundaryComponent isMainRoute />
}
