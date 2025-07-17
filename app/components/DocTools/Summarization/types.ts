import { FileUploadState } from "@/components/Shared/UploadFile/types"

export interface ISummarizationSettings {
  lang: string
  selectedSummary: string | CustomSubsection[]
  writing_style: string
}

export interface SummarizationSettingsProps {
  settings: ISummarizationSettings
  onSettingsChange: (newSettings: ISummarizationSettings) => void
  isGreyPaper?: boolean
}

export interface CustomSubsection {
  name: string
  description: string
}

export interface CustomSubsectionsProps {
  subsections: CustomSubsection[]
  onSubsectionsChange: (subsections: CustomSubsection[]) => void
}

export interface SummarizationLoaderProps {
  summarizationResult: SummarizationResultProps
}

export interface SummarizationResultProps {
  status: string
  response: SummarizationResponseProps
  jobID: string
  feedback?: string
}

export interface SubsectionProps {
  subsection_name: string
  subsection_description: string
  summary: string
}

export interface SummarizationResponseProps {
  doc_name: string
  subsections: SubsectionProps[]
  meta_summary: string
  top_insights: string
  duration: number
  jobID: string
  feedback?: string
}

export interface OutletContextType {
  setUploadState: (state: FileUploadState) => void
}
