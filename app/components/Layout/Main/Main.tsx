import { ReactNode } from "react"

const Main = ({
  children,
  hasMobileMenu,
  hasFooter,
}: {
  children: ReactNode
  hasMobileMenu?: boolean
  hasFooter?: boolean
}) => {
  const paddingBottom =
    hasMobileMenu && hasFooter
      ? "pb-[180px] sm:pb-[75px]"
      : hasMobileMenu && !hasFooter
        ? "pb-[75px] sm:pb-0"
        : hasFooter && !hasMobileMenu
          ? "pb-[75px]"
          : ""

  return (
    <div
      className={`mx-auto relative w-full px-5 pt-5 m-0 max-w-[1150px] text-black dark:text-white ${paddingBottom}`}
    >
      {children}
    </div>
  )
}
export default Main
