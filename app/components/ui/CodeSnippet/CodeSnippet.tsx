import Prism from "prismjs"
import "prismjs/themes/prism-okaidia.css"
import { useEffect, useState } from "react"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/Accordion/Accordion"

const CodeSnippet = ({
  codeString,
  variant,
}: {
  codeString: string
  variant?: "chatsi" | "litepaper" | "omm_assistant"
}) => {
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    Prism.highlightAll()
  }, [codeString])

  const handleCopy = () => {
    navigator.clipboard.writeText(codeString).then(() => setCopied(true))
    setTimeout(() => setCopied(false), 2000)
  }

  const codeComponent = (
    <div className="bg-third dark:bg-secondary-dark mt-2">
      <div className="text-xs flex justify-between items-center h-8 px-3 py-2 bg-neutral-200 dark:bg-slate-700 mb-0 text-neutral-800 dark:text-neutral-100">
        <span>code</span>
        <button onClick={handleCopy}>{copied ? "Copied!" : "Copy code"}</button>
      </div>
      <pre className="mt-0">
        <code
          className={`m-0 language-code !text-gray-800 dark:!text-gray-200 ![text-shadow:_0_0_0_rgb(0_0_0_/_40%)]`}
        >
          {codeString}
        </code>
      </pre>
    </div>
  )

  const title =
    variant === "chatsi"
      ? "What ChatSI did? (technical)"
      : variant === "litepaper"
        ? "What LitePaper did? (technical)"
        : "What OMM Assistant did? (technical)"

  if (
    variant === "chatsi" ||
    variant === "litepaper" ||
    variant === "omm_assistant"
  ) {
    return (
      <Accordion type="single" collapsible>
        <AccordionItem value="item-1">
          <AccordionTrigger className={"text-basebold"}>
            {title}
          </AccordionTrigger>
          <AccordionContent>{codeComponent}</AccordionContent>
        </AccordionItem>
      </Accordion>
    )
  }

  return codeComponent
}

export default CodeSnippet
