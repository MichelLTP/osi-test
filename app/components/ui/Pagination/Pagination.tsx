import React from "react"
import {
  Pagination as UiPagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ExternalComponents/Pagination/pagination"
import { PaginationProps } from "@/components/ui/Pagination/types"
import { getPaginationFooter } from "@/utils/sharedFunctions"

const Pagination: React.FC<PaginationProps> = React.memo(
  ({
    currentPage,
    setCurrentPage,
    totalItems,
    itemsPerPage = 4,
    isModal = false,
  }) => {
    if (totalItems === 0) {
      return null
    }
    const totalPages = Math.ceil(totalItems / itemsPerPage)
    const pagesToShow = getPaginationFooter(totalPages, currentPage)
    const isFirstPage = currentPage === 0
    const isLastPage = currentPage >= totalPages - 1

    return (
      <footer className={isModal ? "" : "mb-7"}>
        <UiPagination>
          <PaginationContent className="space-x-1">
            <PaginationItem>
              <PaginationPrevious
                onClick={() => setCurrentPage(currentPage - 1)}
                className={`${isFirstPage ? "pointer-events-none opacity-50" : ""}`}
              />
            </PaginationItem>
            {pagesToShow.map((page) => (
              <PaginationItem key={page}>
                <PaginationLink
                  href="#"
                  onClick={(e) => {
                    e.preventDefault()
                    setCurrentPage(page)
                  }}
                  isActive={page === currentPage}
                  className="rounded-[6px] w-8 h-8 text-secondary border-gray-200 hover:text-secondary hover:bg-gray-100 hover:border-gray-100 dark:text-white dark:hover:text-white dark:hover:bg-third-dark/60"
                >
                  {page + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                onClick={() => setCurrentPage(currentPage + 1)}
                className={`${isLastPage ? "pointer-events-none opacity-50" : ""}`}
              />
            </PaginationItem>
          </PaginationContent>
        </UiPagination>
      </footer>
    )
  }
)

export default Pagination
