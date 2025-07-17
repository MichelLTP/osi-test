import {
  json,
  Outlet,
  useFetcher,
  useLoaderData,
  useNavigate,
  useNavigation,
  useParams,
} from "@remix-run/react"
import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  redirect,
} from "@remix-run/node"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  faFolderOpen,
  faMagnifyingGlass,
  faFile,
  faPenToSquare,
} from "@fortawesome/free-solid-svg-icons"
import Main from "@/components/Layout/Main/Main"
import { ErrorBoundaryComponent } from "@/components/ui/ErrorBoundaryComponent/ErrorBoundaryComponent"
import { useEffect, useState } from "react"
import Pagination from "@/components/ui/Pagination/Pagination"
import { getPaginatedItems } from "@/utils/sharedFunctions"
import { Toaster } from "@/components/ui/Toast/Toaster"
import { requiredUserSession } from "@/data/auth/session.server"
import { getMenuVariables } from "@/data/menuvariables/menuvariables.server"
import { IconProp } from "@fortawesome/fontawesome-svg-core"
import SpaceInfo from "@/components/SearchSpaces/SpaceInfo/SpaceInfo"
import { toast } from "@/hooks/useToast"
import { Button } from "@/components/ui/Button/Button"
import Modal from "@/components/Shared/Modal/Modal"
import SearchSpaceActions from "@/components/SearchSpaces/SearchSpaceActions/SearchSpaceActions"
import {
  getSpaceById,
  deleteSpace,
  fetchCoverImages,
} from "@/data/searchspaces/searchSpaces.server"
import { faTrashAlt } from "@fortawesome/free-solid-svg-icons/faTrashAlt"
import DropdownContent from "@/components/ui/DropdownContent/DropdownContent"
import BackButton from "@/components/ui/BackButton/BackButton"

