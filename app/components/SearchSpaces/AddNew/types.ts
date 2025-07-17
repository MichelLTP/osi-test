export interface AddNewProps {
  isLoading: boolean
  url?: string
  type?: "space" | "document"
  onClick?: () => void
  action?: "create" | "add"
}
