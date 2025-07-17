import BreadCrumb from "@/components/ui/BreadCrumb/BreadCrumb"
import { Button } from "@/components/ui/Button/Button"
import { LoaderData } from "@/root"
import { Theme, useTheme } from "@/utils/darkTheme/theme-provider"
import { faBars, faBell } from "@fortawesome/free-solid-svg-icons"
import { Link, useLocation, useRouteLoaderData } from "@remix-run/react"
import { useCloseSidebar } from "@/store/layout"
import { Moon, Sun } from "lucide-react"
import VersionIcon from "@/components/Shared/VersionIcon/VersionIcon"

{
  /* FIXME: Solução temporária para o Header do Discover Story não ter um uuid como titulo */
}
const Header = ({ discoveryStoryTitle }: { discoveryStoryTitle?: string }) => {
  const rootLoaderData = useRouteLoaderData<LoaderData>("root")
  const [theme, setTheme] = useTheme()
  const location = useLocation()

  const toggleTheme = () => {
    setTheme((prevTheme) =>
      prevTheme === Theme.LIGHT ? Theme.DARK : Theme.LIGHT
    )
  }

  const close = useCloseSidebar((state) => state.close)
  const setClose = useCloseSidebar.getState().setClose

  return (
    <>
      <div className="bg-white dark:bg-primary-dark border-opacity-10 p-4 flex border-b border-secondary dark:border-third-dark justify-between items-center">
        <div className="flex gap-2 items-center">
          <Button
            className={
              close ? "hidden sm:flex md:hidden -ml-3 text-xl" : "hidden"
            }
            variant="ghostIcon"
            icon={faBars}
            onClick={() => setClose(!close)}
          />
          <BreadCrumb discoveryStoryTitle={discoveryStoryTitle} />
        </div>
        <div className="flex items-center gap-x-6 ml-2">
          {location.pathname !== "/" && (
            <VersionIcon
              version={"Beta"}
              variant={"secondary"}
              className="py-1 text-xs"
            />
          )}
          <Link
            to="https://jti.service-now.com/sp?id=index"
            className="text-primary hover:underline transition-all"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button
              className="text-secondary dark:text-white text-2xl hover:text-primary dark:hover:text-primary"
              variant="ghostIcon"
              icon={faBell}
            />
          </Link>
          {rootLoaderData?.theme == "light" || theme === "light" ? (
            <Button onClick={toggleTheme} variant={"lucideIcon"} size={"theme"}>
              <Moon size={18} />
            </Button>
          ) : (
            <Button onClick={toggleTheme} variant={"lucideIcon"} size={"theme"}>
              <Sun size={18} />
            </Button>
          )}
        </div>
      </div>
      {/* Leaving them here reduces the delay in showing the icons */}
      <div className={"w-0 h-0 invisible opacity-0 absolute"}>
        <Moon />
        <Sun />
      </div>
    </>
  )
}

export default Header