export default function SearchSpaces_Spaces_Id() {
  const params = useParams()
  const navigate = useNavigate()
  const navigation = useNavigation()
  const fetcher = useFetcher<typeof action>()
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<
    | null
    | { type: "space" }
    | {
        type: "doc"
        docId: string
      }
  >(null)
  const { spaceData, images } = useLoaderData<typeof loader>()
  const [currentPage, setCurrentPage] = useState(0)
  const ITEMS_PER_PAGE = 4
  const docsWithMetadata = spaceData?.["docs_with_metadata"] || []
  const paginatedItems = getPaginatedItems(
    docsWithMetadata,
    ITEMS_PER_PAGE,
    currentPage
  )
  const handleDeleteSpace = async () => {
    fetcher.submit({ intent: "delete" }, { method: "DELETE" })
  }
  const handleDeleteDoc = async (docId: string) => {
    const newDocs = spaceData.doc_ids.filter((id: string) => id !== docId)
    fetcher.submit(
      {
        data: JSON.stringify({
          title: spaceData.title,
          doc_ids: newDocs,
          description: spaceData.description,
        }),
      },
      {
        method: "patch",
        action: `/searchSpaces/insights/${params.id}?intent=modifyDocs`,
      }
    )
  }

  useEffect(() => {
    if (
      fetcher.state === "idle" &&
      fetcher.data?.intent === "modifyDocs" &&
      fetcher.data?.status?.toString() === "200"
    ) {
      toast({
        title: "Remove Document",
        description: fetcher.data?.message,
        variant: "success",
      })
    }

    if (
      (fetcher.state === "idle" &&
        fetcher.data?.status?.toString() === "500") ||
      fetcher.data?.status?.toString() === "400"
    ) {
      toast({
        title: "Error",
        description: fetcher.data?.message || "An error has occurred",
        variant: "error",
      })
    }
  }, [fetcher.state])

  return (
    <Main>
      <Outlet />
      {deleteModalOpen && (
        <Modal
          title={
            deleteTarget?.type === "space" ? "Delete Space" : "Remove Document"
          }
          hasCancel
          handleClose={() => {
            setDeleteModalOpen(false)
            setDeleteTarget(null)
          }}
          size={"x-small"}
          variant={"confirmation"}
          confirmationProps={{
            actionText: deleteTarget?.type === "space" ? "Delete" : "Remove",
            handleAction: () => {
              if (deleteTarget?.type === "space") {
                handleDeleteSpace().then()
              } else if (deleteTarget?.type === "doc" && deleteTarget.docId) {
                handleDeleteDoc(deleteTarget.docId).then()
              }
              setDeleteModalOpen(false)
              setDeleteTarget(null)
            },
          }}
        >
          <p className={"mb-6"}>
            {deleteTarget?.type === "space"
              ? "Do you want to delete this Space?"
              : "Do you want to remove this document from the Space?"}
          </p>
        </Modal>
      )}
      <Toaster />
      <section className="flex justify-between my-10 items-center">
        <BackButton customURL={`/searchSpaces`} />
        <Button
          icon={faPenToSquare}
          onClick={() => navigate("edit")}
          helperText={"Modify space"}
          variant={"outlineHighlight"}
          isLoading={
            navigation.state === "loading" &&
            navigation?.location?.pathname?.includes("edit")
          }
        >
          Edit Space
        </Button>
      </section>
      <div className={`grid gap-6`}>
        <header
          className={
            "flex items-center justify-between gap-2 border-b-2 dark:border-third-dark pb-3"
          }
        >
          <div className={"flex gap-2 items-center"}>
            <FontAwesomeIcon icon={faFolderOpen as IconProp} />
            <h1 className={"text-2xlbold line-clamp-2"}>{spaceData.title}</h1>
          </div>
          <SearchSpaceActions
            onDelete={() => {
              setDeleteTarget({ type: "space" })
              setDeleteModalOpen(true)
            }}
            searchSpaceId={params.id}
            docs={{
              doc_ids: spaceData?.doc_ids,
              doc_names: spaceData?.doc_names,
            }}
          />
        </header>

        <section className={`grid grid-cols-1 py-4 gap-4 md:gap-7`}>
          {paginatedItems?.map((collection, colIndex) => (
            <article
              className={
                "bg-third dark:bg-secondary-dark rounded-xs p-4 md:p-8 relative text-secondary dark:text-third"
              }
              key={colIndex}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="flex gap-4 items-center min-w-0 flex-1">
                  <FontAwesomeIcon
                    icon={faFile as IconProp}
                    className="flex-shrink-0"
                  />
                  <h5 className="text-xlbold md:text-2xlbold break-words line-clamp-2">
                    {collection.doc_name}
                  </h5>
                </span>

                <div className="flex-shrink-0 ml-2">
                  <DropdownContent
                    direction={"bottom"}
                    align={"start"}
                    items={[
                      {
                        text: "View on SearchSI",
                        action: () => {
                          navigate(
                            `/searchSi/semanticSearch/response?source_id=${collection.doc_id}`
                          )
                        },
                        icon: faMagnifyingGlass as IconProp,
                      },
                      {
                        text: "Remove Document",
                        action: () => {
                          setDeleteTarget({
                            type: "doc",
                            docId: collection.doc_id,
                          })
                          setDeleteModalOpen(true)
                        },
                        icon: faTrashAlt,
                        danger: true,
                      },
                    ]}
                  />
                </div>
              </div>
              <SpaceInfo
                image={images[currentPage * ITEMS_PER_PAGE + colIndex]}
                data={collection}
              />
            </article>
          ))}
        </section>
        <Pagination
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          totalItems={docsWithMetadata.length}
        />
      </div>
    </Main>
  )
}

export async function loader({ request, params }: LoaderFunctionArgs) {
  const token = await requiredUserSession(request)
  const { id } = params
  const envVar = await getMenuVariables()

  if (!id) {
    throw new Response("Space ID is required", { status: 400 })
  }

  const spaceData = await getSpaceById(token, id)
  const images = await Promise.all(
    spaceData.docs_with_metadata.map((doc) =>
      fetchCoverImages(token, doc.doc_cover_url)
    )
  )
  return json({
    envVar,
    spaceData,
    images,
  })
}

export async function action({ request, params }: ActionFunctionArgs) {
  const formData = await request.formData()
  const token = await requiredUserSession(request)
  const { id } = params
  const { intent } = Object.fromEntries(formData)
  if (!id) {
    return json({ status: 400, message: "Space ID is required", intent })
  }

  switch (intent) {
    case "delete": {
      const status = await deleteSpace(token, id)
      if (status === 200) {
        return redirect(`/searchSpaces`)
      }
      return json({
        status: 500,
        message: "Failed to delete space",
        intent: "delete",
      })
    }
    default: {
      return json({ status: 400, message: "Invalid action", intent })
    }
  }
}

export function ErrorBoundary() {
  return <ErrorBoundaryComponent isMainRoute={false} />
}
