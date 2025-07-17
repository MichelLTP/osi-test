import { create } from "zustand"

interface Tag {
  tag: string
  id: string
}

export interface Image {
  position: "TOP" | "BOTTOM" | "RIGHT" | "LEFT"
  matching_filename?: string
  image_name?: string
  title: string
  id?: string
  url?: string
}

interface Section {
  title: string
  text: string
  image?: Image | null
  image_id?: string
  image_name?: string
  image_pos?: "TOP" | "BOTTOM" | "RIGHT" | "LEFT"
}

interface KeyQuestion {
  title: string
  text: string
  image?: Image | null
  image_id?: string
  image_name?: string
  image_pos?: "TOP" | "BOTTOM" | "RIGHT" | "LEFT"
}

interface Document {
  title: string
  matching_filename: string
}

interface Audio {
  title: string
  matching_filename: string
  audio_name?: string
  id?: string
}

interface Source {
  id: number
}

export interface ContentState {
  id: string
  title: string
  description: string
  duration_min: number
  tags: Tag[]
  image: Image | null
  sections: Section[]
  key_questions: KeyQuestion[]
  documents: Document[]
  audios: Audio[]
  sources: Source[]
  uploadImages: File[]
  uploadDocuments: File[]
  uploadAudios: File[]
  has_podcast?: boolean
  views?: number
  // Actions
  setID: (id: string) => void
  setTitle: (title: string) => void
  setDescription: (description: string) => void
  setDurationMin: (duration: number) => void
  setHeaderImage: (image: Image | null) => void

  setDocuments: (fn: (prev: Document[]) => Document[]) => void
  setAudios: (audio: Audio[]) => void
  updateAudioTitle: (index: number, newTitle: string) => void
  // Tag actions
  addTag: (newTags: Tag[]) => void
  removeTag: (tagId: string) => void
  // Section actions
  addSection: (section: Section) => void
  setSections: (sections: Section[]) => void
  removeSection: (index: number) => void
  updateSection: (index: number, section: Section) => void
  // Key Question actions
  addKeyQuestion: (question: KeyQuestion) => void
  setKeyQuestions: (questions: KeyQuestion[]) => void
  removeKeyQuestion: (index: number) => void
  updateKeyQuestion: (index: number, question: KeyQuestion) => void
  // Document actions
  addDocument: (document: Document) => void
  removeDocument: (index: number) => void
  updateDocument: (index: number, document: Document) => void
  // Audio actions
  addAudio: (audio: Audio) => void
  removeAudio: () => void
  updateAudio: (index: number, audio: Audio) => void
  // Source actions
  setSource: (fn: (prev: Source[]) => Source[]) => void
  removeSource: (sourceId: number) => void
  updateSource: (sourceId: number, source: Source) => void

  // Reset action
  resetStore: () => void

  setUploadImages: (files: File[]) => void
  setUploadDocuments: (files: File[]) => void
  setUploadAudios: (files: File[]) => void

  addUploadImage: (file: File) => void
  addUploadDocument: (file: File) => void
  addUploadAudio: (file: File) => void

  removeUploadImage: (fileName: string) => void
  removeUploadDocument: (fileName: string) => void
  removeUploadAudio: (fileName: string) => void
}

const initialState = {
  id: "",
  title: "",
  description: "",
  duration_min: 0,
  tags: [],
  image: null,
  sections: [],
  key_questions: [],
  documents: [],
  audios: [],
  sources: [],
  uploadImages: [],
  uploadDocuments: [],
  uploadAudios: [],
}

