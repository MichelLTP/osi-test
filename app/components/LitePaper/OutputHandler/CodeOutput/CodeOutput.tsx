import React from "react"
import CodeSnippet from "@/components/ui/CodeSnippet/CodeSnippet"
import { OutputSectionResponse } from "@/components/LitePaper/Output/types"

const CodeOutput = ({ content }: { content: OutputSectionResponse }) => {
  return (
    <CodeSnippet
      codeString={
        typeof content?.value === "string"
          ? content.value
          : (content?.value?.dark ?? "")
      }
      variant={"litepaper"}
    />
  )
}

export default CodeOutput
