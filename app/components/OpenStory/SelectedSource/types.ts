import { Section, MetaAnalysis } from "../SectionComponent/types"

export type Source = {
  id: number
  title: string
  description: string
  selected: boolean
  sections: Section[]
  overallMetaAnalysis?: MetaAnalysis
}
