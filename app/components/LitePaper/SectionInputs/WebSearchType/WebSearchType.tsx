import TextArea from "@/components/ui/TextArea/TextArea"
import { SectionObj } from "@/components/LitePaper/types"
import clsx from "clsx"
import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/RadioGroup/RadioGroup"
import { Label } from "@/components/ui/Label/Label"
import { Columns2, Rows2 } from "lucide-react"
import { useLitePaper } from "@/store/litepaper"

const WebSearchType = ({
  section,
  inputsUuid = "",
}: {
  section: SectionObj
  inputsUuid: string
}) => {
  const litePaper = useLitePaper()
  const defaultOptions = [
    { label: "Columns", DisplayIcon: Columns2 },
    { label: "Single block", DisplayIcon: Rows2 },
  ]

  const handleDisplayChange = (value: string) => {
    litePaper.updateSectionOrSubsectionField(
      section.uuid,
      { layout_metadata: { ...section.layout_metadata, displayMode: value } },
      inputsUuid
    )
  }

  return (
    <div
      className={clsx(
        "col-span-full",
        inputsUuid !== "" && "grid grid-cols-1 md:grid-cols-2 gap-4 w-full"
      )}
    >
      <fieldset className="col-span-1">
        <label
          className={"text-base"}
          htmlFor={`section-${section?.layout_metadata.displayId}-chatgpt-prompt`}
        >
          Prompt
        </label>
        <TextArea
          id={`section-${section?.layout_metadata.displayId}-chatgpt-prompt`}
          name={`section-${section?.layout_metadata.displayId}-chatgpt-prompt`}
          rows={inputsUuid !== "" ? "5" : "2"}
          placeholder="What would you like to know?"
          className="mt-3 rounded-xs bg-third dark:bg-[#484954] dark:text-white w-full border-0"
          value={"prompt" in (section || {}) ? section.prompt : ""}
          onChange={(e) => {
            litePaper.updateSectionOrSubsectionField(
              section.uuid,
              { prompt: e.target.value },
              inputsUuid !== "" ? inputsUuid : undefined
            )
          }}
        />
      </fieldset>
      {inputsUuid !== "" && (
        <fieldset className={"col-span-1 ml-2"}>
          <label
            className={"text-basebold mt-3"}
            htmlFor={`section-${section?.layout_metadata.displayId}-structured-radio`}
          >
            Display mode
          </label>
          <RadioGroup
            className="flex gap-4 md:gap-3 lg:gap-4 mt-3"
            defaultValue={section.layout_metadata.displayMode}
            onValueChange={handleDisplayChange}
          >
            {defaultOptions.map(({ label, DisplayIcon }, index) => (
              <div className="flex items-center gap-3" key={index}>
                <RadioGroupItem
                  className="border-gray-200 bg-third dark:border-gray-500"
                  value={label}
                  id={label}
                />
                <Label className="text-[12px]" htmlFor={label}>
                  {label}
                </Label>
                <DisplayIcon size={14} strokeWidth={1} />
              </div>
            ))}
          </RadioGroup>
        </fieldset>
      )}
    </div>
  )
}
export default WebSearchType
