export interface AccordionItem {
  title: string
  description?: string
  content: string
}

export interface CopyOptions {
  includeDescription?: boolean
  titleTag?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6"
  renderMarkdown?: boolean
}

export interface SourcesItem {
  title: string
  author: string
  date: string
  section: string
  pages: string
  content: string
  images: string[]
  ref: number
}
