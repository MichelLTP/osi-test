import DatePicker from "@/components/ui/DatePicker/DatePicker"
import { Input } from "@/components/ui/Input/Input"
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

const inputsArray = [
  { id: 1, label: "Publication date", placeholder: "2024/07/03", type: "date" },
  {
    id: 2,
    label: "Document title",
    placeholder: "Document title",
    type: "text",
  },
  {
    id: 3,
    label: "Short description",
    placeholder: "Short description",
    type: "text",
  },
  {
    id: 4,
    label: "Publisher name",
    placeholder: "Publisher name",
    type: "text",
  },
  { id: 5, label: "Agency/Entity name", placeholder: "GfK", type: "text" },
  {
    id: 6,
    label: "Knowledge area",
    placeholder: "Knowledge area",
    type: "text",
  },
  {
    id: 7,
    label: "Document type",
    placeholder: "Choose a option",
    type: "select",
  },
  {
    id: 8,
    label: "Primary category",
    placeholder: "Choose a option",
    type: "select",
  },
  {
    id: 9,
    label: "Document type",
    placeholder: "Choose a option",
    type: "select",
  },
  {
    id: 10,
    label: "Primary category",
    placeholder: "Choose a option",
    type: "select",
  },
  {
    id: 11,
    label: "Primary Brand",
    placeholder: "Choose a option",
    type: "select",
  },
  { id: 12, label: "Region", placeholder: "Choose a option", type: "select" },
  { id: 13, label: "Market", placeholder: "Choose a option", type: "select" },
  {
    id: 14,
    label: "Key Market",
    placeholder: "Choose a option",
    type: "select",
  },
  {
    id: 15,
    label: "HQ or Market",
    placeholder: "Choose a option",
    type: "select",
  },
  { id: 16, label: "Region", placeholder: "Choose a option", type: "text" },
]

const selectOptions = ["option 1", "option 2", "option 3"]

const metadataOptions = ["Entities", "Keyboards", "Summary"]

const nodeInputs = ["Node size", "Node overlap"]

export default function MetadataInput() {
  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-8">
        {inputsArray.map((input, index) => (
          <div key={index} className="flex flex-col gap-2">
            <Label>{input.label}</Label>

            {input.type === "text" ? (
              <Input
                className="flex items-center bg-third pl-5 rounded-xs dark:bg-secondary-dark dark:text-white outline-none text-secondary"
                type="text"
                name="Occupation"
                id=""
                placeholder={input.placeholder}
              />
            ) : input.type === "select" ? (
              <Select>
                <SelectTrigger className="flex items-center justify-between bg-third h-[45px] pl-5 rounded-xs dark:bg-secondary-dark dark:text-white outline-none">
                  <SelectValue
                    className="text-red-400 border-2 border-red-500 p-2"
                    placeholder={input.placeholder}
                  />
                </SelectTrigger>
                <SelectContent className="rounded-xs bg-third border text-popover-foreground shadow-md dark:bg-secondary-dark">
                  {selectOptions.map((option, index) => (
                    <SelectItem
                      className="hover:bg-primary hover:text-white transition dark:text-white rounded-xs"
                      key={index}
                      value={option}
                    >
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <DatePicker value={input.placeholder} onChange={() => {}} />
            )}
          </div>
        ))}
      </div>
      <p className="text-base border-solid border-b border-secondary dark:border-third-dark pt-3 pb-3 justify-left mt-12">
        Acronyms
      </p>
      <div className="mt-8">
        <p className="text-sm mb-[5px]">Acronyms</p>
        <TextArea
          id="description"
          name="description"
          className="rounded-xs dark:bg-secondary-dark dark:text-white"
          placeholder="Describe the field"
          rows={1}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start mt-14">
        <div className="flex flex-col gap-5">
          <p className="text-sm font-bold">Node metadata options</p>
          <RadioGroup
            className="flex gap-16 md:gap-10 lg:gap-16"
            defaultValue={metadataOptions[0]}
          >
            {metadataOptions.map((option, index) => (
              <div className="flex items-center gap-3" key={index}>
                <RadioGroupItem
                  className="border-gray-200 bg-third dark:border-gray-500"
                  value={option}
                  id={option}
                />
                <Label className="text-[12px]" htmlFor={option}>
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        <div className="flex flex-col gap-5">
          <p className="text-sm font-bold">Node metadata options</p>
          <div className="grid grid-cols-2 gap-8">
            {nodeInputs.map((input, index) => (
              <div key={index} className="grow space-y-2">
                <Label>{input}</Label>
                <Input
                  type="number"
                  name="Occupation"
                  className={
                    "dark:bg-secondary-dark dark:text-white bg-third rounded-xs"
                  }
                  id=""
                  placeholder={"0"}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
