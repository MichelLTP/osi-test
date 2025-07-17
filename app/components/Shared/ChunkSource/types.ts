export type SourceType = {
  title: string
  images: string[]
  author: string
  date: string
  ref: number
  pages: string
  content: string
  section: string
  subsection: string
  subsubsection: string
}

export type FetcherData = {
  sourceImagesResponse?: SourceType["images"]
}

export type SourceImageProps = {
  fullscreen?: boolean
}