export const useAdminPanelDiscoveryStore = create<ContentState>((set) => ({
  // Initial state
  ...initialState,

  // Basic actions
  setID: (id) => set({ id }),
  setTitle: (title) => set({ title }),
  setDescription: (description) => set({ description }),
  setDurationMin: (duration_min) => set({ duration_min }),
  setHeaderImage: (image) => set({ image }),
  setDocuments: (fn) => set((state) => ({ documents: fn(state.documents) })),
  setAudios: (audios) => set({ audios }),
  updateAudioTitle: (index, newTitle) =>
    set((state) => ({
      audios: state.audios.map((audio, i) =>
        i === index ? { ...audio, title: newTitle } : audio
      ),
    })),
  // Tag actions
  addTag: (newTags) =>
    set(() => ({
      tags: newTags,
    })),
  removeTag: (tagId) =>
    set((state) => ({
      tags: state.tags.filter((tag) => tag.id !== tagId),
    })),

  // Section actions
  addSection: (section) =>
    set((state) => ({
      sections: [...state.sections, section],
    })),

  setSections: (sections: Section[]) => set({ sections }),
  removeSection: (index) =>
    set((state) => ({
      sections: state.sections.filter((_, i) => i !== index),
    })),
  updateSection: (index, updatedSection) =>
    set((state) => {
      const newSections = [...state.sections]
      newSections[index] = updatedSection
      return { sections: newSections }
    }),

  // Key Question actions
  addKeyQuestion: (question) =>
    set((state) => ({
      key_questions: [...state.key_questions, question],
    })),
  setKeyQuestions: (key_questions: KeyQuestion[]) => set({ key_questions }),
  removeKeyQuestion: (index) =>
    set((state) => ({
      key_questions: state.key_questions.filter((_, i) => i !== index),
    })),
  updateKeyQuestion: (index, question) =>
    set((state) => ({
      key_questions: state.key_questions.map((q, i) =>
        i === index ? question : q
      ),
    })),

  // Document actions
  addDocument: (document) =>
    set((state) => ({
      documents: [...state.documents, document],
    })),
  removeDocument: (title) =>
    set((state) => ({
      documents: state.documents.filter((doc) => doc.title !== title),
    })),
  updateDocument: (index, document) =>
    set((state) => ({
      documents: state.documents.map((d, i) => (i === index ? document : d)),
    })),

  // Audio actions
  addAudio: (audio) =>
    set((state) => ({
      audios: [...state.audios, audio],
    })),
  removeAudio: () =>
    set(() => ({
      audios: [],
    })),
  updateAudio: (index, audio) =>
    set((state) => ({
      audios: state.audios.map((a, i) => (i === index ? audio : a)),
    })),

  // Source actions
  setSource: (fn) => set((state) => ({ sources: fn(state.sources) })),

  removeSource: (sourceId) =>
    set((state) => ({
      sources: state.sources.filter((source) => source.id !== sourceId),
    })),
  updateSource: (sourceId, updatedSource) =>
    set((state) => ({
      sources: state.sources.map((source) =>
        source.id === sourceId ? updatedSource : source
      ),
    })),

  // Reset action
  resetStore: () => set(initialState),

  setUploadImages: (files) => set({ uploadImages: files }),
  setUploadDocuments: (files) => set({ uploadDocuments: files }),
  setUploadAudios: (files) => set({ uploadAudios: files }),

  // Add single file
  addUploadImage: (file) =>
    set((state) => ({
      uploadImages: [...state.uploadImages, file],
    })),
  addUploadDocument: (file) =>
    set((state) => ({
      uploadDocuments: [...state.uploadDocuments, file],
    })),
  addUploadAudio: (file) =>
    set((state) => ({
      uploadAudios: [...state.uploadAudios, file],
    })),

  // Remove file by name
  removeUploadImage: (fileName) =>
    set((state) => ({
      uploadImages: state.uploadImages.filter((file) => file.name !== fileName),
    })),
  removeUploadDocument: (fileName) =>
    set((state) => ({
      uploadDocuments: state.uploadDocuments.filter(
        (file) => file.name !== fileName
      ),
    })),
  removeUploadAudio: (fileName) =>
    set((state) => ({
      uploadAudios: state.uploadAudios.filter((file) => file.name !== fileName),
    })),
}))
