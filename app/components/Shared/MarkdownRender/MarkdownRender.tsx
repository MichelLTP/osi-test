import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import remarkMath from "remark-math"
import rehypeRaw from "rehype-raw"
import rehypeKatex from "rehype-katex"
import "katex/dist/katex.min.css"
import { TableOverflow } from "@/components/Shared/TableOverflow/TableOverflow"
import { MarkdownRendererProps } from "./types"

export function MarkdownRenderer({
  value,
  className = "prose",
}: MarkdownRendererProps) {
  const remarkMathOptions = {
    singleDollarTextMath: false,
  }
  return (
    <ReactMarkdown
      className={className}
      remarkPlugins={[remarkGfm, [remarkMath, remarkMathOptions]]}
      rehypePlugins={[rehypeRaw, rehypeKatex]}
      remarkRehypeOptions={{ passThrough: ["link"] }}
      components={{
        table: TableOverflow,
      }}
    >
      {value}
    </ReactMarkdown>
  )
}
