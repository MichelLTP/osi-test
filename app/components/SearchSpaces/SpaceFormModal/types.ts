import { Document } from "@/components/LitePaper/types"
import { FilterData } from "@/components/Shared/Filters/types"
import { IconDefinition } from "@fortawesome/free-solid-svg-icons"
import { DocumentOption } from "@/components/ui/MultipleSelectorV2/types"

export interface SpaceFormProps {
  loaderDBFiles: Document[]
  filters: FilterData
  spaceData?: any
  cancelNavigation: string
}

export interface SpaceFormData {
  title: string
  setTitle: (v: string) => void
  description: string
  setDescription: (v: string) => void
  writingStyle: string
  setWritingStyle: (v: string) => void
  filteredDBFiles: Document[]
  selectedDBFiles: Document[]
  handleFileUpload: (files: DocumentOption[]) => void
  handleCancelUpload: (file: Document) => void
  updatedFilterData: FilterData
  closeModal: () => void
  resetForm: () => void
}

export type SpaceFormModalProps = {
  form: SpaceFormData
  isSubmitting: boolean
  isButtonDisabled: boolean
  actionText: string
  actionIcon: IconDefinition
  title?: string
  action: "edit" | "create"
}
