import { Button } from "@/components/ui/Button/Button"
import { Label } from "@/components/ui/Label/Label"
import TextArea from "@/components/ui/TextArea/TextArea"
import { faPlay } from "@fortawesome/free-solid-svg-icons"
import { ChangeEvent, useState } from "react"

export default function Nodes() {
  const initialValue = `{"phasellus":{"id":1,"consectetur":"Lorem","adipiscing":"Ipsume@example.com","is_active":true},"imperdiet":[{"id":101,"title":"Lorem Ipsum","content":"Lorem ipsum dolor sit amet, consectetur adipiscing elit.","tags":["lorem","ipsum"],"created_at":"2024-07-25T12:45:00Z"}]}`

  const [insights, setInsights] = useState<string>(() =>
    JSON.stringify(JSON.parse(initialValue), null, 2)
  )

  const handleTextChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    try {
      const formattedJson = JSON.stringify(JSON.parse(e.target.value), null, 2)
      setInsights(formattedJson)
    } catch (error) {
      setInsights(e.target.value)
    }
  }

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

      <div className="flex flex-col gap-2 mt-10">
        <Label>JSON content</Label>
        <TextArea
          id="insights"
          name="insights"
          rows="22"
          className="rounded-xs dark:bg-secondary-dark dark:text-white"
          onChange={handleTextChange}
          value={insights}
        />
      </div>
    </div>
  )
}
