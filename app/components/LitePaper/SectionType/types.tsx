import { SectionTypes, SectionObj } from "@/components/LitePaper/types"

export type SectionTypeProps = {
  section: SectionObj
  isSubsection?: boolean
  changeType?: (uuid: string, type: SectionTypes) => void
  setExpandedSections: (values: string[]) => void
  expandedSections: string[]
  inputsUuid?: string
}
