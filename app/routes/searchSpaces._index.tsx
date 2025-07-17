import {
  json,
  Link,
  ShouldRevalidateFunction,
  useFetcher,
  useLoaderData,
  useNavigate,
  useNavigation,
} from "@remix-run/react"
import type { LoaderFunctionArgs } from "@remix-run/node"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faFolder, faPlus } from "@fortawesome/free-solid-svg-icons"
import Main from "@/components/Layout/Main/Main"
import { ErrorBoundaryComponent } from "@/components/ui/ErrorBoundaryComponent/ErrorBoundaryComponent"
import { getAllSpaces } from "@/data/searchspaces/searchSpaces.server"
import React, { useState } from "react"
import { useCloseSidebar } from "@/store/layout"
import Pagination from "@/components/ui/Pagination/Pagination"
import { getPaginatedItems } from "@/utils/sharedFunctions"
import { Toaster } from "@/components/ui/Toast/Toaster"
import { requiredUserSession } from "@/data/auth/session.server"
import { getMenuVariables } from "@/data/menuvariables/menuvariables.server"
import { faFolderTree } from "@fortawesome/free-solid-svg-icons/faFolderTree"
import { IconProp } from "@fortawesome/fontawesome-svg-core"
import { faFile, faPenToSquare } from "@fortawesome/free-regular-svg-icons"
import Modal from "@/components/Shared/Modal/Modal"
import { Button } from "@/components/ui/Button/Button"
import type { SpaceInfo } from "@/data/searchspaces/types"
import DropdownContent from "@/components/ui/DropdownContent/DropdownContent"
import { faTrashAlt } from "@fortawesome/free-solid-svg-icons/faTrashAlt"
import { faBinoculars } from "@fortawesome/free-solid-svg-icons/faBinoculars"
import { action } from "@/routes/searchSpaces.spaces.$id"
import UseCaseTitle from "@/components/Shared/UseCaseTitle/UseCaseTitle"

export default function SearchSpaces_index() {
  const isSidebarClosed = useCloseSidebar((state) => state.close)
  const { initialSpaces } = useLoaderData<typeof loader>()
  const navigate = useNavigate()
  const navigation = useNavigation()
  const fetcher = useFetcher<typeof action>()
  const [deleteTarget, setDeleteTarget] = useState<string>("")

  const [currentPage, setCurrentPage] = useState(0)
  const ITEMS_PER_PAGE = 6
  const totalItems = initialSpaces.length
  const paginatedDocs = getPaginatedItems(
    initialSpaces,
    ITEMS_PER_PAGE,
    currentPage
  )

  const handleDeleteSpace = async () => {
    fetcher.submit(
      { intent: "delete" },
      {
        method: "delete",
        action: `/searchSpaces/spaces/${deleteTarget}`,
      }
    )
    setDeleteTarget("")
  }
  return (
    <Main>
      <Toaster />
      {deleteTarget && (
        <Modal
          title={"Delete Space"}
          hasCancel
          handleClose={() => setDeleteTarget("")}
          size={"x-small"}
          variant={"confirmation"}
          confirmationProps={{
            actionText: "Delete",
            handleAction: () => {
              handleDeleteSpace().then()
            },
          }}
        >
          <p className={"mb-6"}>Do you want to delete this Space?</p>
        </Modal>
      )}

      <div className="flex flex-col justify-between items-start mb-[73.5px] md:my-10 md:items-center md:flex-row ">
        <UseCaseTitle
          title={"Search Spaces"}
          subtitle={"Create your own workspace of Open SI documents"}
        />
        <Button
          icon={faPlus}
          variant={"outlineHighlight"}
          onClick={() => navigate("create")}
          helperText={"Create a new space"}
          isLoading={
            navigation.state === "loading" &&
            navigation?.location?.pathname?.includes("create")
          }
        >
          Add Space
        </Button>
      </div>
      <div className={`grid gap-6`}>
        <header
          className={
            "flex items-center gap-2 border-b-2 dark:border-third-dark pb-3"
          }
        >
          <FontAwesomeIcon icon={faFolderTree as IconProp} />
          <h1 className={"text-xlbold"}>Spaces</h1>
        </header>

        <section
          className={`grid ${
            isSidebarClosed ? "md:grid-cols-2" : "grid-cols-1 xl:grid-cols-2"
          } py-4 gap-7`}
        >
          {(paginatedDocs as SpaceInfo[]).map((space, index) => {
            return (
              <article
                className={
                  "bg-third dark:bg-secondary-dark text-secondary dark:text-third rounded-xs p-8 relative cursor-pointer border duration-300 border-transparent hover:border-primary"
                }
                key={space.workspace_id + index + space.title}
              >
                <div className="absolute top-6 right-6">
                  <DropdownContent
                    direction={"bottom"}
                    align={"start"}
                    items={[
                      {
                        text: "Run Insights",
                        action: () => {
                          navigate("insights/" + space.workspace_id)
                        },
                        icon: faBinoculars as IconProp,
                      },
                      {
                        text: "Edit Space",
                        action: () => {
                          navigate("spaces/" + space.workspace_id + "/edit")
                        },
                        showSpinner: true,
                        icon: faPenToSquare as IconProp,
                      },
                      {
                        text: "Delete Space",
                        action: () => {
                          setDeleteTarget(space.workspace_id)
                        },
                        icon: faTrashAlt,
                        danger: true,
                      },
                    ]}
                  />
                </div>
                <Link to={"spaces/" + space.workspace_id}>
                  <header className="flex items-center justify-between mb-4">
                    <span className={"flex gap-4 items-center"}>
                      <FontAwesomeIcon icon={faFolder as IconProp} />
                      <h2 className="text-2xlbold line-clamp-2">
                        {space.title}
                      </h2>
                    </span>
                  </header>
                  <main className={"grid grid-cols-2 gap-6"}>
                    <div className="bg-secondary/20 dark:bg-third/20 h-[302px]">
                      {space.thumbnail_url && (
                        <img
                          src={space.thumbnail_url}
                          className={"object-fit h-full w-full"}
                          alt={"Image"}
                        />
                      )}
                    </div>
                    <section className="flex flex-col gap-6">
                      <p>{space.description}</p>
                      <strong>Documents:</strong>
                      <ul className="list-none flex flex-col gap-4">
                        {space.doc_names.slice(0, 5).map((doc, index) => (
                          <li key={index} className="text-base">
                            <FontAwesomeIcon
                              icon={faFile as IconProp}
                              className="mr-2"
                            />
                            {doc}
                          </li>
                        ))}
                        {space.doc_names.length > 5 && (
                          <li
                            className="text-sm"
                            title={space.doc_names.slice(5).join(", ")}
                          >
                            +{space.doc_names.length - 5} more
                          </li>
                        )}
                      </ul>
                    </section>
                  </main>
                </Link>
              </article>
            )
          })}
        </section>
        <Pagination
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          totalItems={totalItems}
          itemsPerPage={ITEMS_PER_PAGE}
        />
      </div>
    </Main>
  )
}

export async function loader({ request }: LoaderFunctionArgs) {
  const token = await requiredUserSession(request)
  const envVar = await getMenuVariables()

  const initialSpaces = await getAllSpaces(token, 50, 0)

  if (!initialSpaces) {
    throw new Response("Failed to fetch spaces", { status: 500 })
  }
  return json({
    envVar,
    initialSpaces,
  })
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
  return (
    <Modal title="Error">
      <ErrorBoundaryComponent isMainRoute={false} />
    </Modal>
  )
}
