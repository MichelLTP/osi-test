import Header from "@/components/Layout/Header/Header"
import Main from "@/components/Layout/Main/Main"
import MobileMenu from "@/components/Layout/MobileMenu/MobileMenu"
import Sidebar from "@/components/Layout/Sidebar/Sidebar"
import Submenu from "@/components/Layout/Submenu/Submenu"
import { requiredUserSession } from "@/data/auth/session.server"
import { getMenuVariables } from "@/data/menuvariables/menuvariables.server"
import { useCloseSidebar } from "@/store/layout"
import {
  faChartSimple,
  faPercent,
  faUsersViewfinder,
  faGlobe,
} from "@fortawesome/free-solid-svg-icons"
import { Outlet, useLocation } from "@remix-run/react"
import { clsx } from "clsx"
import type { LoaderFunctionArgs } from "@remix-run/node"
import { ErrorBoundaryComponent } from "@/components/ui/ErrorBoundaryComponent/ErrorBoundaryComponent"

const StandardReports = () => {
  const close = useCloseSidebar((state) => state.close)
  const location = useLocation()

  const basePaths = ["/standardReports", "/standardReports/"]
  const isBasePath = basePaths.includes(location.pathname)

  const submenu = [
    {
      title: "RADRS",
      description: "Retail. Market Size. Performance.",
      icon: faChartSimple,
      path: "./radrs",
      id: 1,
    },
    {
      title: "incidence",
      description: "Survey consumers. Usage.",
      icon: faPercent,
      path: "./incidence",
      id: 2,
    },
    {
      title: "tracker",
      description: "Survey consumers. Brands.",
      icon: faUsersViewfinder,
      path: "./tracker",
      id: 3,
    },
    {
      title: "OMM",
      description: "Future. Forecast. 2035.",
      icon: faGlobe,
      path: "./omm",
      id: 4,
    },
  ]

  return (
    <>
      <Sidebar />
      <MobileMenu />
      <div
        className={clsx(
          "transition-[padding] duration-300 w-full p-0 m-0",
          close ? "md:pl-sidebarClosed" : "md:pl-sidebarOpen"
        )}
      >
        <Header />
        {/* <div className="flex w-full h-[calc(100vh-56px)]"> */}
        <Main hasMobileMenu>
          <div className="min-h-[100vh] w-full flex flex-col items-center justify-center transition-all duration-300">
            {/* <div className={`w-full ${!isBasePath && "h-full"}`}> */}
            {isBasePath ? (
              <>
                <img
                  src="/logo.svg"
                  alt="logo"
                  className="max-w-[300px] mx-auto px-2 mb-10"
                />
                <Submenu items={submenu} />
              </>
            ) : (
              <Outlet />
            )}
          </div>
          {/* </div> */}
        </Main>
        {/* </div> */}
      </div>
    </>
  )
}

export async function loader({ request }: LoaderFunctionArgs) {
  // This line is for protecting the current route
  await requiredUserSession(request)
  const envVar = await getMenuVariables()
  return { envVar }
}

export default StandardReports

export function ErrorBoundary() {
  return <ErrorBoundaryComponent isMainRoute={true} />
}
