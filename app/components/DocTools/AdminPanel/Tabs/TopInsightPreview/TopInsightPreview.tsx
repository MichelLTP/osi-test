import { MarkdownRenderer } from "@/components/Shared/MarkdownRender/MarkdownRender"
import { Button } from "@/components/ui/Button/Button"
import TextArea from "@/components/ui/TextArea/TextArea"
import { faPlay } from "@fortawesome/free-solid-svg-icons"
import { useState } from "react"

export default function TopInsightPreview() {
  const initialValue = `
### Winston Classic KS Launch Below Concept Test
#### Top Key Insights

* Top Insight 1
* Top Insight 2
* Top Insight 3
`

  const [insights, setInsights] = useState(initialValue)

  return (
    <div>
      <div className="flex flex-col gap-16">
        <p>
          In this section you will provide the top insights that will be
          rendered when a user finds your document in Search Si.
        </p>
        <div className="flex justify-end">
          <Button
            className="mt-5 px-6"
            variant="outline"
            icon={faPlay}
            type="submit"
          >
            Run auto summarization
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-10">
        <div className="flex flex-col gap-8">
          <p className="text-base border-solid border-b border-secondary dark:border-third-dark pt-3 pb-3 justify-left">
            Step 1 - Provide the top key insights{" "}
          </p>
          <TextArea
            id="insights"
            name="insights"
            rows="31"
            className="rounded-xs dark:bg-secondary-dark dark:text-white bg-third"
            value={insights}
            onChange={(e) => setInsights(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-8">
          <p className="text-base border-solid border-b border-secondary dark:border-third-dark pt-3 pb-3 justify-left">
            Step 2 - Preview in markdown{" "}
          </p>
          <MarkdownRenderer value={insights} />
        </div>
      </div>
    </div>
  )
}
