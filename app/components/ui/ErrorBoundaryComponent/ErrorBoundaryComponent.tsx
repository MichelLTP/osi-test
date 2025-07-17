import Header from "@/components/Layout/Header/Header"
import MobileMenu from "@/components/Layout/MobileMenu/MobileMenu"
import Sidebar from "@/components/Layout/Sidebar/Sidebar"
import { useCloseSidebar } from "@/store/layout"
import { isRouteErrorResponse, useRouteError } from "@remix-run/react"
import clsx from "clsx"

export function ErrorBoundaryComponent({
  isMainRoute,
}: {
  isMainRoute: boolean
}) {
  const error = useRouteError() as {
    message?: string
    stack?: string
    statusText?: string
  }
  const close = useCloseSidebar((state) => state.close)
  let errorMessage

  if (isRouteErrorResponse(error)) {
    errorMessage = (
      <>
        <p className="text-lg md:text-xl text-error">
          Error Status: {error.status}
        </p>
        <p className="text-lg md:text-xl text-error">
          {error.statusText || "Error"}
        </p>
      </>
    )
  } else if (error instanceof Error) {
    errorMessage = (
      <p className="text-lg md:text-xl text-error">Error: {error.message}</p>
    )
  } else {
    errorMessage = (
      <p className="text-lg md:text-xl text-error">Unknown Error</p>
    )
  }

  return (
    <>
      {isMainRoute ? (
        <div>
          <MobileMenu />
          <Sidebar />
          <div
            className={clsx(
              "transition-[padding] duration-300 w-full p-0 m-0 h-full",
              close ? "md:pl-sidebarClosed" : "md:pl-sidebarOpen"
            )}
          >
            <Header />
            <div className="h-[calc(100vh-62px)]">
              <div className="flex flex-col items-center bg-red-200 py-10 h-full">
                <p className="text-2xlbold md:text-3xlbold text-error">
                  Oops! Something went wrong
                </p>
                {errorMessage}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-sm overflow-hidden h-full">
          <div className="flex flex-col items-center bg-red-200 py-10 h-full">
            <p className="text-2xlbold md:text-3xlbold text-error">
              Oops! Something went wrong
            </p>
            <p>{errorMessage}</p>
          </div>
        </div>
      )}
    </>
  )
}
