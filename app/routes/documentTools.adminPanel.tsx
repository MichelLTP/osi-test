import { Outlet } from "@remix-run/react"
import Main from "@/components/Layout/Main/Main"
import SelectFields from "@/components/DocTools/AdminPanel/SelectFields/SelectFields"
import Sidebar from "@/components/Layout/Sidebar/Sidebar"
import MobileMenu from "@/components/Layout/MobileMenu/MobileMenu"
import { clsx } from "clsx"
import { ErrorBoundaryComponent } from "@/components/ui/ErrorBoundaryComponent/ErrorBoundaryComponent"
import { requiredUserSession } from "@/data/auth/session.server"
import { getMenuVariables } from "@/data/menuvariables/menuvariables.server"
import { LoaderFunctionArgs } from "@remix-run/node"

export default function AdminPanel() {
  return (
    <>
      <Sidebar />
      <MobileMenu />
      <div
        className={clsx(
          "transition-[padding] duration-300 w-full p-0 !m-0 flex flex-col"
        )}
      >
        <Main>
          <p className="pt-3 pb-10 border-opacity-60">
            This is the admin panel for finalizing the document summary, top
            insights and adding or deleting documents to or from the SI
            knowledge base.
          </p>
          <SelectFields />
          <Outlet />
        </Main>
      </div>
    </>
  )
}

export async function loader({ request }: LoaderFunctionArgs) {
  // This line is for protecting the current route
  const envVar = await getMenuVariables()
  await requiredUserSession(request)
  return { envVar }
}

export function ErrorBoundary() {
  return <ErrorBoundaryComponent isMainRoute={false} />
}
