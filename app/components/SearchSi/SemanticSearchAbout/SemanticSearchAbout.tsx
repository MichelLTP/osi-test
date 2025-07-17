import React, { useEffect } from "react"
import { SearchSiResultProps } from "../type"

const SemanticSearchAbout: React.FC<SearchSiResultProps> = ({
  scoreRender,
  response,
  setClipboardText,
}) => {
  const { score, doc_id, metadata } = response
  const { filtered_metadata } = metadata

  const infoGroups = [
    {
      items: [
        {
          label: "Publication Date:",
          value: filtered_metadata.publication_date.split("T")[0],
        },
        { label: "Entity Name:", value: filtered_metadata.entity_name },
        { label: "Publisher name:", value: filtered_metadata.publisher_name },
        { label: "Document title:", value: filtered_metadata.document_title },
        { label: "Short desc:", value: filtered_metadata.short_desc },
        { label: "Document type:", value: filtered_metadata.document_type },
        { label: "Regions:", value: filtered_metadata.regions.join(", ") },
        {
          label: "Knowledge area:",
          value: filtered_metadata.knowledge_area.join(", "),
        },
        {
          label: "Hq or market:",
          value: filtered_metadata.hq_or_market.join(", "),
        },
        { label: "Markets:", value: filtered_metadata.markets.join(", ") },

        {
          label: "Key market:",
          value: filtered_metadata.key_market.join(", "),
        },
        {
          label: "Primary categories:",
          value: filtered_metadata.primary_categories.join(", "),
        },
        {
          label: "Primary brands:",
          value: filtered_metadata.primary_brands.join(", "),
        },
        { label: "Summary id:", value: filtered_metadata.summary_id },

        {
          label: "Top insights id:",
          value: filtered_metadata.top_insights_id,
        },
      ],
    },
  ]

  useEffect(() => {
    if (setClipboardText === undefined) return
    const content = infoGroups[0].items
      .map(({ label, value }) => `${label} ${value}`)
      .join("\n")
    setClipboardText(content)
  }, [setClipboardText])

  return (
    <div className="flex flex-col gap-6">
      {scoreRender && (      <div className="flex flex-row items-center gap-2">
        <p className="text-sm font-bold">
          Score of this document versus your search:
        </p>
        <p className="text-sm">{score}</p>
      </div>)}

      <div className="flex flex-row items-center gap-2">
        <p className="text-sm font-bold">Doc Id:</p>
        <p className="text-sm">{doc_id}</p>
      </div>
      <div
        className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-4 w-full`}
      >
        {" "}
        {infoGroups.map((group, index) => (
          <React.Fragment key={index}>
            {group.items.map(({ label, value }, idx) => (
              <React.Fragment key={idx}>
                <p>
                  <span className="text-sm font-semibold">{label} </span>
                  <span className="text-sm break-words"> {value}</span>
                </p>
              </React.Fragment>
            ))}
          </React.Fragment>
        ))}
      </div>
    </div>
  )
}

export default SemanticSearchAbout
