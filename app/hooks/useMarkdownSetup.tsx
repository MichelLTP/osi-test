import { FadeInSlotProps } from "@/components/Shared/StreamingResponse/type"

/**
 * Sets up markdown components based on history mode
 * @param isHistory Whether the component is rendering in history mode
 * @returns Record of components for ReactMarkdown
 */
const FadeInSlot: React.FC<FadeInSlotProps> = ({ children, node }) => {
  const Node = node?.tagName.toLowerCase() ?? Slot
  return <Node className="animated fadeIn ease-in">{children}</Node>
}

const PlainSlot: React.FC<FadeInSlotProps> = ({ children, node }) => {
  const Node = node?.tagName.toLowerCase() ?? Slot
  return <Node>{children}</Node>
}

export const useMarkdownSetup = (
  isHistory: boolean
): Record<string, React.FC<any>> => {
  const htmlTags = ["h1", "h2", "h3", "h4", "h5", "h6", "p", "li"]
  const ComponentType = isHistory ? PlainSlot : FadeInSlot

  return htmlTags.reduce(
    (acc, tag) => ({ ...acc, [tag]: ComponentType }),
    {} as Record<string, React.FC<any>>
  )
}
