import { IconDefinition } from "@fortawesome/free-solid-svg-icons"

export interface ExampleQuestionsProps {
  questions: QuestionProps[]
  handlePromptSubmit?: (prompt: string, routerID?: string) => void
  hasRefresh?: boolean
  hasLineClamp?: boolean
  hasLimit?: boolean
  className?: string
}

export interface QuestionProps {
  prompt: string
  router?: string
}

export interface QuestionWithRouter extends QuestionProps {
  routerItem: {
    icon: IconDefinition
    router: string
  }
}
