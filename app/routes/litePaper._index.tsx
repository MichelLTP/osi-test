import {
  json,
  Link,
  ShouldRevalidateFunction,
  useFetcher,
  useLoaderData,
  useNavigate,
  useNavigation,
} from "@remix-run/react"
import { requiredUserSession } from "@/data/auth/session.server"
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  faBook,
  faEdit,
  faEllipsis,
  faFileLines,
  faPlus,
} from "@fortawesome/free-solid-svg-icons"
import Main from "@/components/Layout/Main/Main"
import { Loader2 } from "lucide-react"
import {
  deleteWorkspace,
  getUserWorkspaces,
} from "@/data/litepaper/litepaper.server"
import { ErrorBoundaryComponent } from "@/components/ui/ErrorBoundaryComponent/ErrorBoundaryComponent"
import React, { useEffect, useState } from "react"
import DropdownContent from "@/components/ui/DropdownContent/DropdownContent"
import { faEye } from "@fortawesome/free-regular-svg-icons"
import { useCloseSidebar } from "@/store/layout"
import WorkspaceCard from "@/components/LitePaper/WorkspaceCard/WorkspaceCard"
import Pagination from "@/components/ui/Pagination/Pagination"
import { getPaginatedItems } from "@/utils/sharedFunctions"
import { Workspace } from "@/components/LitePaper/types"
import { toast } from "@/hooks/useToast"
import { Toaster } from "@/components/ui/Toast/Toaster"
import { useLitePaper } from "@/store/litepaper"
import { Button } from "@/components/ui/Button/Button"
import UseCaseTitle from "@/components/Shared/UseCaseTitle/UseCaseTitle"

export default function LitePaper() {
  const fetcher = useFetcher<{ status: string }>()
  const navigation = useNavigation()
  const navigate = useNavigate()
  const litePaper = useLitePaper()
  const { workspaces } = useLoaderData<{ workspaces: Workspace[] }>()
  const isSidebarClosed = useCloseSidebar((state) => state.close)

  const [isLoading, setIsLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(0)
  const ITEMS_PER_PAGE = 4

  const paginatedWorkspaces = getPaginatedItems(
    workspaces,
    ITEMS_PER_PAGE,
    currentPage
  )

  const newPaperClick = () => {
    setIsLoading(true)
    litePaper.resetLitePaper()
    navigate("settings")
  }

  const handleWorkspaceDelete = (workspaceId: string) => {
    const formData = new FormData()
    formData.append("intent", "delete")
    if (workspaceId) {
      formData.append("workspaceId", workspaceId)
    }
    fetcher.submit(formData, {
      method: "post",
    })
  }

  const menuTrigger = (
    <FontAwesomeIcon
      icon={faEllipsis}
      onClick={(e) => {
        e.preventDefault()
      }}
    />
  )

  useEffect(() => {
    if (fetcher.data) {
      const { status } = fetcher.data

      if (status === "deleted") {
        toast({
          title: `Workspace Deleted`,
          description: ``,
          variant: "success",
        })
        navigate("/litePaper") //tried with a fetcher.load but it was not working. This works fine and its fast
      } else if (status === "error deleting") {
        toast({
          title: `Error Deleting Workspace`,
          description: ``,
          variant: "error",
        })
      }
    }
  }, [fetcher.data])

  return (
    <Main>
      <Toaster />
      <div className="flex flex-row justify-between items-center my-10">
        <UseCaseTitle
          title={"LitePaper"}
          subtitle={"Create your own reports, leveraging all of Open SI tools"}
        />
        <Button
          icon={faPlus}
          onClick={newPaperClick}
          helperText={"Create a new story"}
          isLoading={isLoading}
          variant={"outlineHighlight"}
        >
          New Paper
        </Button>
      </div>
      <div
        className={`grid grid-cols-1 ${
          isSidebarClosed ? "md:grid-cols-2" : "lg:grid-cols-2"
        } gap-6`}
      >
        <section>
          <h3 className={"text-2xlbold border-b-2 dark:border-third-dark pb-3"}>
            Your Workspace
          </h3>

          <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2  gap-7 py-8">
            {paginatedWorkspaces.map((workspace) => {
              return (
                <Link
                  key={workspace.id}
                  to={`slides?workspaceId=${workspace.id}`}
                >
                  <WorkspaceCard
                    cardICon={faFileLines}
                    workspace={workspace}
                    handleDelete={handleWorkspaceDelete}
                  />
                </Link>
              )
            })}
          </section>
          <div className="mt-4 flex justify-center">
            <Pagination
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              totalItems={workspaces.length}
            />
          </div>
        </section>
        <section>
          <h3 className={"text-2xlbold border-b-2 dark:border-third-dark pb-3"}>
            Public Collection
          </h3>
          {false && (
            <section className="grid grid-cols-1 sm:grid-cols-2 gap-7 py-8">
              {workspaces.map((workspace) => {
                // TODO: Replace with a separate component (WorkspaceCard or create Public Collection component) to prevent this from being too long
                const menuItems = [
                  {
                    text: "View",
                    action: () => {
                      litePaper.resetLitePaper()
                      navigate(`response?workspaceId=${workspace.id}`)
                    },
                    icon: faEye,
                  },
                  {
                    text: "Edit",
                    action: () =>
                      navigate(`settings?workspaceId=${workspace.id}`),
                    icon: faEdit,
                  },
                ]
                return (
                  <div
                    key={workspace.id}
                    className="flex flex-col gap-3 px-5 pt-4 h-[121px] text-secondary dark:text-white dark:border-white text-sm border border-secondary rounded-xs hover:bg-primary/5 dark:hover:bg-white/5 transition-colors overflow-hidden"
                  >
                    <div className="flex justify-between">
                      <span className="text-xs">Date goes here</span>
                      <DropdownContent
                        items={menuItems}
                        align="end"
                        direction="bottom"
                        variant="grey"
                        customTrigger={menuTrigger}
                      />
                    </div>

                    <div className="flex gap-3">
                      {navigation.state === "loading" ? (
                        <Loader2 className={"animate-spin text-primary"} />
                      ) : (
                        <FontAwesomeIcon
                          icon={faBook}
                          size="lg"
                          className="text-secondary dark:text-third-dark pt-2"
                        />
                      )}
                      <div className="max-w-[80%]">
                        <span className="line-clamp-1 text-basebold">
                          {workspace.name}
                        </span>
                        <p className="line-clamp-2 text-xs">
                          {workspace.description}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </section>
          )}
        </section>
      </div>
    </Main>
  )
}

export async function loader({ request }: LoaderFunctionArgs) {
  const token = await requiredUserSession(request)
  const workspaces = await getUserWorkspaces(token)
  return json({ workspaces: workspaces })
}

export async function action({ request }: ActionFunctionArgs) {
  const token = await requiredUserSession(request)
  const formData = await request.formData()
  const intent = formData.get("intent")
  const workspaceId = formData.get("workspaceId")

  if (intent === "delete" && workspaceId) {
    const deleteStatus = await deleteWorkspace(token, workspaceId as string)
    return json({ status: deleteStatus === 200 ? "deleted" : "error deleting" })
  } else {
    return null
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
