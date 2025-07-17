import { Button } from "@/components/ui/Button/Button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select/Select"
import { faMinus, faPlus } from "@fortawesome/free-solid-svg-icons"
import { useOutputParsersStore } from "@/store/outputParsers"
import { Input } from "@/components/ui/Input/Input"

export default function InputFields({ fieldTypes }: any) {
  const { fields, addField, removeField, setFieldValue } =
    useOutputParsersStore()

  return (
    <div>
      {fields.map((field, index) => (
        <div
          key={index}
          id="step-three-fields"
          className="flex gap-5 flex-wrap pt-8"
        >
          <div className="flex flex-col gap-1 min-w-[266px] sm:grow lg:grow-0">
            <label htmlFor="occupation">Field Name {index + 1}</label>
            <Input
              className="flex items-center bg-third pl-5 rounded-xs dark:bg-secondary-dark dark:text-white outline-none text-secondary"
              type="text"
              name="Occupation"
              placeholder="Occupation"
              value={field.name.value || ""}
              onChange={(e) => setFieldValue(index, "name", e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1 min-w-[266px] sm:grow-[2] lg:grow-0">
            <label htmlFor="occupation">Field Type {index + 1}</label>
            <Select
              defaultValue="str"
              value={field.type.value || "str"}
              onValueChange={(value) => setFieldValue(index, "type", value)}
            >
              <SelectTrigger className="flex items-center justify-between bg-third h-[45px] pl-5 rounded-xs dark:bg-secondary-dark dark:text-white outline-none">
                <SelectValue
                  className="text-red-400 border-2 border-red-500 p-2"
                  placeholder="str"
                />
              </SelectTrigger>
              <SelectContent className="rounded-sm bg-third border text-popover-foreground shadow-md dark:bg-secondary-dark">
                {fieldTypes.map((option: string) => (
                  <SelectItem
                    className="hover:bg-primary hover:text-white transition rounded-sm dark:text-white"
                    key={option}
                    value={option}
                  >
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1 grow">
            <label htmlFor="occupation">Field description {index + 1}</label>
            <textarea
              className="flex items-center min-w-[300px] bg-third h-[45px] min-h-[45px] max-h-[200px] pl-5 pt-[12px] rounded-xs dark:bg-secondary-dark dark:text-white outline-none text-secondary"
              name="Occupation"
              rows={5}
              placeholder="What does the interviewee do for a living?"
              value={field.description.value || ""}
              onChange={(e) =>
                setFieldValue(index, "description", e.target.value)
              }
            />
          </div>
        </div>
      ))}

      <div className="flex justify-end gap-5">
        {fields.length > 1 && (
          <Button
            onClick={() => removeField(fields.length - 1)}
            className="mt-5 w-full sm:w-auto text-error dark:text-error dark:hover:text-error hover:text-error hover:underline"
            variant="ghost"
            icon={faMinus}
          >
            Remove field
          </Button>
        )}
        <Button
          onClick={addField}
          className="mt-5 w-full sm:w-auto text-primary dark:text-primary dark:hover:text-primary hover:underline"
          variant="ghost"
          icon={faPlus}
        >
          Add field
        </Button>
      </div>
    </div>
  )
}
