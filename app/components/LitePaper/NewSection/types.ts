import { SectionObj } from "@/components/LitePaper/types"

export type SectionProps = {
  section: SectionObj
  displayId?: number
  setExpandedSections: (values: string[]) => void
  expandedSections: string[]
  isSubsection?: boolean
  subsectionIndex?: number
  InputsUuid?: string
}
