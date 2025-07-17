import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  faMagnifyingGlass,
  faNewspaper,
} from "@fortawesome/free-solid-svg-icons"
import { faComment, faEye } from "@fortawesome/free-regular-svg-icons"
import { Link, useLocation } from "@remix-run/react"
import UserAccount from "../Sidebar/UserAccount/UserAccount"
import { IconDefinition } from "@fortawesome/fontawesome-svg-core"
import useIsIphone from "@/hooks/useIsIphone"

const menuItems = [
  {
    name: "Chat",
    icon: faComment,
    id: 1,
    path: "/chatSi",
  },
  {
    name: "Search",
    icon: faMagnifyingGlass,
    id: 2,
    path: "/searchSi/semanticSearch",
  },
  {
    name: "Spaces",
    icon: faNewspaper,
    id: 3,
    path: "/searchSpaces",
  },
  {
    name: "Discover",
    icon: faEye,
    id: 4,
    path: "/discovery",
  },
]

type MenuItem = {
  name: string
  icon: IconDefinition
  id: number
  path: string
}

const MobileMenu = () => {
  const location = useLocation()
  const isIphone = useIsIphone()

  return (
    <nav
      className={`bg-fourth w-full dark:bg-secondary-dark flex sm:hidden fixed bottom-0 z-30`}
    >
      <ul
        className={`text-third flex items-center justify-around w-full translate-y-[2px] ${
          isIphone ? "pt-[22px] pb-[30.24px]" : "pt-[22px] pb-[26.73px]"
        }`}
      >
        {menuItems.map((item) => (
          <li
            key={item.id}
            className={`flex items-center capitalize overflow-hidden transition-all ease-in-out duration-300 cursor-pointer hover:text-primary ${
              location.pathname.includes(item.path) && "text-primary"
            }`}
          >
            <Link
              to={item.path || "/"}
              {...(item.path === "/chatSi" && { reloadDocument: true })}
              className="flex w-full flex-col items-center justify-center gap-1"
            >
              <FontAwesomeIcon
                icon={item.icon}
                className="!text-2xl w-[65px]"
                size="lg"
              />
            </Link>
          </li>
        ))}
        <li
          className={`capitalize overflow-hidden transition-all ease-in-out duration-300 cursor-pointer`}
        >
          <UserAccount />
        </li>
      </ul>
    </nav>
  )
}

export default MobileMenu
