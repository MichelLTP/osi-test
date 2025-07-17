export interface ITextArea {
  rows?: string
  cols?: string
  placeholder?: string
  className?: string
  name?: string
  id?: string
  onChange?: (value: string) => void
  value?: string
}
