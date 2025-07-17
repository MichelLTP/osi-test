import SummarizationResponse from "@/components/DocTools/Summarization/SummarizationResponse"
import {
  OutletContextType,
  SummarizationLoaderProps,
} from "@/components/DocTools/Summarization/types"
import { FileUploadState } from "@/components/Shared/UploadFile/types"
import { ErrorBoundaryComponent } from "@/components/ui/ErrorBoundaryComponent/ErrorBoundaryComponent"
import { requiredUserSession } from "@/data/auth/session.server"
import {
  fetchSummarizationHistoryResponse,
  fetchSummarizationResult,
  setSummarizationFeedback,
} from "@/data/documenttools/documenttools.server"
import { useSummarizationStore } from "@/store/documenttools"
import {
  ActionFunctionArgs,
  json,
  LoaderFunction,
  LoaderFunctionArgs,
  redirect,
} from "@remix-run/node"
import {
  ShouldRevalidateFunction,
  useLoaderData,
  useLocation,
  useOutletContext,
} from "@remix-run/react"
import { useEffect } from "react"

const SummarizationResult = () => {
  const { summarizationResult } = useLoaderData<SummarizationLoaderProps>()
  const {
    setSummarizationResponse,
    summarizationResponses,
    setIsSummarizationResponseLoading,
    isSummarizationResponseLoading,
    setIsInputCollapsed,
  } = useSummarizationStore()
  const { setUploadState } = useOutletContext<OutletContextType>()

  const location = useLocation()
  const searchParams = new URLSearchParams(location.search)
  const jobID = searchParams.get("job_id")

  useEffect(() => {
    if (summarizationResult.status === "completed") {
      // FIX: refactor this to use the summarizationResponses response only
      // BE should return feedback and jobID in the response
      if (jobID) {
        setSummarizationResponse({
          ...summarizationResult?.response,
          feedback: summarizationResult?.feedback || "NEUTRAL",
          jobID: summarizationResult?.jobID || jobID,
        })
      }
      setUploadState(FileUploadState.INITIAL)
      setIsInputCollapsed(0)
    }
    setIsSummarizationResponseLoading(false)
  }, [summarizationResult])

  return (
    summarizationResponses?.length > 0 &&
    summarizationResponses?.map((response, index) => {
      return (
        !isSummarizationResponseLoading && (
          <SummarizationResponse
            response={response}
            key={index}
            index={index}
          />
        )
      )
    })
  )
}

export default SummarizationResult

export const loader: LoaderFunction = async ({
  request,
}: LoaderFunctionArgs) => {
  const token = await requiredUserSession(request)

  const url = new URL(request.url)
  const params = new URLSearchParams(url.search)
  const job_id = params.get("job_id") as string
  const intent = params.get("intent") as string
  const session_id = params.get("session_id") as string
  let summarizationResult = {}
  if (job_id !== null) {
    summarizationResult = await fetchSummarizationResult(token, job_id)
  }

  if (intent === "history_response" && session_id) {
    const historyData = await fetchSummarizationHistoryResponse(
      token,
      session_id
    )
    return redirect(`?job_id=${historyData.exchanges[0].job_id}`)
  } else {
    return json({ summarizationResult: summarizationResult })
  }
}

export async function action({ request }: ActionFunctionArgs) {
  const token = await requiredUserSession(request)
  const url = new URL(request.url)
  const params = new URLSearchParams(url.search)
  const intent = params.get("intent")
  const formData = await request.formData()

  if (intent === "feedback") {
    const feedback = formData.get("feedbackState") as string

    const response = await setSummarizationFeedback(token, formData)

    if (response === null) {
      return json({ feedbackState: feedback })
    } else {
      return json({ feedbackState: "failed" })
    }
  }
}

export const shouldRevalidate: ShouldRevalidateFunction = ({
  currentParams,
  defaultShouldRevalidate,
  nextParams,
}) => {
  if (currentParams === nextParams) {
    return false
  }
  return defaultShouldRevalidate
}

export function ErrorBoundary() {
  return <ErrorBoundaryComponent isMainRoute={false} />
}
