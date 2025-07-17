import { Button } from "@/components/ui/Button/Button"
import { ErrorBoundaryComponent } from "@/components/ui/ErrorBoundaryComponent/ErrorBoundaryComponent"
import TextArea from "@/components/ui/TextArea/TextArea"
import { faPaperPlane } from "@fortawesome/free-regular-svg-icons"
import { useState } from "react"

export default function AddRADRS() {
  const initialPrompt = `Calculate the share for Winston in 2022

What was Winston's share in 2022?

Give me Winston's share in 2022

In 2022 what was Winston's share?`

  const initialCodeBlock = `"""
Types of questions this code block can answer:
1.
2.
3.

Assumptions:
Market scope: Not mentioned, use Global scope
Product scope: Not mentioned, use RMC + FCT + HT
"""

# code starts here
import pandas as pd
import numpy as np
Import plotly

df = get_data(…)

…
`

  const initialTag = `Market Share`

  const [prompts, setPrompts] = useState(initialPrompt)
  const [codeBlocks, setCodeBlocks] = useState(initialCodeBlock)
  const [addTaggs, setAddTaggs] = useState(initialTag)

  return (
    <div className="grid xl:grid-cols-4 lg:grid-cols-3 gap-8">
      <div className="mt-10">
        <p className="text-sm mb-[5px]">Prompts</p>
        <TextArea
          id="prompts"
          name="prompts"
          rows="20"
          className="rounded-[8px] dark:text-secondary"
          value={prompts}
          onChange={(e) => setPrompts(e.target.value)}
        />
      </div>
      <div className="mt-10 sm:col-span-1 lg:col-span-2">
        <p className="text-sm mb-[5px]">Prompts</p>
        <TextArea
          id="codeBlocks"
          name="codeBlocks"
          rows="20"
          className="rounded-[8px] dark:text-secondary"
          value={codeBlocks}
          onChange={(e) => setCodeBlocks(e.target.value)}
        />
      </div>
      <div className="mt-10">
        <p className="text-sm mb-[5px]">Add Tags</p>
        <TextArea
          id="addTaggs"
          name="addTaggs"
          rows="10"
          className="rounded-[8px] dark:text-secondary"
          value={addTaggs}
          onChange={(e) => setAddTaggs(e.target.value)}
        />
        <div className="flex justify-end mt-10">
          <Button className="w-32" icon={faPaperPlane} type="submit">
            Submit
          </Button>
        </div>
      </div>
    </div>
  )
}

export function ErrorBoundary() {
  return <ErrorBoundaryComponent isMainRoute={false} />
}
