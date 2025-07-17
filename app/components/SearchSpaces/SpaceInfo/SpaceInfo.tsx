import { useCloseSidebar } from "@/store/layout"
import React from "react"
import { MetaDataDocs } from "@/data/searchspaces/types"

const SpaceInfo = ({ data, image }: { data: MetaDataDocs; image: string }) => {
  const isSidebarClosed = useCloseSidebar((state) => state.close)
  const { doc_metadata } = data
  const infoGroups = [
    {
      items: [
        {
          label: "Publication date:",
          value: doc_metadata.publication_date.split("T")[0],
        },
        {
          label: "Publisher name:",
          value: doc_metadata.publisher_name,
        },
        { label: "Short desc:", value: doc_metadata.short_desc },
        { label: "Regions:", value: doc_metadata.regions?.join(", ") || "-" },
        {
          label: "Research type:",
          value: doc_metadata.research_type?.join(", ") || "-",
        },
        {
          label: "Document type:",
          value: doc_metadata.document_type?.join(", ") || "-",
        },
        {
          label: "Document topic:",
          value: doc_metadata.document_topic?.join(", ") || "-",
        },
        {
          label: "Document group:",
          value: doc_metadata.document_group,
        },
        {
          label: "Knowledge area:",
          value: doc_metadata.knowledge_area?.join(", ") || "-",
        },
        { label: "Markets:", value: doc_metadata.markets?.join(", ") || "-" },

        {
          label: "Key market:",
          value: doc_metadata.key_market,
        },
        {
          label: "Primary categories:",
          value: doc_metadata.primary_categories?.join(", ") || "-",
        },
        {
          label: "Primary brands:",
          value: doc_metadata.primary_brands?.join(", ") || "-",
        },
      ],
    },
  ]

  const renderMetadataColumns = () => {
    if (!doc_metadata) return <div>No metadata available</div>
    const allItems = infoGroups[0].items
    const columnSize = Math.ceil(allItems.length / 3)

    const columns = [
      allItems.slice(0, columnSize),
      allItems.slice(columnSize, columnSize * 2),
      allItems.slice(columnSize * 2),
    ]

    return columns.map((column, colIndex) => (
      <div key={colIndex} className="flex flex-col gap-2">
        {column.map((item, idx) => (
          <section key={idx}>
            <div className="[&:not(:last-child)]:mb-2">
              <strong>{item.label}</strong>
              <span> {item.value || "-"}</span>
            </div>
          </section>
        ))}
      </div>
    ))
  }

  return (
    <main
      className={
        "grid gap-6 " +
        (isSidebarClosed
          ? "sm:grid-cols-2 lg:grid-cols-4"
          : "md:grid-cols-2 xl:grid-cols-4")
      }
    >
      <div className="bg-secondary/20 dark:bg-third/20 h-[302px]">
        <img src={image} className={"object-fit h-full w-full"} alt={"Image"} />
      </div>
      {renderMetadataColumns()}
    </main>
  )
}

export default SpaceInfo
