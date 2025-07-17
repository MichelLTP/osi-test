import { Button } from "@/components/ui/Button/Button"
import { Label } from "@/components/ui/Label/Label"
import TextArea from "@/components/ui/TextArea/TextArea"
import { faCopy, faEdit } from "@fortawesome/free-regular-svg-icons"
import { DocAnswer, nonDocument } from "./types"
import PlotlyWrapper from "@/components/ui/PlotlyWrapper/PlotlyWrapper"
import { faCheck } from "@fortawesome/free-solid-svg-icons"
import { useEffect, useState } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faSpinner } from "@fortawesome/free-solid-svg-icons"
import CodeSnippet from "@/components/ui/CodeSnippet/CodeSnippet"
import DynamicDataTable from "@/components/ui/DynamicDataTable/DynamicDataTable"
import { MarkdownRenderer } from "@/components/Shared/MarkdownRender/MarkdownRender"

export default function DocumentComponent({
  doc,
  docIndex,
  variant,
}: {
  doc: DocAnswer | nonDocument | undefined
  docIndex: number
  variant?: string
}) {
  const { updateDocumentValue } = useOpenStoryResult()

  const [isEditing, setIsEditing] = useState(false)
  const [docValue, setDocValue] = useState<string>(doc?.value || "")
  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDocValue(e.target.value)
  }

  const handleSave = () => {
    if (doc) {
      updateDocumentValue(doc.id, docValue, true)
    }
    setIsEditing(false)
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(docValue)
  }

  // Need this to be able to re-render this component when the Socket changes the value
  useEffect(() => {
    if (doc?.value) {
      setDocValue(doc?.value)
    }
  }, [doc?.value])

  useEffect(() => {
    if (doc?.completed) {
      setLoading(false)
    } else {
      setLoading(true)
    }
  }, [doc?.completed])

  return (
    <>
      {doc?.type === "text" ? (
        <>
          <div
            className={`${
              (variant === "metaSection" ||
                variant === "metaData" ||
                variant === "non-doc") &&
              "mt-5"
            } space-y-2`}
          >
            {(variant === "metaSection" || variant === "metaData") && (
              <Label
                className={`${"text-primary font-semibold"} ${
                  variant === "metaSection" && "text-xl"
                }`}
              >
                {doc.title}
              </Label>
            )}
            {isEditing ? (
              <TextArea
                placeholder={doc.value}
                rows="6"
                value={docValue}
                className="dark:text-secondary"
                onChange={handleChange}
              />
            ) : (
              <div className="flex items-center">
                {loading ? (
                  <>
                    <p className="outline-none focus-within:outline-none focus:outline-non block w-full p-4 focus:ring-0 border transition-all rounded-sm focus-within:border-opacity-15 focus-within:border border-transparent focus-within:border-primary dark:text-white">
                      <span className="flex items-center">
                        <FontAwesomeIcon
                          icon={faSpinner}
                          spinPulse
                          className="text-primary mr-2"
                        />
                        {docValue}
                      </span>
                    </p>
                  </>
                ) : (
                  <div className="outline-none focus-within:outline-none focus:outline-none block w-full p-4 focus:ring-0 border transition-all rounded-sm focus-within:border-opacity-15 focus-within:border border-transparent focus-within:border-primary dark:text-white">
                    <div>
                      <MarkdownRenderer value={docValue} />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          {doc.completed && (
            <div className="flex items-center justify-end gap-4">
              {isEditing ? (
                <Button
                  variant="ghost"
                  icon={faCheck}
                  className="hover:text-success dark:hover:text-success"
                  onClick={handleSave}
                >
                  Save
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  icon={faEdit}
                  className="dark:text-white"
                  onClick={() => setIsEditing(true)}
                >
                  Edit
                </Button>
              )}
              <Button
                variant="ghost"
                icon={faCopy}
                className="dark:text-white"
                onClick={handleCopy}
              >
                Copy
              </Button>
            </div>
          )}
        </>
      ) : doc?.type === "chart" && doc.chartData?.body ? (
        <>
          <PlotlyWrapper
            index={docIndex}
            content={JSON.parse(doc.chartData.body)}
          />
        </>
      ) : doc?.type === "table" && doc.tableData ? (
        <>
          <DynamicDataTable tableData={doc.tableData} />
        </>
      ) : doc?.type === "code" ? ( // needs to be replace by the code component
        <div className="code-response my-2">
          <CodeSnippet
            codeString={doc?.value?.dark || doc?.value}
            variant={"openstory"}
          />
        </div>
      ) : null}
    </>
  )
}
