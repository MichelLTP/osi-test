import { SectionSubtypes, SectionTypes } from "@/components/LitePaper/types"

export type TypeDropdownProps = {
  value: SectionTypes | SectionSubtypes
  onChange: ((value: SectionTypes) => void) | ((value: SectionSubtypes) => void)
  options: SectionTypes[] | SectionSubtypes[]
  placeholder: string
  id: string
  label?: string
  classname?: string
}
