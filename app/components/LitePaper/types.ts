import { IconProp } from "@fortawesome/fontawesome-svg-core"
import { FilterData } from "../Shared/Filters/types"
import { FinalResult } from "./Output/types"

export type Workspace = {
  id?: string
  name: string
  subtitle?: string
  date?: string
  description?: string
  writing_style?: string
  authors?: string
  form?: any
}

export type SectionTypes =
  | "Documents"
  | "Data"
  | "APIs"
  | "Subsections"
  | "Custom Text"
  | "Aggregation"
// | "Picture"

export type SectionDocSubtypes = "Chat SI"
// | "Summary"
// | "Aggregator"
// | "Output Parsers"
// | "Docs"
export type SectionDataSubtypes = "OMM" | "RADRS" | "Incidence" | "Tracker"

export type SectionAPISubtypes = "ChatGPT" | "Web Search" | "Wikipedia"

export type SectionSubtypes =
  | SectionDocSubtypes
  | SectionDataSubtypes
  | SectionAPISubtypes

export type ConfirmationModalProps = {
  open: boolean
  action: string | null
  title: string | undefined
  type?: string | null
  parentUuid?: string
  uuid?: string
  description?: string
}

export type WorkspaceCardProps = {
  cardICon: IconProp
  workspace: Workspace
  handleDelete: (workspaceId: string) => void
}

// New version --------------------------------------

export interface Document {
  id: string
  filename: string
  custom?: string
  isPrivate?: boolean
}

// --------------------
// Section Types
// --------------------

// Define the base
export interface BaseSection {
  uuid: string
  type?: SectionTypes
  subtype?: SectionSubtypes
  layout_metadata: {
    displayId: number
    displayMode?: string
    preview?: FinalResult[]
    previewMode?: boolean
    metadata_options?: FilterData
    metadata_firstOptions?: FilterData
  }
}

// Custom Text section
export interface CustomTextSection extends BaseSection {
  title?: string
  prompt?: string
}

// Documents section
export interface DocumentsSection extends BaseSection {
  title?: string
  prompt?: string
  private_documents?: Document[]
  opensi_documents?: Document[]
  metadata_filters?: FilterData
  is_pro?: boolean
  is_private_selected?: boolean
  is_opensi_selected?: boolean
}

// ChatGPT section
export interface ChatGPTSection extends BaseSection {
  title?: string
  prompt?: string
}

export interface WebSearchSection extends BaseSection {
  title?: string
  prompt?: string
}

export interface WikipediaSection extends BaseSection {
  title?: string
  prompt?: string
}

// RADRS section
export interface StructuredSection extends BaseSection {
  title?: string
  prompt?: string
}

// Aggregation section
export interface AggregationSection extends BaseSection {
  title?: string // This title does not exist in Agg, but LitePaper needs it
  topics?: AggregationTopic[]
  private_documents?: Document[]
  opensi_documents?: Document[]
  meta_analysis?: AggregationMetaAnalysis
}

export interface AggregationTopic {
  title?: string
  prompt?: string
  meta_analysis?: AggregationMetaAnalysis
}

export interface AggregationMetaAnalysis {
  title?: string
  prompt?: string
}

// Subsections section
export interface SubsectionsSection extends BaseSection {
  title?: string
  prompt?: string
  subsections?: NonSubsectionSectionObj[]
}

// --------------------
// Union Types
// --------------------

// All section types except "Subsections"
export type NonSubsectionSectionObj =
  | CustomTextSection
  | DocumentsSection
  | ChatGPTSection
  | StructuredSection
  | AggregationSection
  | WikipediaSection
  | WebSearchSection

// All possible sections
export type SectionObj =
  | CustomTextSection
  | DocumentsSection
  | ChatGPTSection
  | StructuredSection
  | SubsectionsSection
  | AggregationSection
  | WikipediaSection
  | WebSearchSection

// Extra

export type ValidationError = {
  uuid: string
  displayId: number
  errors: string[]
}
