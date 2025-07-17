import { useHistorybar, useCloseSidebar } from "@/store/layout"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { motion } from "framer-motion"
import {
  faComment,
  faMagnifyingGlass,
  faChevronRight,
  faChevronLeft,
  faClose,
  faScrewdriverWrench,
  faEye,
  faBook,
} from "@fortawesome/free-solid-svg-icons"
import UserAccount from "./UserAccount/UserAccount"
import { Link, useLoaderData, useLocation } from "@remix-run/react"
import { Button } from "@/components/ui/Button/Button"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/HoverCard/hover-card"
import { clsx } from "clsx"
import { loader } from "@/routes/chatSi"
import { useEffect, useMemo, useRef } from "react"
import { useFiltersStore } from "@/store/filters"
import { FilterData } from "@/components/Shared/Filters/types"
import useLocalDBFilesStore from "@/store/localDB"
import { useSearchMethod } from "@/store/searchsi"

const Sidebar = () => {
  const close = useCloseSidebar((state) => state.close)
  const setClose = useCloseSidebar.getState().setClose
  const { isHistorybarOpen, setIsHistorybarOpen } = useHistorybar()
  const { resetAllDocs, preventDocsReset, setPreventDocsReset } =
    useLocalDBFilesStore()
  const { setLoadingSearchSI } = useSearchMethod()

  const {
    setFilters,
    setIsFiltersSelected,
    setUpdatedFilterData,
    initialFiltersData,
    preventFiltersReset,
    setPreventFiltersReset,
  } = useFiltersStore()

  const location = useLocation()
  const loaderData = useLoaderData<typeof loader>()
  const previousPath = useRef<string | null>(null)

  const menuItems = useMemo(
    () => [
      {
        name: "Chat SI",
        icon: faComment,
        id: 1,
        path: "/chatSi",
        show: loaderData?.envVar.SHOW_CHAT_SI,
      },
      {
        name: "Search",
        icon: faMagnifyingGlass,
        id: 2,
        path: "/searchSi/semanticSearch",
        show: loaderData?.envVar.SHOW_SEARCH_SI,
        submenu: [
          {
            name: "semantic search",
            id: 3,
            path: "/searchSi/semanticSearch",
            show: loaderData?.envVar.SHOW_SEARCH_SI_SEMANTIC_SEARCH,
          },
          {
            name: "metadata search",
            id: 4,
            path: "/searchSi/metadataSearch",
            show: loaderData?.envVar.SHOW_SEARCH_SI_METADATA_SEARCH,
          },
          {
            name: "hybrid search",
            id: 5,
            path: "/searchSi/hybridSearch",
            show: loaderData?.envVar.SHOW_SEARCH_SI_HYBRID_SEARCH,
          },
          {
            name: "search spaces",
            id: 15,
            path: "/searchSpaces",
            show: loaderData?.envVar.SHOW_SEARCH_SPACES,
          },
        ],
      },
      {
        name: "Transform",
        icon: faScrewdriverWrench,
        id: 6,
        path: "/documentTools/QA",
        show: loaderData?.envVar.SHOW_DOCUMENT_TOOLS,
        submenu: [
          {
            name: "Q&A",
            id: 7,
            path: "/documentTools/QA",
            show: loaderData?.envVar.SHOW_DOCUMENT_TOOLS_QA,
          },
          {
            name: "Summarization",
            id: 8,
            path: "/documentTools/summarization",
            show: loaderData?.envVar.SHOW_DOCUMENT_TOOLS_SUMMARIZATION,
          },
          {
            name: "Output parsers",
            id: 9,
            path: "/documentTools/outputParsers",
            show: loaderData?.envVar.SHOW_DOCUMENT_TOOLS_OUTPUT_PARSERS,
          },
          {
            name: "Aggregator",
            id: 10,
            path: "/documentTools/aggService",
            show: loaderData?.envVar.SHOW_DOCUMENT_TOOLS_AGG_SERVICE,
          },
          {
            name: "Admin panel",
            id: 11,
            path: "/documentTools/adminPanel",
            show: loaderData?.envVar.SHOW_DOCUMENT_TOOLS_ADMIN_PANEL,
          },
        ],
      },
      {
        name: "Research",
        icon: faBook,
        id: 11,
        path: "/litePaper",
        show: loaderData?.envVar.SHOW_OPEN_STORY,
        submenu: [
          {
            name: "LitePaper",
            id: 12,
            path: "/litePaper",
            show: loaderData?.envVar.SHOW_OPEN_STORY_GRAY_PAPER,
          },
          {
            name: "Agentcy",
            id: 13,
            path: "/agentcy",
            show: loaderData?.envVar.SHOW_OPEN_STORY_CREW_STORY,
          },
        ],
      },
      {
        name: "Discovery",
        icon: faEye,
        id: 14,
        path: "/discovery",
        show: loaderData?.envVar.SHOW_DISCOVERY,
      },
    ],
    [loaderData]
  )

  const matchedMenuItem = menuItems.find(
    (item) =>
      item.show &&
      (location.pathname.startsWith(item.path) ||
        (item.submenu &&
          item.submenu.some(
            (subItem) =>
              subItem.show && location.pathname.startsWith(subItem.path)
          )))
  )

  const getAllMenuPaths = (
    items: { path?: string; submenu?: { path?: string }[] }[]
  ): string[] => {
    const paths: string[] = []

    items.forEach((item) => {
      if (item.path && item.path !== "non-clickable") paths.push(item.path)
      if (item.submenu) {
        item.submenu.forEach((sub) => {
          if (sub.path && sub.path !== "non-clickable") paths.push(sub.path)
        })
      }
    })

    return paths
  }

  const allPaths = useMemo(() => getAllMenuPaths(menuItems), [menuItems])

  // Get the active path segment that matches any part of the location
  const matchedPath = useMemo(() => {
    return allPaths.find((path) => location.pathname.startsWith(path))
  }, [location.pathname, allPaths])

  useEffect(() => {
    if (matchedPath) {
      // Check if both previous and current paths include 'searchSi'
      const isSearchToSearchNavigation =
        previousPath.current?.includes("searchSi") &&
        matchedPath.includes("searchSi")

      if (!isSearchToSearchNavigation) {
        setLoadingSearchSI(false)
        if (!preventFiltersReset) {
          setFilters({} as FilterData)
          setIsFiltersSelected(false)
          setUpdatedFilterData(initialFiltersData)
        } else {
          setPreventFiltersReset(false)
        }
        if (!preventDocsReset) {
          resetAllDocs()
        } else {
          setPreventDocsReset(false)
        }
      }

      previousPath.current = matchedPath
    }
  }, [matchedPath])

  const handleSidebarClose = () => {
    if (isHistorybarOpen) {
      setIsHistorybarOpen(false)
    }
    setClose(false)
  }

  const asideStyles = close
    ? { width: "97px", paddingLeft: "1.25rem", paddingRight: "1.25rem" }
    : { width: "290px", paddingLeft: "2.25rem", paddingRight: "2.25rem" }

  return (
    <>
      <motion.aside
        initial={{ ...asideStyles }}
        animate={{ ...asideStyles }}
        className={`bg-fourth md:visible dark:bg-secondary-dark flex-col lg:inset-y-0 fixed 
        inset-0 px-9 py-5 transition-padding hidden md:flex z-30 ${
          close ? "hidden" : "visible sm:flex"
        }
        `}
      >
        <motion.button
          transition={{ ease: "easeOut", duration: 2 }}
          onClick={handleSidebarClose}
          className={`invisible sm:visible ${
            close ? "text-center px-4" : "text-right px-0"
          } text-white w-full block`}
        >
          <FontAwesomeIcon
            icon={close ? faChevronRight : faChevronLeft}
            className="py-1 transition-transform h-6 w-6"
          />
        </motion.button>

        <Link
          to={"/"}
          {...(location.pathname === "/" && { reloadDocument: true })}
        >
          <motion.img
            src={close ? "/logo-icon.svg" : "/opensi.svg"}
            alt="logo"
            className={`mx-auto ${close && "mt-10"}`}
            animate={{
              height: close ? "40px" : "120px",
              width: close ? "40px" : "120px",
            }}
            initial={{
              height: close ? "40px" : "120px",
              width: close ? "40px" : "120px",
            }}
          />
        </Link>
        <ul className="text-white flex gap-y-2 flex-col items-start justify-between text-xl font-light w-full overflow-scroll-y mt-12">
          {menuItems
            .filter((i) => i.show) // Only include menu items with show: true
            .map((i) => (
              <HoverCard
                openDelay={100}
                closeDelay={100}
                key={i.id + crypto.randomUUID()}
              >
                <HoverCardTrigger asChild>
                  <Link
                    to={i.path || "/"}
                    {...(i.path === "/chatSi" && { reloadDocument: true })}
                    className={clsx(
                      "data-[state=open]:bg-primary custom-height-mq:py-4 my-[1px] py-2 items-center flex w-full rounded-md capitalize overflow-hidden hover:bg-primary transition-all ease-in-out duration-300 cursor-pointer relative",
                      close ? "justify-center" : "justify-start",
                      i.id === (matchedMenuItem && matchedMenuItem.id)
                        ? "bg-primary"
                        : "bg-transparent"
                    )}
                  >
                    <motion.li
                      id={`menu-item-${i.id}`}
                      className="flex w-full items-center"
                    >
                      <div className="w-[63px] text-center">
                        <FontAwesomeIcon
                          icon={i.icon}
                          className="py-2 w-[63px]"
                          size="lg"
                        />
                      </div>
                      <div className="flex justify-between w-full">
                        <motion.span
                          animate={close ? { opacity: 0 } : { opacity: 1 }}
                          className={"whitespace-nowrap"}
                        >
                          {i.name}
                        </motion.span>
                        {i.submenu && (
                          <FontAwesomeIcon
                            icon={faChevronRight}
                            className="py-2 w-[65px]"
                            size="sm"
                          />
                        )}
                      </div>
                    </motion.li>
                  </Link>
                </HoverCardTrigger>
                {i.submenu && (
                  <HoverCardContent
                    side="right"
                    sideOffset={6}
                    align={"start"}
                    hideWhenDetached
                    asChild
                    className="flex flex-col border-secondary dark:border-primary-dark bg-fourth dark:bg-secondary-dark p-4 text-white"
                  >
                    <motion.ul className={"flex flex-col gap-2"}>
                      {i.submenu
                        .filter((subItem) => subItem.show) // Only include submenu items with show: true
                        .map((subItem) => (
                          <Link
                            key={subItem.id + crypto.randomUUID()}
                            to={subItem.path || "/"}
                            className={`flex w-full items-center ${
                              subItem.path === "non-clickable" &&
                              "pointer-events-none"
                            }`}
                          >
                            <motion.li
                              className={`text-xl rounded-sm capitalize font-light py-2 px-4 custom-height-mq:p-4 cursor-pointer w-full ${
                                location.pathname.startsWith(subItem.path)
                                  ? "bg-primary cursor-auto"
                                  : "hover:bg-primary"
                              }`}
                            >
                              <div className="flex justify-between w-full">
                                <motion.span className={"w-full text-center"}>
                                  {subItem.name}
                                </motion.span>
                              </div>
                            </motion.li>
                          </Link>
                        ))}
                    </motion.ul>
                  </HoverCardContent>
                )}
              </HoverCard>
            ))}
        </ul>
        <UserAccount />
      </motion.aside>
      <div
        role="button"
        tabIndex={0}
        className={`${
          close ? "hidden" : "bg-opacity-65"
        } transition-all duration-300 md:hidden fixed bg-secondary dark:bg-primary-dark dark:bg-opacity-65 w-full h-full z-20`}
        onKeyUp={handleSidebarClose}
        onClick={handleSidebarClose}
      >
        <Button
          className={`transition-opacity duration-300 text-2xl text-white absolute top-3 right-3 hover:text-primary`}
          variant={"ghostIcon"}
          icon={faClose}
        ></Button>
      </div>
    </>
  )
}

export default Sidebar
