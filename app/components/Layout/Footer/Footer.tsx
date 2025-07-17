import { useCloseSidebar } from "@/store/layout"
import { ReactNode } from "react"
import { useLocation } from "@remix-run/react"
import { clsx } from "clsx"
import useIsIphone from "@/hooks/useIsIphone"

const Footer = ({
  hasBackground = true,
  children,
}: {
  hasBackground?: boolean
  children: ReactNode
}) => {
  const close = useCloseSidebar((state) => state.close)
  const location = useLocation()
  const isIphone = useIsIphone()

  const pathIncludes = ["chatSi", "searchSi", "standardReports"].some(
    (keyword) => location.pathname.includes(keyword)
  )

  return (
    <div
      className={clsx(
        "transition-[transform,padding,margin] duration-300 fixed sm:bottom-0 right-0 left-0 px-5",
        hasBackground ? "bg-white dark:bg-primary-dark" : "bg-transparent",
        pathIncludes ? "bottom-[75px]" : "bottom-0",
        isIphone ? "bottom-[78px]" : "bottom-[75px]",
        close
          ? "md:ml-5 md:mr-0 md:pl-sidebarClosed"
          : "md:ml-5 md:mr-0 md:pl-sidebarOpen",
        !location.pathname.includes("metadataSearch") && "min-h-[72px]"
      )}
    >
      {children}
    </div>
  )
}

export default Footer
