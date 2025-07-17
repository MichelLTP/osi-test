import TextArea from "@/components/ui/TextArea/TextArea"
import { faDownload } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { useState } from "react"

export default function DocumentPreview() {
  const initialValue = `OpenStory empowers you to uncover and share your company's hidden narratives with ease. Simply provide a prompt, and watch as it weaves insights from your documents and databases into engaging stories that keep your team informed and aligned.`

  const [docPreview, setDocPreview] = useState(initialValue)

  return (
    <div className="mt-10">
      <p className="text-sm mb-[5px]">File Context</p>
      <TextArea
        id="docPreview"
        name="docPreview"
        rows="10"
        className="rounded-xs dark:bg-secondary-dark dark:text-white"
        value={docPreview}
        onChange={(e) => setDocPreview(e.target.value)}
      />
      <div className="flex justify-end ">
        <div className="space-x-2 mt-5 text-primary hover:border-b border-primary cursor-pointer">
          <FontAwesomeIcon icon={faDownload} />
          <span>Download</span>
        </div>
      </div>
    </div>
  )
}
