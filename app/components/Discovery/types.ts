import { Image } from "@/store/AdminPanel/discovery"

export interface FeaturedCardProps {
  title: string
  description: string
  tags: string[]
  image: string
  id: string
  color: string
  views: number
  duration_min: number
  has_podcast: boolean
}

export type ContentBlockProps = {
  title?: string
  text: string
  image_url?: string
  imageAlt?: string
  image_pos?: "default" | "BOTTOM" | "TOP" | "LEFT" | "RIGHT"
  id?: string
  [key: string]: any
}

export type StoryCardProps = {
  image?: Image
  title?: string
  description?: string
  duration_min?: number
  tags?: string[]
  color?: string
  id?: string
  is_favorite?: boolean
  views?: number
  has_podcast?: boolean
}

export type DiscoverMoreProps = {
  image_url: string
  description: string
  title: string
  views: number
  uuid: string
  index: number
}

export type ToC = {
  text: string
  id: string
  current?: boolean
}

export interface Document {
  title: string
  matching_filename: string
  document_name: string
}

export type StoriesProps = {
  stories: Story[]
  env: string
}

type Story = {
  title: string
  description: string
  image?: string
  tags: string[]
  slug: string
  color?: string
  isRecommended?: boolean
}

export interface CarouselStoryCardsVerticalProps {
  storiesLength: number
  stories: StoryCardProps[]
}
