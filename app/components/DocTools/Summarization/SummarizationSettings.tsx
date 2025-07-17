import { Label } from "@/components/ui/Label/Label"
import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/RadioGroup/RadioGroup"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select/Select"
import TextArea from "@/components/ui/TextArea/TextArea"
import { SummarizationSettingsProps } from "./types"
import { clsx } from "clsx"

const SummarizationSettings: React.FC<SummarizationSettingsProps> = ({
  settings,
  onSettingsChange,
  isGreyPaper = false,
}) => {
  const languages = [
    { value: "English", label: "English" },
    { value: "French", label: "French" },
    { value: "Spanish", label: "Spanish" },
  ]

  const summaryValues = ["Auto summary", "Custom subsections"]

  const handleSummaryChange = (value: string) => {
    onSettingsChange({ ...settings, selectedSummary: value })
  }

  return (
    <div>
      <div
        className={clsx(
          "w-full grid grid-cols-2",
          isGreyPaper ? "!grid-cols-1 lg:!grid-cols-2 gap-4 pt-0" : "gap-8 pt-8"
        )}
      >
        {!isGreyPaper && (
          <div className="space-y-4">
            <Label>Writting Style</Label>
            <TextArea
              id="description"
              name="description"
              placeholder="Write in a free-flow manner without being too verbose"
              className="rounded-xs dark:bg-secondary-dark dark:text-white h-[150px] styled-scrollbar w-full"
              rows={6}
              value={settings.writing_style}
              onChange={(e) =>
                onSettingsChange({ ...settings, writing_style: e.target.value })
              }
            />
          </div>
        )}
        <div className="space-y-14">
          <div className="space-y-4">
            <p className={clsx("text-sm mb-[5px]", isGreyPaper && "mb-2.5")}>
              Select response language
            </p>
            <Select
              value={settings.lang}
              onValueChange={(value) =>
                onSettingsChange({ ...settings, lang: value })
              }
            >
              <SelectTrigger
                className={clsx(
                  "dark:bg-secondary-dark dark:text-white input-focus",
                  isGreyPaper && "bg-white dark:bg-[#484954] rounded-xs"
                )}
              >
                <SelectValue placeholder="Language" />
              </SelectTrigger>
              <SelectContent
                className={clsx(
                  "rounded-xs shadow-md bg-third dark:bg-secondary-dark dark:text-white input-focus border border-transparent",
                  isGreyPaper && "bg-white dark:bg-[#484954]"
                )}
              >
                {languages.map((language) => (
                  <SelectItem
                    key={language.value}
                    className="rounded-xs hover:bg-primary"
                    value={language.value}
                  >
                    {language.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-y-5">
            <p className="text-sm">Select summary</p>
            <RadioGroup
              className={clsx(
                "flex grow gap-6",
                isGreyPaper && "flex-col mt-2.5 gap-2"
              )}
              value={
                Array.isArray(settings.selectedSummary)
                  ? "Custom subsections"
                  : settings.selectedSummary
              }
              onValueChange={handleSummaryChange}
            >
              {summaryValues.map((summary, index) => (
                <div className="flex items-center space-x-3" key={index}>
                  <RadioGroupItem
                    className="border-gray-200 bg-third dark:border-gray-500"
                    value={summary}
                    id={summary}
                  />
                  <Label
                    className="!leading-normal font-normal"
                    htmlFor={summary}
                  >
                    {summary}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SummarizationSettings
