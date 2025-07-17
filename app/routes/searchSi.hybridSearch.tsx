import {
  createMetadataSearchFilters,
  createSearchSiPrompt,
  fetchMetadataFilters,
} from "@/data/searchsi/searchSi.server"
import {
  ActionFunctionArgs,
  json,
  LoaderFunction,
  LoaderFunctionArgs,
  redirect,
} from "@remix-run/node"
import { Outlet, useFetcher, useNavigation } from "@remix-run/react"
import { faCheck, faSliders } from "@fortawesome/free-solid-svg-icons"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/Button/Button"
import { LoadingComponent } from "@/components/Layout/LoadingComponent/LoadingComponent"
import { useLoadingState } from "@/store/layout"
import { createMetadataSearchFilters_BEStructure } from "@/utils/metadataFilters"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { requiredUserSession } from "@/data/auth/session.server"
import { ErrorBoundaryComponent } from "@/components/ui/ErrorBoundaryComponent/ErrorBoundaryComponent"
import { useFiltersStore } from "@/store/filters"
import { FetcherData } from "@/components/Shared/Filters/types"
import { Filters } from "@/components/Shared/Filters/Filters"
import { useSearchMethod, useSearchResult } from "@/store/searchsi"
import { doesPathIncludeAll } from "@/utils/sharedFunctions"
import LoadingStatus from "@/components/Shared/LoadingStatus/LoadingStatus"

const HybridSearch = () => {
  const fetcher = useFetcher<FetcherData>()
  const [showFilters, setShowFilters] = useState(false)
  const { setLoadingState } = useLoadingState()
  const { loadingSearchSI, setLoadingSearchSI } = useSearchMethod()
  const { searchResult } = useSearchResult()
  const navigation = useNavigation()

  const {
    isFiltersSelected,
    setUpdatedFilterData,
    updatedFilterData,
    setInitialFiltersData,
    initialFiltersData,
  } = useFiltersStore()

  useEffect(() => {
    if (
      navigation.state === "idle" &&
      location.pathname.includes("/response")
    ) {
      setLoadingState(false)
      setLoadingSearchSI(false)
    }
  }, [navigation.state])

  useEffect(() => {
    if (fetcher.data?.filters && Object.keys(initialFiltersData).length === 0) {
      setUpdatedFilterData(fetcher.data?.filters)
      setInitialFiltersData(fetcher.data?.filters)
      setLoadingState(false)
    }
  }, [fetcher.data?.filters])

  useEffect(() => {
    if (
      searchResult.length === 0 &&
      doesPathIncludeAll(["searchSi", "response"], location.pathname)
    ) {
      setLoadingSearchSI(true)
    }
  }, [])

  const handleShowFilters = (value: boolean) => {
    setShowFilters(value)
    if (
      updatedFilterData === null ||
      Object.keys(updatedFilterData).length === 0
    )
      fetcher.load("?intent=filter")
  }

  return (
    <>
      <h3 className="text-base mb-8">
        This search method will use both Semantic Search and Metadata Search.
        Select your metadata filters and enter your search or query in the chat
        bar and press enter. Your results will therefore be the intersection of
        your query and metadata filters.
      </h3>
      <Button
        className="mb-4 gap-2"
        variant="outline"
        onClick={() => {
          handleShowFilters(true)
          Object.keys(initialFiltersData).length === 0 && setLoadingState(true)
        }}
      >
        <div className="relative flex">
          <FontAwesomeIcon icon={faSliders} />
          {isFiltersSelected && (
            <FontAwesomeIcon
              icon={faCheck}
              className="bg-success rounded-full text-white scale-[0.5] !w-5 !h-5 p-1 absolute -top-[10px] -right-3"
            />
          )}
        </div>
        <span>Filters</span>
      </Button>
      {showFilters && (
        <Filters
          filterData={updatedFilterData}
          setShowFilters={setShowFilters}
        />
      )}
      {loadingSearchSI ? (
        <div className="mt-4">
          <LoadingStatus statusMessage={{ body: "Searching documents..." }} />
          <LoadingComponent />
        </div>
      ) : (
        <Outlet />
      )}
    </>
  )
}

export default HybridSearch

export const loader: LoaderFunction = async ({
  request,
}: LoaderFunctionArgs) => {
  const token = await requiredUserSession(request)

  const url = new URL(request.url)
  const intent = url.searchParams.get("intent")

  if (intent === "filter") {
    const hybridFilters = await fetchMetadataFilters(token)
    return json({
      filters: hybridFilters,
    })
  } else {
    return json({})
  }
}

export async function action({ request }: ActionFunctionArgs) {
  const token = await requiredUserSession(request)

  const url = new URL(request.url)
  const intent = url.searchParams.get("intent")
  const formData = await request.formData()

  if (intent === "filter") {
    const submitFilters = await createMetadataSearchFilters(
      token,
      createMetadataSearchFilters_BEStructure(formData)
    )
    return json({ newFilters: submitFilters })
  } else {
    const prompt = formData.get("prompt") as string
    formData.delete("prompt")

    const submitData = await createSearchSiPrompt(
      token,
      "Hybrid Search",
      prompt,
      createMetadataSearchFilters_BEStructure(formData)
    )
    return redirect(
      `/searchSi/hybridSearch/response?job_id=${submitData.job_id}`
    )
  }
}

export function ErrorBoundary() {
  return <ErrorBoundaryComponent isMainRoute={false} />
}
