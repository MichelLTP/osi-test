import { MarkdownRenderer } from "@/components/Shared/MarkdownRender/MarkdownRender"
import { Button } from "@/components/ui/Button/Button"
import TextArea from "@/components/ui/TextArea/TextArea"
import { faPlay } from "@fortawesome/free-solid-svg-icons"
import { useState } from "react"

export default function SummaryPreview() {
  const initialValue = `
### Winston Classic KS Launch Below Concept Test
#### Introduction

**Purpose of the project:**

to identify the most attractive offer proposition in the Below Winston segment
Data sources: Nielsen, Consumer Research, and internal analysis
Questions answered:
What is the expected performance and trial of Winston Classic Red & Blue?
What other propositions can we launch in the Below W segment to challenge our competitors?

#### One Slide Summary

**Winston Classic launch in April**

* Consumers perceive the product as relevant to their needs and fully accept the price
* Consumers see no significant differences vs core Winston and other brands available on the market
* Building SOM may be slower than expected at the beginning of the product life cycle
* Communication in POS should focus mainly on underlying lower price and stronger smoking experience
* The cannibalization is on an acceptable level
* Taking into account the current market situation it is a good first step to enter the Below Winston segment

#### What's Next
`

  const [summary, setSummary] = useState(initialValue)

  return (
    <div>
      <div className="flex flex-col gap-16">
        <p>
          Here you will approve the summary that is rendered when a user
          previews your document in Search Si. You can start by generating an
          automated summary using the LLM or write your own, or perhaps combine
          the two. Your summary will be rendered in markdown and you can preview
          it on the right of the summary input area.
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
            Step 1 - Provide an Extensive Summary
          </p>
          <TextArea
            id="summary"
            name="summary"
            rows="31"
            className="rounded-xs bg-third dark:bg-secondary-dark dark:text-white"
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-8">
          <p className="text-base border-solid border-b border-secondary dark:border-third-dark pt-3 pb-3 justify-left">
            Step 2 - Preview in markdown
          </p>
          <MarkdownRenderer value={summary} />
        </div>
      </div>
    </div>
  )
}
