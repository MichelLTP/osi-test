import { TableData } from "@/components/ui/PlotlyTable/types"
import { PlotlyProps } from "@/components/ui/PlotlyWrapper/PlotlyWrapper"

export type AggForm = {
  uuid?: string
  type: string
  meta_analysis?: {
    uuid?: string
    title: string
    prompt: string
  }
  sections: {
    uuid?: string
    title: string
    db_documents?: any[]
    uploaded_documents?: {
      uuid?: string
      filename: string
      content?: string
    }[]
    meta_analysis?: {
      uuid?: string
      title: string
      prompt: string
    }
    subsections: {
      uuid?: string
      title: string
      prompt: string
      docs_in_subsection: any[]
      meta_analysis?: {
        uuid?: string
        title: string
        prompt: string
      }
    }[]
  }[]
}

export type AggregatedSources = {
  id: string
  title: string
  selected: boolean
  overallMetaAnalysis?: Document
  sections: AggregatedSection[]
}

export type AggregatedSection = {
  id: string
  title: string
  metaAnalysis?: Document
  subsections: AggregatedSubsection[]
}

export type AggregatedSubsection = {
  id: string
  title: string
  metaAnalysis?: Document
  documents: Document[]
  nonDocuments: nonDocument[]
  value?: string
  tableData?: string
  chartData?: string
  completed?: boolean
}

export type nonDocument = {
  id?: string
  value?: string
  type: string
  completed?: boolean
  tableData?: { type: string; body: string }
  chartData?: { body: string }
  codeData?: { body: string }
}

export type Document = {
  id?: number | string
  docId?: string
  title: string
  type: string
  value?: string
  tableData?: TableData
  chartData?: PlotlyProps
  completed?: boolean
  uuid?: string
}

export type DocAnswer = {
  id: string
  docId?: string
  title: string
  type: string
  value?: string
  tableData?: TableData
  chartData?: PlotlyProps
  completed?: boolean
}
