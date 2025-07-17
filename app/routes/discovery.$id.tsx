import Sidebar from "@/components/Layout/Sidebar/Sidebar"
import MobileMenu from "@/components/Layout/MobileMenu/MobileMenu"
import { clsx } from "clsx"
import Header from "@/components/Layout/Header/Header"
import { useCloseSidebar } from "@/store/layout"
import { json, LoaderFunctionArgs } from "@remix-run/node"
import { useLoaderData } from "@remix-run/react"
import { requiredUserSession } from "@/data/auth/session.server"
import { ErrorBoundaryComponent } from "@/components/ui/ErrorBoundaryComponent/ErrorBoundaryComponent"
import StoryDetail from "@/components/Shared/StoryDetail/StoryDetail"
import { fetchDiscoveryStoryByID } from "@/data/discovery/discovery.server"
import { getMenuVariables } from "@/data/menuvariables/menuvariables.server"

const DiscoverySlug = () => {
  const { data } = useLoaderData<typeof loader>()
  const close = useCloseSidebar((state) => state.close)
  return (
    <>
      <Sidebar />
      <MobileMenu />
      <div
        className={clsx(
          "transition-all duration-300 min-h-screen p-0 !m-0 flex flex-col h-[90vh]",
          close ? "md:pl-sidebarClosed" : "md:pl-sidebarOpen"
        )}
      >
        <Header discoveryStoryTitle={data?.title} />
        <div className="flex flex-col grow gap-y-16 gap-x-12 relative">
          <StoryDetail data={data} />
        </div>
      </div>
    </>
  )
}

export default DiscoverySlug

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  const token = await requiredUserSession(request)
  if (!params?.id) {
    throw new Error("Story ID is required")
  }
  const storyID = await fetchDiscoveryStoryByID(token, params.id)
  const envVar = await getMenuVariables()
  return json({
    data: await storyID.portraits,
    envVar,
  })
}

export function ErrorBoundary() {
  return <ErrorBoundaryComponent isMainRoute={true} />
}
