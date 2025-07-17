interface Section {
  title: string
  text: string
  image_pos: "RIGHT" | "BOTTOM" | "LEFT" | "TOP"
  image_url: string | null
}

interface Source {
  title: string
  publisher: string
  rating: number
}

interface Image {
  image_pos: "TOP" | "BOTTOM" | "RIGHT" | "LEFT"
  matching_filename?: string
  image_name: string
  id: string
  url?: string
  title?: string
}

interface RelatedStory {
  uuid: string
  title: string
  description: string
  views: number
  duration_min: number
  tags: string[]
  is_favorite: boolean
  image_url: string
  has_podcast: boolean
}

interface AudioFile {
  title: string
  media_url: string
  matching_filename: string
  id?: string
  url?: string
}

interface Documents {
  title: string
  matching_filename: string
  document_name: string
}

interface Discovery {
  uuid: string
  title: string
  description: string
  views: number
  duration_min: number
  tags: string[]
  is_favorite: boolean
  image: Image
  has_podcast: boolean
  sections: Section[]
  documents: Documents[]
  sources: Source[]
  key_questions: Section[]
  related_stories?: RelatedStory[]
  audio_files?: AudioFile[]
  audios?: AudioFile[]
}

export interface StoryDetailProps {
  data: Discovery
}
