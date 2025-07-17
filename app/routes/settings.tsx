import Header from "@/components/Layout/Header/Header"
import Main from "@/components/Layout/Main/Main"
import MobileMenu from "@/components/Layout/MobileMenu/MobileMenu"
import Sidebar from "@/components/Layout/Sidebar/Sidebar"
import UseCaseTitle from "@/components/Shared/UseCaseTitle/UseCaseTitle"
import { ErrorBoundaryComponent } from "@/components/ui/ErrorBoundaryComponent/ErrorBoundaryComponent"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/NewTabs/tabs"
import { getMenuVariables } from "@/data/menuvariables/menuvariables.server"
import { useCloseSidebar } from "@/store/layout"
import { json } from "@remix-run/node"
import { Link, Outlet, useLocation } from "@remix-run/react"
import clsx from "clsx"

export default function SettingsLayout() {
  const close = useCloseSidebar((state) => state.close)
  const location = useLocation()

  const tabs = [
    { label: "General", id: "general", to: "general" },
    { label: "Data", id: "data", to: "data" },
    { label: "Units", id: "units", to: "units" },
  ]

  const activeTab = location.pathname.split("/").pop() || "general"

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
        <Main hasMobileMenu hasFooter>
          <UseCaseTitle title="Settings" />
          <Tabs
            value={activeTab}
            orientation="vertical"
            className="w-full flex gap-[50px] mt-20"
          >
            <TabsList
              currentValue={activeTab}
              orientation="vertical"
              className="min-w-[150px]"
            >
              {tabs.map((tab) => (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  orientation="vertical"
                  className="text-secondary"
                  asChild
                >
                  <Link to={tab.to}>{tab.label}</Link>
                </TabsTrigger>
              ))}
            </TabsList>

            <div className="w-full grow text-secondary">
              <Outlet />
            </div>
          </Tabs>
        </Main>
      </div>
    </>
  )
}

export async function loader() {
  const envVar = await getMenuVariables()
  return json({ envVar })
}

export function ErrorBoundary() {
  return <ErrorBoundaryComponent isMainRoute />
}
