import Header from "@/components/Layout/Header/Header"
import Sidebar from "@/components/Layout/Sidebar/Sidebar"
import { useCloseSidebar } from "@/store/layout"
import { Outlet } from "@remix-run/react"
import MobileMenu from "@/components/Layout/MobileMenu/MobileMenu"
import { clsx } from "clsx"
import { requiredUserSession } from "@/data/auth/session.server"
import { getMenuVariables } from "@/data/menuvariables/menuvariables.server"
import { json, LoaderFunctionArgs } from "@remix-run/node"
import { ErrorBoundaryComponent } from "@/components/ui/ErrorBoundaryComponent/ErrorBoundaryComponent"
import React from "react"

export default function SearchSpaces() {
  const close = useCloseSidebar((state) => state.close)

  return (
    <>
      <Sidebar />
      <MobileMenu />
      <div
        className={clsx(
          "transition-all duration-300 w-full p-0 !m-0 h-[90vh]",
          close ? "md:pl-sidebarClosed" : "md:pl-sidebarOpen"
        )}
      >
        <Header />
        <Outlet />
      </div>
    </>
  )
}

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
