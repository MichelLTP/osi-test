import SearchSiResult from "@/components/SearchSi/SemanticSearchResult/SemanticSearchResult"
import {
  LoaderData,
  PdfData,
  PdfDataWithBlobURL,
  SearchSiResultData,
} from "@/components/SearchSi/type"
import {
  setUserFeedback,
  fetchPdfResponse,
  fetchSearchSiResult,
  fetchMetadataFilters,
  fetchSourceFromDocId,
} from "@/data/searchsi/searchSi.server"
import {
  ActionFunctionArgs,
  json,
  LoaderFunction,
  LoaderFunctionArgs,
} from "@remix-run/node"
import { useFetcher, useLoaderData, useNavigate } from "@remix-run/react"
import { motion } from "framer-motion"
import { useEffect, useState } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faBarsStaggered, faQuoteLeft } from "@fortawesome/free-solid-svg-icons"
import { useLoadingState } from "@/store/layout"
import { requiredUserSession } from "@/data/auth/session.server"
import { ErrorBoundaryComponent } from "@/components/ui/ErrorBoundaryComponent/ErrorBoundaryComponent"
import { useSearchMethod, useSearchResult } from "@/store/searchsi"

const MetadataSearchResult = () => {
  const { searchSiResults, prompt, jobId } = useLoaderData<LoaderData>()
  const { searchResult, setSearchResult } = useSearchResult()
  const [pdfUrls, setPdfUrls] = useState<PdfDataWithBlobURL[]>([])
  const fetcher = useFetcher<LoaderData>()
  const { setLoadingState } = useLoadingState()
  const { setLoadingSearchSI } = useSearchMethod()
  const navigate = useNavigate()

  useEffect(() => {
    if (fetcher.data && fetcher.data.data) {
      const newPdfUrlWithBlobURL = {
        ...fetcher.data.data,
        blobURL: getBlobURL(fetcher.data.data),
      }

      const index = pdfUrls.findIndex(
        (i) => i.docId === fetcher.data?.data?.docId
      )
      if (index === -1) {
        setPdfUrls([...pdfUrls, newPdfUrlWithBlobURL])
      } else {
        const newPdfUrls = [...pdfUrls]
        newPdfUrls[index] = newPdfUrlWithBlobURL
        setPdfUrls(newPdfUrls)
      }
    }
  }, [fetcher.data])

  useEffect(() => {
    if (searchSiResults && searchSiResults.length > 0 && jobId) {
      // Add jobID and prompt to each result item
      const updatedResult: SearchSiResultData[] = searchSiResults.map(
        (result) => ({
          ...result,
          jobID: jobId,
          prompt: prompt || "",
        })
      )

      setLoadingSearchSI(false)

      // Set the updated results in the Zustand store
      setSearchResult(updatedResult)
    }
  }, [searchSiResults, prompt, jobId, setSearchResult, navigate])

  const getBlobURL = (pdfData: PdfData) => {
    const byteCharacters = atob(pdfData.file)
    const byteNumbers = new Array(byteCharacters.length)
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i)
    }
    const byteArray = new Uint8Array(byteNumbers)
    const blob = new Blob([byteArray], { type: pdfData.type })
    // Return the Blob URL to the state
    return window.URL.createObjectURL(blob)
  }

  const getFileByDocId = (docId: string) => {
    fetcher.load(
      `/searchSi/metadataSearch/response?doc_id=${docId}&loadpdf=yes`
    )
  }

  useEffect(() => {
    if (searchSiResults) {
      setLoadingState(false)
    }
  }, [searchSiResults])

  return (
    <>
      {searchResult[0]?.prompt && (
        <div className="flex flex-row gap-x-4 items-center py-6">
          <FontAwesomeIcon
            icon={faQuoteLeft}
            className="h-4 w-6 shrink-0 transition-transform duration-200 text-primary bg-primary bg-opacity-5 rounded-full p-2"
            size="xl"
          />
          <h3 className="text-2xlbold text-primary">
            {searchResult[0].prompt}
          </h3>
        </div>
      )}
      <div className="flex items-center gap-x-2 my-6">
        <FontAwesomeIcon
          icon={faBarsStaggered}
          className="h-4 w-4 text-secondary dark:text-white"
        />
        <h3 className="flex items-center text-xlbold">
          <span>
            Search Results {`(${searchResult && searchResult.length})`}
          </span>
        </h3>
      </div>
      {searchResult &&
        Object.keys(searchResult).length > 0 &&
        searchResult.map((result: SearchSiResultData, index: number) => (
          <motion.div
            key={index}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <SearchSiResult
              response={result}
              onExpandChange={(value) => {
                if (value) getFileByDocId(result.doc_id)
              }}
              pdfUrl={pdfUrls.find((i) => i.docId === result.doc_id)?.blobURL}
            />
          </motion.div>
        ))}
    </>
  )
}

export default MetadataSearchResult

export const loader: LoaderFunction = async ({
  request,
}: LoaderFunctionArgs) => {
  const token = await requiredUserSession(request)

  const url = new URL(request.url)
  const params = new URLSearchParams(url.search)

  const job_id = params.get("job_id")
  const isResultStored = params.get("isResultStored")
  const intent = url.searchParams.get("intent")

  const sourceDoc_id = url.searchParams.get("source_id")
  let sourceDocResponse = null
  if (sourceDoc_id) {
    sourceDocResponse = await fetchSourceFromDocId(token, sourceDoc_id)
  }

  if (sourceDoc_id && sourceDocResponse) {
    return json({
      searchSiResults: sourceDocResponse.docs,
      prompt: sourceDocResponse.prompt,
      jobId: 1,
      data: null,
    })
  }

  if (intent === "filter") {
    const hybridFilters = await fetchMetadataFilters(token)
    return json({
      filters: hybridFilters,
    })
  }

  if (params.has("doc_id") && params.has("loadpdf")) {
    const doc_id = params.get("doc_id") as string
    const pdfResponse = await fetchPdfResponse(token, doc_id)
    const disposition = pdfResponse.headers.get("content-disposition")
    const filename = extractFilenameFromDisposition(disposition || "")
    const blob = await pdfResponse.blob()
    const arrayBuffer = await blob.arrayBuffer()

    return json({
      searchSiResults: null,
      data: {
        file: Buffer.from(arrayBuffer).toString("base64"),
        type: blob.type,
        name: filename,
        docId: doc_id,
      },
    })
  }

  let searchSiResults = null
  if (job_id && isResultStored !== "true") {
    searchSiResults = await fetchSearchSiResult(token, job_id)
    searchSiResults = searchSiResults.docs

    return json({
      searchSiResults: searchSiResults,
      jobId: job_id,
      data: null,
    })
  }

  return json({ jobId: job_id, data: null })
}

export async function action({ request }: ActionFunctionArgs) {
  const token = await requiredUserSession(request)

  const formData = await request.formData()
  const feedback = formData.get("feedbackState") as string

  const response = await setUserFeedback(token, formData)
  if (response) {
    return json({ feedbackState: feedback })
  } else {
    return json({ feedbackState: "failed" })
  }
}

function extractFilenameFromDisposition(disposition: string) {
  const match = disposition.match(/filename="?([^"]+)"?/)
  return match ? match[1] : "unknown.ext" // Handle missing filename
}

export function ErrorBoundary() {
  return <ErrorBoundaryComponent isMainRoute={false} />
}
