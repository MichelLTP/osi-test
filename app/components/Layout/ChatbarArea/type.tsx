import { IconDefinition } from "@fortawesome/free-solid-svg-icons"
import { SearchOption } from "@/components/Shared/SearchType/types"

export interface IChatBar {
  variant?: "default" | "with_filters" | "with_tools" | "omm" | "agentcy"
  disabled?: boolean
  position?: string
  selectedRouter?: {
    title: string
    icon: string
  }
  handlerClickFilters?: () => void
  handerClickRouters?: () => void
  handlePromptSubmit?: (prompt: string, docId?: string) => void
  placeholder?: string
  preDefinedPrompt?: string
  hasFilters?: boolean
  hasRouters?: boolean
  hasOptions?: boolean
  hasInfo?: boolean
  hasSearchType?: boolean
  direction?: "row" | "column"
  isResponseRendered?: boolean
  isDocumentRouter?: boolean
  selectedOption?: SearchOption | null
  onOptionSelect?: (option: SearchOption) => void
}

export interface IRouterCategoryProps {
  item: IRouteCategory
  isExpanded: boolean
  onToggle: () => void
  onRouterClick: (item: IRouteItem) => void
}

export interface IRouteFiltersDropdown {
  onClickFilters: () => void
}

export interface IRouteCategory {
  category: string
  options: IRouteItem[]
}

export interface IRouteItem {
  icon: IconDefinition | string
  title: string
  description: string
  id?: string
  slug?: string
  disabled?: boolean
}

export interface IRouteFiltersItem extends IRouteItem {
  onClick: () => void
}

export interface HandleButtonClickProps {
  e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  promptType: string
}
