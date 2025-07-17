import TextArea from "@/components/ui/TextArea/TextArea"
import React, { useEffect, useState } from "react"
import OutputActions from "@/components/LitePaper/OutputActions/OutputActions"
import {
  AggregatorPrompt,
  OutputSectionResponse,
} from "@/components/LitePaper/Output/types"
import { TextOutputProps } from "@/components/LitePaper/OutputHandler/TextOutput/types"
import { useLocation } from "@remix-run/react"
import { MarkdownRenderer } from "@/components/Shared/MarkdownRender/MarkdownRender"

export default function TextOutput({ content, handleSave }: TextOutputProps) {
  const [isEditing, setIsEditing] = useState(false)
  const location = useLocation()
  const showOutputActions =
    location.pathname.includes("litePaper/response") ||
    location.pathname.includes("documentTools/aggService")
  const [docValue, setDocValue] = useState<string>(
    typeof (content as OutputSectionResponse).value === "string"
      ? (content as OutputSectionResponse).value
      : typeof (content as OutputSectionResponse).result === "string"
        ? (content as OutputSectionResponse).result
        : typeof (content as AggregatorPrompt).response === "string"
          ? (content as AggregatorPrompt).response
          : ((content as OutputSectionResponse).value?.light ?? // Fallback to `light` if `value` is an object
            (content as AggregatorPrompt).response ??
            "")
  )

  const handleSaveContent = () => {
    handleSave &&
      handleSave(content as OutputSectionResponse, docValue as string)
    setIsEditing(false)
  }

  useEffect(() => {
    if ("value" in content && typeof content.value === "string") {
      setDocValue(content.value)
    } else if ("response" in content && content.response !== undefined) {
      setDocValue(content.response)
    }
  }, [content])

  return (
    <>
      <section
        className={`rounded-sm my-4 dark:text-white ${
          isEditing
            ? "bg-third dark:bg-secondary-dark min-h-[150px] p-0"
            : "px-6 py-2"
        }`}
      >
        {isEditing ? (
          <TextArea
            placeholder={
              content
                ? (content as OutputSectionResponse).value ||
                  (content as OutputSectionResponse).result
                : ""
            }
            rows="8"
            value={docValue}
            className={
              "my-4 rounded-xs dark:bg-[#484954] dark:text-white bg-third border-0"
            }
            onChange={(e) => setDocValue(e.target.value)}
          />
        ) : (
          <MarkdownRenderer value={docValue} />
        )}
      </section>
      {showOutputActions && (
        <OutputActions
          isEditing={isEditing}
          handleEdit={setIsEditing}
          handleSave={handleSaveContent}
          handleCopy={() => navigator.clipboard.writeText(docValue).then()}
        />
      )}
    </>
  )
}
