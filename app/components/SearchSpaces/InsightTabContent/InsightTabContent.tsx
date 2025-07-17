import { MarkdownRenderer } from "@/components/Shared/MarkdownRender/MarkdownRender"
import CopyToClipboard from "@/components/Shared/CopyToClipboard/CopyToClipboard"
import SocialButtons from "@/components/Layout/SocialButtons/SocialButtons"
import { Skeleton } from "@/components/ui/Skeleton/Skeleton"
import { InsightTabContentProps } from "@/components/SearchSpaces/InsightTabContent/types"

export default function InsightTabContent({
  result,
  uuid,
  contentToBeCopied,
  handleFeedbackChange,
}: InsightTabContentProps) {
  return result && result.content ? (
    <>
      <section id={contentToBeCopied}>
        <MarkdownRenderer value={result?.content?.[0]} />
      </section>
      <footer className={"flex items-end mt-8 flex-wrap justify-end w-full"}>
        <SocialButtons
          onFeedbackChange={handleFeedbackChange}
          response={result}
          responseIds={[{ name: "sectionId", value: uuid }]}
        />
        <CopyToClipboard />
      </footer>
    </>
  ) : (
    <section className={"flex flex-col gap-4"}>
      <Skeleton className="h-8 w-full" />
      <Skeleton className="h-8 w-full" />
      <Skeleton className="h-8 w-full" />
      <Skeleton className="h-20 w-full" />
    </section>
  )
}
