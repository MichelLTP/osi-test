import {
  createRelatedDocumentsSearch,
  createSearchSiPrompt,
} from "@/data/searchsi/searchSi.server"
import { ActionFunctionArgs, redirect } from "@remix-run/node"
import { LoadingComponent } from "@/components/Layout/LoadingComponent/LoadingComponent"
import { Outlet, useNavigation } from "@remix-run/react"
import { useLoadingState } from "@/store/layout"
import { useEffect } from "react"
import { requiredUserSession } from "@/data/auth/session.server"
import { ErrorBoundaryComponent } from "@/components/ui/ErrorBoundaryComponent/ErrorBoundaryComponent"
import { useSearchMethod } from "@/store/searchsi"
import LoadingStatus from "@/components/Shared/LoadingStatus/LoadingStatus"

const SemanticSearch = () => {
  const { setLoadingState } = useLoadingState()
  const { loadingSearchSI, setLoadingSearchSI } = useSearchMethod()
  const navigation = useNavigation()

  useEffect(() => {
    setLoadingSearchSI(false)
  }, [])

  useEffect(() => {
    if (
      navigation.state === "idle" &&
      location.pathname.includes("/response")
    ) {
      setLoadingState(false)
      setLoadingSearchSI(false)
    }
  }, [navigation.state])
  return (
    <>
      <h3 className="text-base mb-8">
        This search method will leverage the power of semantic meaning to find
        documents that contain information most similar to your request.
      </h3>
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

export default SemanticSearch

export async function action({ request }: ActionFunctionArgs) {
  const token = await requiredUserSession(request)

  const formData = await request.formData()

  const prompt = formData.get("prompt") as string
  const relatedDocuments = formData.get("data") as string

  if (prompt && prompt.length > 0) {
    const submitData = await createSearchSiPrompt(
      token,
      "Semantic Search",
      prompt
    )
    return redirect(
      `/searchSi/semanticSearch/response?job_id=${submitData.job_id}`
    )
  } else if (relatedDocuments && relatedDocuments.length > 0) {
    const submitData = await createRelatedDocumentsSearch(
      token,
      relatedDocuments
    )
    return redirect(
      `/searchSi/semanticSearch/response?job_id=${submitData.job_id}`
    )
  } else {
    return null
  }
}

export function ErrorBoundary() {
  return <ErrorBoundaryComponent isMainRoute={false} />
}
