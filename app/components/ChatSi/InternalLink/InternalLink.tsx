import { Button } from "@/components/ui/Button/Button"
import { action } from "@/routes/chatSi"
import { useFetcher } from "@remix-run/react"
import { useCallback, useEffect, useState } from "react"
import { InternalLinkProps } from "./types"

export function InternalLink({
  message,
  link,
}: InternalLinkProps): JSX.Element {
  const fetcher = useFetcher<typeof action>()
  const [isExportRequest, setIsExportRequest] = useState<boolean>(false)

  const handleDownload = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsExportRequest(true)
    fetcher.submit(
      { link: link, intent: "download" },
      { method: "post", action: "/chatSi" }
    )
  }

  const triggerDownload = useCallback(() => {
    if (
      fetcher.data &&
      "file" in fetcher.data &&
      "fileType" in fetcher.data &&
      "fileName" in fetcher.data &&
      fetcher.data.file &&
      fetcher.data.fileType &&
      fetcher.data.fileName
    ) {
      const byteCharacters = atob(fetcher.data.file)
      const byteNumbers = Array.from(byteCharacters, (char) =>
        char.charCodeAt(0)
      )
      const byteArray = new Uint8Array(byteNumbers)
      const blob = new Blob([byteArray], { type: fetcher.data.fileType })

      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = fetcher.data.fileName

      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    }
  }, [fetcher.data])

  useEffect(() => {
    if (isExportRequest && fetcher.data) {
      triggerDownload()
      setIsExportRequest(false)
    }
  }, [fetcher.data, isExportRequest, triggerDownload])

  const regex = /\[([^\]]+)]/g // Matches text inside []
  const parts = []
  let lastIndex = 0

  message.replace(regex, (match, text, index) => {
    // Push the text before the match
    if (index > lastIndex) {
      parts.push(message.slice(lastIndex, index))
    }

    // Push the link (without brackets)
    parts.push(
      <Button
        key={`${text}-${index}`}
        variant={"ghost"}
        className="text-blue-500 hover:underline underline-offset-2"
        onClick={(e) => handleDownload(e)}
      >
        {text}
      </Button>
    )

    lastIndex = index + match.length
    return match // Required for `replace` to function correctly
  })

  // Push any remaining text after the last match
  if (lastIndex < message.length) {
    parts.push(message.slice(lastIndex))
  }

  return <p className="flex items-center">{parts}</p>
}
