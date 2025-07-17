import { Subsection } from "../SubsectionComponent/types"
import { Document } from "../Response/types"

export type Section = {
  id: number
  title: string
  userTitle?: string
  subsections: Subsection[]
  db_documents: DBDocument[]
  uploaded_documents: Document[]
  sectionMetaAnalysis?: MetaAnalysis
}

export type DBDocument = {
  id?: number
  title: string
}

export type MetaAnalysis = {
  title: string
  prompt: string
}
