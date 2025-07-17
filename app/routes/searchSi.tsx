import Header from "@/components/Layout/Header/Header"
import Main from "@/components/Layout/Main/Main"
import Sidebar from "@/components/Layout/Sidebar/Sidebar"
import Historybar from "@/components/Layout/Historybar/Historybar"
import { useHistorybar, useCloseSidebar, useLoadingState } from "@/store/layout"
import {
  Outlet,
  useFetcher,
  useLocation,
  useNavigate,
  useSearchParams,
} from "@remix-run/react"
import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  json,
  redirect,
} from "@remix-run/node"
import {
  DeleteSearchSiHistory,
  deleteSearchSiSingleHistory,
  fetchSearchSiHistory,
} from "@/data/searchsi/searchSi.server"

import { Bubble } from "@/components/Layout/Historybar/HistoryBubble/type"
import MobileMenu from "@/components/Layout/MobileMenu/MobileMenu"
import { useEffect, useRef, useState } from "react"
import Footer from "@/components/Layout/Footer/Footer"
import ChatbarArea from "@/components/Layout/ChatbarArea/ChatbarArea"
import HistoryButton from "@/components/Layout/HistoryButton/HistoryButton"
import { useSearchMethod, useSearchResult } from "@/store/searchsi"
import { refactorObjectValuesToArrays } from "@/utils/metadataFilters"
import { clsx } from "clsx"
import { requiredUserSession } from "@/data/auth/session.server"
import { ErrorBoundaryComponent } from "@/components/ui/ErrorBoundaryComponent/ErrorBoundaryComponent"
import { useFiltersStore } from "@/store/filters"
import { getMenuVariables } from "@/data/menuvariables/menuvariables.server"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/NewTabs/tabs"
import { doesPathIncludeAll } from "@/utils/sharedFunctions"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/Popover/Popover"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faCircleInfo } from "@fortawesome/free-solid-svg-icons"
import { AnimatePresence, motion } from "framer-motion"
import InfoSection from "@/components/ui/Tabs/InfoMessage"
import useIsMobile from "@/hooks/useIsMobile"
import UseCaseTitle from "@/components/Shared/UseCaseTitle/UseCaseTitle"

