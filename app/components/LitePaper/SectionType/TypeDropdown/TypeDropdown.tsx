import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select/Select"
import { TypeDropdownProps } from "@/components/LitePaper/SectionType/TypeDropdown/types"

const TypeDropdown = ({
  label,
  value,
  onChange,
  options,
  placeholder,
  id,
  classname = "",
}: TypeDropdownProps) => {
  return (
    <>
      <label className={classname} htmlFor={id}>
        {label}
      </label>
      <Select value={value} name={id} onValueChange={onChange}>
        <SelectTrigger className="bg-third dark:bg-[#484954] dark:text-white rounded-xs input-focus h-[45px] mt-2 text-sm">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className="rounded-xs shadow-md bg-white dark:bg-[#484954] dark:text-white input-focus border border-transparent">
          {options.map((option) => (
            <SelectItem
              key={option}
              value={option}
              className="rounded-xs hover:bg-primary"
            >
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </>
  )
}

export default TypeDropdown
