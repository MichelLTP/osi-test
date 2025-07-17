import {
  SectionObj,
  SectionTypes,
  SectionSubtypes,
} from "@/components/LitePaper/types"

export type SectionInputProps = {
  section: SectionObj
  type: SectionTypes
  subtype?: SectionSubtypes
  setExpandedSections: (values: string[]) => void
  expandedSections: string[]
  inputsUuid?: string
}