const SearchSi = () => {
  const fetcher = useFetcher()
  const boundary = useRef<HTMLDivElement>(null)
  const isMobile = useIsMobile()

  const searchSiHistory =
    fetcher.data &&
    fetcher.data?.searchSiHistory &&
    fetcher.data?.searchSiHistory.length > 0
      ? fetcher.data?.searchSiHistory
      : null

  const close = useCloseSidebar((state) => state.close)
  const { setIsHistorybarOpen } = useHistorybar()
  const setSidebarClose = useCloseSidebar.getState().setClose
  const { searchMethod, setSearchMethod, setLoadingSearchSI } =
    useSearchMethod()
  const location = useLocation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const isMetadata = location.pathname.includes("metadata")

  const { setLoadingState } = useLoadingState()

  const tabs = [
    {
      label: "Semantic Search",
      children: "Semantic Search",
      id: "/searchSi/semanticSearch",
    },
    {
      label: "Metadata Search",
      children: "Metadata Search",
      id: "/searchSi/metadataSearch",
    },
    {
      label: "Hybrid Search",
      children: "Hybrid Search",
      id: "/searchSi/hybridSearch",
    },
  ]

  const [currentTabIndex, setCurrentTabIndex] = useState(location.pathname)

  const { filters, setFilters, setIsFiltersSelected } = useFiltersStore()
  const { searchResult } = useSearchResult()

  useEffect(() => {
    setFilters({})
    setIsFiltersSelected(false)
  }, [])

  // Preparar o ButtonClick do pedido
  const handlePromptSubmit = (prompt: string) => {
    setLoadingState(true)
    setLoadingSearchSI(true)
    const formData = new FormData()
    const sanitizedSearchMethod = searchMethod.replace(/\s+/g, "")

    if (searchMethod === "Hybrid Search") {
      const filterData = refactorObjectValuesToArrays(filters)

      // Append the filter data to formData
      Object.keys(filterData).forEach((key) => {
        formData.append(key, filterData[key])
      })

      // Append the prompt to formData
      formData.append("prompt", prompt)
      fetcher.submit(formData, {
        method: "post",
        action: `/searchSi/${sanitizedSearchMethod}`,
      })
    } else {
      formData.append("prompt", prompt)
      fetcher.submit(formData, {
        method: "post",
        action: `/searchSi/${sanitizedSearchMethod}`,
      })
    }
  }

  // Preparar o ButtonClick do Botão do histórico
  const handleHistoryButton = () => {
    if (!close) {
      setSidebarClose(false)
    }
    setIsHistorybarOpen(true)
    fetcher.load(`/searchSi?wasClicked=true&method=${searchMethod}`)
  }

  const sections = [
    {
      title: "DESCRIPTION:",
      content:
        "Search SI is your go-to destination for looking up documents, whether that be research, external documents, internal factbooks, etc. It's important to note that Search Si is not your ordinary keyword or fuzzy string search. Rather it uses a combination of a vector search method called semantic search along with elastic search to optimize returning documents that are most contextually and semantically similar to your prompt!",
    },
    {
      title: "METADATA FILTERING (OPTIONAL):",
      content:
        "You can further improve your search results using the metadata filters located at the right of the page. If for example you know the author(s) of the documents, document type (research, external competitor, etc.) or date range, you can filter on them to improve your search results. In fact, if you know the document ID, you can even search for that exact document. Note that all of the metadata filters contain multi-select functionality.",
    },
  ]

  const infoPopover = (
    <Popover>
      <PopoverTrigger asChild>
        <FontAwesomeIcon
          icon={faCircleInfo}
          className={`absolute right-5 top-5 sm:relative sm:-top-2 sm:right-0 text-primary cursor-pointer hover:text-primary-dark dark:hover:text-white transition-colors`}
          size="xl"
        />
      </PopoverTrigger>
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          <PopoverContent
            className="w-full max-w-[900px] bg-white border dark:bg-secondary-dark border-primary shadow-lg rounded-lg mt-2 text-xs sm:text-sm md:text-md py-8 px-9"
            align="start"
            side="left"
            avoidCollisions={false}
            collisionBoundary={boundary.current}
            style={{
              width: `calc(100vw - 2.5rem - ${
                isMobile ? "20px" : close ? "120px" : "360px"
              })`,
            }}
          >
            <InfoSection sections={sections} />
          </PopoverContent>
        </motion.div>
      </AnimatePresence>
    </Popover>
  )

  const handleTabChange = (index: string) => {
    setCurrentTabIndex(index)
    if (doesPathIncludeAll(["response", "searchSi"], location.pathname)) {
      const jobID = searchParams.get("job_id")
      const sourceID = searchParams.get("source_id")
      if (jobID) {
        navigate(`${index}/response?job_id=${jobID}&isResultStored=true`)
      } else if (sourceID) {
        navigate(`${index}/response?source_id=${sourceID}`)
      } else navigate(`/${index}`)
    } else {
      navigate(`${index}`)
    }
  }

  // Tratamento das tabs
  useEffect(() => {
    const currentTab = tabs.find((tab) => location.pathname.includes(tab.id))
    if (currentTab) {
      setSearchMethod(currentTab.label)
      setCurrentTabIndex(currentTab.id)
    }

    if (searchResult.length === 0 && location.pathname.includes("response")) {
      const url = new URL(window.location.href)
      url.searchParams.delete("isResultStored")
      window.history.replaceState({}, document.title, url.toString())
      navigate(`${location.pathname}${url.search}`)
      setLoadingSearchSI(true)
    }
  }, [location.pathname])

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
          <UseCaseTitle
            title="Search SI"
            subtitle="Browse Open SI’s document libraries"
          />
          <Tabs
            value={String(currentTabIndex)}
            onValueChange={(value) => handleTabChange(value)}
          >
            <TabsList
              actionIcons={infoPopover}
              currentValue={currentTabIndex}
              onValueChange={(value) => handleTabChange(value)}
            >
              {tabs.map((tab) => (
                <TabsTrigger key={tab.id} value={tab.id}>
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
            {tabs.map((tab) => (
              <TabsContent key={tab.id} value={tab.id}>
                <Outlet />
              </TabsContent>
            ))}
          </Tabs>
        </Main>
        <Footer>
          <section className={"flex relative"}>
            <div
              className={clsx(
                "absolute right-0 top-4 lg:static",
                close ? "" : "lg:absolute xl:static top-0 lg:right-5"
              )}
            >
              <HistoryButton handleHistoryClick={handleHistoryButton} />
            </div>
            {!isMetadata && (
              <ChatbarArea
                handlePromptSubmit={handlePromptSubmit}
                placeholder="I'll find the best documents matching your request"
              />
            )}
          </section>
        </Footer>
      </div>
      <Historybar bubbles={searchSiHistory} variant="search si" />
    </>
  )
}

export default SearchSi

export async function loader({ request }: LoaderFunctionArgs) {
  const envVar = await getMenuVariables()
  const token = await requiredUserSession(request)

  const url = new URL(request.url)
  const wasClicked = url.searchParams.get("wasClicked")

  if (wasClicked === "true") {
    const searchSiHistory = await fetchSearchSiHistory(token, 15)
    let transformedBubbles

    if (searchSiHistory.length === 0) {
      transformedBubbles = [
        {
          title: "History is empty",
          job_id: "",
          search_method: "",
        },
      ]
    } else {
      transformedBubbles = searchSiHistory.map((item: Bubble) => ({
        title: item.title,
        job_id: item.job_id,
        search_method: item.search_method,
      }))
    }

    return json({ searchSiHistory: transformedBubbles, envVar })
  } else {
    return { envVar }
  }
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData()
  const token = await requiredUserSession(request)
  const searchMethod = formData.get("method") as string
  const historyIntent = formData.get("historyIntent") as string
  const jobId = formData.get("bubble_id") as string
  let sanitizedSearchMethod

  if (searchMethod) {
    sanitizedSearchMethod = searchMethod.replace(/\s+/g, "")
  }

  if (historyIntent === "delete_single_history") {
    const response = await deleteSearchSiSingleHistory(token, jobId)
    if (response) {
      return json({ deleteSingleHistory: response })
    }
  }

  const Response = await DeleteSearchSiHistory(token)
  if (Response) {
    return redirect(`/searchSi/${sanitizedSearchMethod}`)
  } else {
    console.log("😭 History was not reset")
    return json({ feedbackState: "failed" })
  }
}

export function ErrorBoundary() {
  return <ErrorBoundaryComponent isMainRoute={true} />
}
